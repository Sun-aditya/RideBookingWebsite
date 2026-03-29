const Driver = require("../../models/Driver");
const Ride = require("../../models/Ride");

const locationHandler = (io, socket, connectedRiders, connectedDrivers) => {
  /**
   * Triggered by driver every few seconds to publish latest location.
   */
  socket.on("location:driver_update", async (data = {}) => {
    try {
      const { latitude, longitude, rideId } = data;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        socket.emit("error", { message: "latitude and longitude must be valid numbers" });
        return;
      }

      await Driver.findByIdAndUpdate(socket.userId, {
        currentLocation: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        isOnline: true,
      });

      if (rideId) {
        io.to(`ride_${rideId}`).emit("location:driver_moved", {
          driverId: socket.userId,
          latitude,
          longitude,
          timestamp: new Date(),
        });

        const ride = await Ride.findById(rideId).select("rider");
        if (ride?.rider) {
          io.to(`user_${ride.rider.toString()}`).emit("location:driver_moved", {
            driverId: socket.userId,
            latitude,
            longitude,
            timestamp: new Date(),
          });
        }
      }

      socket.emit("location:updated", {
        message: "Location updated",
        coordinates: { latitude, longitude },
      });

      console.log(`Driver location updated: ${socket.userId} (${latitude}, ${longitude})`);
    } catch (error) {
      console.log("location:driver_update error", error.message);
      socket.emit("error", { message: "Failed to update driver location" });
    }
  });

  /**
   * Triggered by rider to store latest rider-side location in memory.
   */
  socket.on("location:rider_update", async (data = {}) => {
    try {
      const { latitude, longitude } = data;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        socket.emit("error", { message: "latitude and longitude must be valid numbers" });
        return;
      }

      socket.riderLocation = {
        latitude,
        longitude,
        timestamp: new Date(),
      };

      socket.emit("location:rider_received", {
        coordinates: { latitude, longitude },
      });

      console.log(`Rider location stored in memory: ${socket.userId}`);
    } catch (error) {
      console.log("location:rider_update error", error.message);
      socket.emit("error", { message: "Failed to capture rider location" });
    }
  });

  /**
   * Triggered by rider to fetch current driver location from DB.
   */
  socket.on("location:get_driver", async (data = {}) => {
    try {
      const { driverId } = data;
      if (!driverId) {
        socket.emit("error", { message: "driverId is required" });
        return;
      }

      const driver = await Driver.findById(driverId).select("currentLocation");
      if (!driver || !driver.currentLocation || !Array.isArray(driver.currentLocation.coordinates)) {
        socket.emit("error", { message: "Driver not found" });
        return;
      }

      const [longitude, latitude] = driver.currentLocation.coordinates;
      socket.emit("location:driver_position", {
        driverId,
        coordinates: { latitude, longitude },
        timestamp: new Date(),
      });

      console.log(`Driver position fetched: ${driverId}`);
    } catch (error) {
      console.log("location:get_driver error", error.message);
      socket.emit("error", { message: "Failed to fetch driver location" });
    }
  });

  /**
   * Triggered by rider to start tracking for a specific ride.
   */
  socket.on("location:start_tracking", async (data = {}) => {
    try {
      const { rideId, driverId } = data;
      if (!rideId || !driverId) {
        socket.emit("error", { message: "rideId and driverId are required" });
        return;
      }

      socket.join(`ride_${rideId}`);

      io.to(`user_${driverId}`).emit("location:tracking_started", {
        message: "Rider is now tracking your location",
        rideId,
      });

      console.log(`Tracking started for ride ${rideId} by rider ${socket.userId}`);
    } catch (error) {
      console.log("location:start_tracking error", error.message);
      socket.emit("error", { message: "Failed to start tracking" });
    }
  });

  /**
   * Triggered when tracking ends to leave ride room and notify participants.
   */
  socket.on("location:stop_tracking", async (data = {}) => {
    try {
      const { rideId } = data;
      if (!rideId) {
        socket.emit("error", { message: "rideId is required" });
        return;
      }

      socket.leave(`ride_${rideId}`);
      io.to(`ride_${rideId}`).emit("location:tracking_stopped", { rideId });

      console.log(`Tracking stopped for ride ${rideId} by user ${socket.userId}`);
    } catch (error) {
      console.log("location:stop_tracking error", error.message);
      socket.emit("error", { message: "Failed to stop tracking" });
    }
  });
};

module.exports = locationHandler;
