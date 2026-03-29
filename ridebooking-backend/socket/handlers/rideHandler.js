const Ride = require("../../models/Ride");
const Driver = require("../../models/Driver");

const rideHandler = (io, socket, connectedRiders, connectedDrivers) => {
  /**
   * Triggered by rider after booking to notify assigned driver and create ride room linkage.
   */
  socket.on("ride:request", async (data = {}) => {
    try {
      const { rideId } = data;
      if (!rideId) {
        socket.emit("error", { message: "rideId is required" });
        return;
      }

      const ride = await Ride.findById(rideId)
        .populate("rider", "fullName phone avatar averageRating")
        .populate("driver", "fullName phone avatar vehicle averageRating");

      if (!ride) {
        socket.emit("error", { message: "Ride not found" });
        return;
      }

      socket.join(`ride_${rideId}`);

      if (ride.driver?._id) {
        io.to(`user_${ride.driver._id}`).emit("ride:new_request", {
          rideId: ride._id,
          rider: {
            name: ride.rider?.fullName,
            phone: ride.rider?.phone,
            avatar: ride.rider?.avatar,
            rating: ride.rider?.averageRating,
          },
          pickup: ride.pickupLocation,
          drop: ride.dropLocation,
          fare: ride.fare?.totalFare,
          vehicleType: ride.vehicleType,
          distance: ride.distance,
          otp: ride.otp,
        });
      }

      const rideResponse = ride.toObject();
      if (rideResponse.status === "in_progress" || rideResponse.status === "completed") {
        delete rideResponse.otp;
      }

      socket.emit("ride:requested", {
        message: "Looking for drivers...",
        ride: rideResponse,
      });

      console.log(`Ride request event: ${rideId}`);
    } catch (error) {
      console.log("ride:request error", error.message);
      socket.emit("error", { message: "Failed to process ride request" });
    }
  });

  /**
   * Triggered by driver to accept a requested ride and notify rider/ride room.
   */
  socket.on("ride:accepted", async (data = {}) => {
    try {
      const { rideId } = data;
      if (!rideId) {
        socket.emit("error", { message: "rideId is required" });
        return;
      }

      const ride = await Ride.findById(rideId)
        .populate("rider", "fullName phone avatar averageRating")
        .populate("driver", "fullName phone avatar vehicle averageRating");

      if (!ride) {
        socket.emit("error", { message: "Ride not found" });
        return;
      }

      ride.status = "accepted";
      ride.driver = socket.userId;
      await ride.save();

      await Driver.findByIdAndUpdate(socket.userId, { isAvailable: false, isOnline: true });

      const updatedRide = await Ride.findById(rideId)
        .populate("rider", "fullName phone avatar averageRating")
        .populate("driver", "fullName phone avatar vehicle averageRating");

      socket.join(`ride_${rideId}`);

      io.to(`ride_${rideId}`).emit("ride:status_update", {
        rideId,
        status: "accepted",
        driver: {
          name: updatedRide.driver?.fullName,
          phone: updatedRide.driver?.phone,
          vehicle: updatedRide.driver?.vehicle,
          rating: updatedRide.driver?.averageRating,
        },
        message: "Driver is on the way!",
      });

      const estimatedArrival = updatedRide.distance ? Math.ceil(updatedRide.distance / 0.5) : 5;

      io.to(`user_${updatedRide.rider._id}`).emit("ride:driver_assigned", {
        rideId,
        driver: {
          name: updatedRide.driver?.fullName,
          phone: updatedRide.driver?.phone,
          avatar: updatedRide.driver?.avatar,
          vehicle: updatedRide.driver?.vehicle,
          rating: updatedRide.driver?.averageRating,
        },
        estimatedArrival,
      });

      console.log(`Ride accepted event: ${rideId} by driver ${socket.userId}`);
    } catch (error) {
      console.log("ride:accepted error", error.message);
      socket.emit("error", { message: "Failed to accept ride" });
    }
  });

  /**
   * Triggered by driver to push status transitions and notify ride participants.
   */
  socket.on("ride:status_changed", async (data = {}) => {
    try {
      const { rideId, newStatus } = data;
      const allowedStatuses = ["driver_arriving", "in_progress", "completed"];

      if (!rideId || !newStatus) {
        socket.emit("error", { message: "rideId and newStatus are required" });
        return;
      }

      if (!allowedStatuses.includes(newStatus)) {
        socket.emit("error", { message: "Invalid status update" });
        return;
      }

      const ride = await Ride.findById(rideId).populate("rider", "fullName phone avatar averageRating");
      if (!ride) {
        socket.emit("error", { message: "Ride not found" });
        return;
      }

      ride.status = newStatus;
      if (newStatus === "in_progress") {
        ride.startTime = new Date();
        ride.otp = null;
      }
      if (newStatus === "completed") {
        ride.endTime = new Date();
        if (ride.startTime) {
          ride.actualDuration = Math.ceil((ride.endTime.getTime() - ride.startTime.getTime()) / (1000 * 60));
        }
      }
      await ride.save();

      const statusMessages = {
        driver_arriving: "Driver is arriving at your location",
        in_progress: "Your ride has started",
        completed: "Ride completed! Thank you for riding with us",
      };

      io.to(`ride_${rideId}`).emit("ride:status_update", {
        rideId,
        status: newStatus,
        message: statusMessages[newStatus],
        timestamp: new Date(),
      });

      if (newStatus === "completed") {
        io.to(`user_${ride.rider._id}`).emit("ride:completed", {
          rideId,
          fare: {
            totalFare: ride.fare?.totalFare,
            currency: ride.fare?.currency || "INR",
            distance: ride.distance,
            duration: ride.actualDuration || ride.duration,
          },
          message: "Ride completed! Thank you for riding with us",
        });
      }

      console.log(`Ride status changed event: ${rideId} -> ${newStatus}`);
    } catch (error) {
      console.log("ride:status_changed error", error.message);
      socket.emit("error", { message: "Failed to update ride status" });
    }
  });

  /**
   * Triggered by rider or driver to cancel ride and notify everyone in ride room.
   */
  socket.on("ride:cancelled", async (data = {}) => {
    try {
      const { rideId, reason, cancelledBy } = data;

      if (!rideId || !cancelledBy) {
        socket.emit("error", { message: "rideId and cancelledBy are required" });
        return;
      }

      const ride = await Ride.findById(rideId);
      if (!ride) {
        socket.emit("error", { message: "Ride not found" });
        return;
      }

      ride.status = "cancelled";
      ride.cancelledBy = cancelledBy;
      ride.cancellationReason = reason || "Ride cancelled";
      await ride.save();

      if (ride.driver) {
        await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
      }

      io.to(`ride_${rideId}`).emit("ride:cancelled", {
        rideId,
        cancelledBy,
        reason: reason || "Ride cancelled",
        message: "Ride has been cancelled",
      });

      console.log(`Ride cancelled event: ${rideId} by ${cancelledBy}`);
    } catch (error) {
      console.log("ride:cancelled error", error.message);
      socket.emit("error", { message: "Failed to cancel ride" });
    }
  });

  /**
   * Triggered by driver to verify rider OTP and start ride.
   */
  socket.on("ride:otp_verify", async (data = {}) => {
    try {
      const { rideId, otp } = data;

      if (!rideId || !otp) {
        socket.emit("error", { message: "rideId and otp are required" });
        return;
      }

      const ride = await Ride.findById(rideId);
      if (!ride) {
        socket.emit("error", { message: "Ride not found" });
        return;
      }

      if (ride.otp !== String(otp)) {
        socket.emit("ride:otp_error", { message: "Invalid OTP" });
        return;
      }

      ride.status = "in_progress";
      ride.startTime = new Date();
      ride.otp = null;
      await ride.save();

      io.to(`ride_${rideId}`).emit("ride:otp_verified", {
        message: "OTP verified, ride started!",
        startTime: ride.startTime,
      });

      console.log(`Ride OTP verified event: ${rideId}`);
    } catch (error) {
      console.log("ride:otp_verify error", error.message);
      socket.emit("error", { message: "Failed to verify OTP" });
    }
  });

  /**
   * Triggered by rider for emergency alerts during active ride.
   */
  socket.on("ride:sos", async (data = {}) => {
    try {
      const { rideId, location } = data;
      if (!rideId) {
        socket.emit("error", { message: "rideId is required" });
        return;
      }

      const ride = await Ride.findById(rideId).populate("rider", "fullName phone avatar");
      if (!ride) {
        socket.emit("error", { message: "Ride not found" });
        return;
      }

      console.log(
        `SOS ALERT - Ride: ${rideId}, Rider: ${ride.rider?.fullName}, Location: ${JSON.stringify(location || {})}`
      );

      io.to("admin_room").emit("sos:alert", {
        rideId,
        rider: {
          id: ride.rider?._id,
          name: ride.rider?.fullName,
          phone: ride.rider?.phone,
        },
        location: location || null,
        timestamp: new Date(),
      });

      socket.emit("sos:received", {
        message: "SOS received, help is on the way",
      });
    } catch (error) {
      console.log("ride:sos error", error.message);
      socket.emit("error", { message: "Failed to process SOS" });
    }
  });
};

module.exports = rideHandler;
