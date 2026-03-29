const Ride = require("../../models/Ride");
const User = require("../../models/User");
const Driver = require("../../models/Driver");
const { AppError } = require("../../middleware/errorHandler");

/**
 * Return active ride for authenticated driver.
 */
const getDriverActiveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({
      driver: req.user._id,
      status: { $nin: ["completed", "cancelled"] },
    })
      .sort({ createdAt: -1 })
      .populate("rider", "fullName phone avatar averageRating");

    const activeRide = ride
      ? (() => {
          const obj = ride.toObject();
          delete obj.otp;
          return obj;
        })()
      : null;

    console.log(`Driver active ride fetched: ${req.user._id}`);
    return res.status(200).json({
      success: true,
      activeRide,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Accept an unassigned requested ride for the authenticated driver.
 */
const acceptRide = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    if (!rideId) {
      return next(new AppError("Ride ID is required", 400));
    }

    const ride = await Ride.findOne({ _id: rideId, status: "requested" });
    if (!ride) {
      return next(new AppError("Ride not found or already accepted", 404));
    }

    const activeRide = await Ride.findOne({
      driver: req.user._id,
      status: { $in: ["accepted", "driver_arriving", "in_progress"] },
    });

    if (activeRide) {
      return next(new AppError("You already have an active ride", 400));
    }

    ride.driver = req.user._id;
    ride.status = "accepted";
    await ride.save();

    await Driver.findByIdAndUpdate(req.user._id, { isAvailable: false });

    const populatedRide = await Ride.findById(ride._id)
      .populate("rider", "fullName phone avatar averageRating")
      .populate("driver", "fullName phone avatar vehicle averageRating");

    const rideResponse = populatedRide.toObject();
    delete rideResponse.otp;

    console.log(`Ride accepted by driver ${req.user._id}: ${ride._id}`);
    return res.status(200).json({
      success: true,
      ride: rideResponse,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update ride status with strict driver-side status transition rules.
 */
const updateRideStatus = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const { newStatus } = req.body;

    if (!rideId) {
      return next(new AppError("Ride ID is required", 400));
    }

    if (!newStatus) {
      return next(new AppError("newStatus is required", 400));
    }

    const ride = await Ride.findOne({ _id: rideId, driver: req.user._id });
    if (!ride) {
      return next(new AppError("Ride not found", 404));
    }

    const transitions = {
      accepted: ["driver_arriving"],
      driver_arriving: ["in_progress"],
      in_progress: ["completed"],
    };

    const allowedNext = transitions[ride.status] || [];
    if (!allowedNext.includes(newStatus)) {
      return next(new AppError(`Invalid status transition from ${ride.status} to ${newStatus}`, 400));
    }

    if (ride.status === "driver_arriving" && newStatus === "in_progress") {
      ride.startTime = new Date();
    }

    if (ride.status === "in_progress" && newStatus === "completed") {
      ride.endTime = new Date();

      if (ride.startTime) {
        const actualDuration = Math.ceil((ride.endTime.getTime() - ride.startTime.getTime()) / (1000 * 60));
        ride.actualDuration = actualDuration;
      }

      if (ride.paymentMethod === "cash") {
        ride.paymentStatus = "completed";
      }

      await Promise.all([
        Driver.findByIdAndUpdate(req.user._id, {
          $set: { isAvailable: true },
          $inc: {
            totalRides: 1,
            totalEarnings: Number(ride.fare?.totalFare || 0),
          },
        }),
        User.findByIdAndUpdate(ride.rider, { $inc: { totalRides: 1 } }),
      ]);
    }

    ride.status = newStatus;
    await ride.save();

    const rideResponse = ride.toObject();
    delete rideResponse.otp;

    console.log(`Ride status updated by driver ${req.user._id}: ${rideId} -> ${newStatus}`);
    return res.status(200).json({
      success: true,
      message: `Ride status updated to ${newStatus}`,
      ride: rideResponse,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Verify rider OTP to start ride.
 */
const verifyRideOTP = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const { otp } = req.body;

    if (!rideId) {
      return next(new AppError("Ride ID is required", 400));
    }

    if (!otp) {
      return next(new AppError("otp is required", 400));
    }

    const ride = await Ride.findOne({ _id: rideId, driver: req.user._id });
    if (!ride) {
      return next(new AppError("Ride not found", 404));
    }

    if (ride.otp !== String(otp)) {
      return next(new AppError("Invalid OTP", 400));
    }

    ride.status = "in_progress";
    ride.startTime = new Date();
    await ride.save();

    console.log(`Ride OTP verified by driver ${req.user._id}: ${rideId}`);
    return res.status(200).json({
      success: true,
      message: "OTP verified, ride started",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return paginated ride history for authenticated driver.
 */
const getDriverRideHistory = async (req, res, next) => {
  try {
    const status = req.query.status;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { driver: req.user._id };
    if (status) {
      filter.status = status;
    }

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("rider", "fullName avatar averageRating"),
      Ride.countDocuments(filter),
    ]);

    const sanitizedRides = rides.map((ride) => {
      const obj = ride.toObject();
      delete obj.otp;
      return obj;
    });

    console.log(`Driver ride history fetched for ${req.user._id}: ${sanitizedRides.length} records`);
    return res.status(200).json({
      success: true,
      count: sanitizedRides.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      rides: sanitizedRides,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return earnings summary for authenticated driver by period.
 */
const getDriverEarnings = async (req, res, next) => {
  try {
    const period = req.query.period || "today";
    const validPeriods = ["today", "week", "month"];
    if (!validPeriods.includes(period)) {
      return next(new AppError("period must be one of: today, week, month", 400));
    }

    const now = new Date();
    let startDate = new Date(now);

    if (period === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const rides = await Ride.find({
      driver: req.user._id,
      status: "completed",
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .populate("rider", "fullName avatar averageRating");

    const totalEarnings = rides.reduce((sum, ride) => sum + Number(ride.fare?.totalFare || 0), 0);
    const totalRides = rides.length;
    const averageFare = totalRides > 0 ? Number((totalEarnings / totalRides).toFixed(2)) : 0;

    const sanitizedRides = rides.map((ride) => {
      const obj = ride.toObject();
      delete obj.otp;
      return obj;
    });

    console.log(`Driver earnings fetched for ${req.user._id} period=${period}`);
    return res.status(200).json({
      success: true,
      period,
      totalEarnings,
      totalRides,
      averageFare,
      rides: sanitizedRides,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDriverActiveRide,
  acceptRide,
  updateRideStatus,
  verifyRideOTP,
  getDriverRideHistory,
  getDriverEarnings,
};
