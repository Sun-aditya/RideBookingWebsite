const Ride = require("../../models/Ride");
const Driver = require("../../models/Driver");
const Rating = require("../../models/Rating");
const { AppError } = require("../../middleware/errorHandler");
const {
  calculateFare,
  calculateDistance,
  estimateDuration,
  getSurgeMultiplier,
} = require("../../utils/fareCalculator");

const allowedVehicleTypes = ["UberX", "Comfort", "XL", "Black"];
const allowedPaymentMethods = ["cash", "card", "wallet"];
const activeStatuses = ["requested", "accepted", "driver_arriving", "in_progress"];

/**
 * Return nearby available drivers around a pickup coordinate.
 */
const getNearbyDrivers = async (req, res, next) => {
  try {
    const { latitude, longitude, vehicleType } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return next(new AppError("latitude and longitude are required", 400));
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return next(new AppError("latitude and longitude must be valid numbers", 400));
    }

    if (vehicleType && !allowedVehicleTypes.includes(vehicleType)) {
      return next(new AppError("Invalid vehicleType", 400));
    }

    const query = {
      isAvailable: true,
      isOnline: true,
      isApproved: true,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000,
        },
      },
      ...(vehicleType ? { "vehicle.type": vehicleType } : {}),
    };

    const drivers = await Driver.find(query).select("-password -documents").limit(10);

    const driversWithDistance = drivers.map((driver) => {
      const driverLat = driver.currentLocation?.coordinates?.[1];
      const driverLng = driver.currentLocation?.coordinates?.[0];
      const distanceKm =
        typeof driverLat === "number" && typeof driverLng === "number"
          ? calculateDistance(lat, lng, driverLat, driverLng)
          : null;

      return {
        _id: driver._id,
        fullName: driver.fullName,
        avatar: driver.avatar,
        vehicle: driver.vehicle,
        averageRating: driver.averageRating,
        currentLocation: driver.currentLocation,
        distanceKm,
        estimatedArrivalMinutes: distanceKm !== null ? Math.ceil(distanceKm / 0.5) : null,
      };
    });

    console.log(`Nearby drivers fetched: ${driversWithDistance.length}`);
    return res.status(200).json({
      success: true,
      count: driversWithDistance.length,
      drivers: driversWithDistance,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return fare comparison for all vehicle types for a given trip.
 */
const getFareEstimate = async (req, res, next) => {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng, vehicleType } = req.query;

    if (pickupLat === undefined || pickupLng === undefined || dropLat === undefined || dropLng === undefined) {
      return next(new AppError("pickupLat, pickupLng, dropLat and dropLng are required", 400));
    }

    const pLat = parseFloat(pickupLat);
    const pLng = parseFloat(pickupLng);
    const dLat = parseFloat(dropLat);
    const dLng = parseFloat(dropLng);

    if ([pLat, pLng, dLat, dLng].some((n) => Number.isNaN(n))) {
      return next(new AppError("All coordinates must be valid numbers", 400));
    }

    if (vehicleType && !allowedVehicleTypes.includes(vehicleType)) {
      return next(new AppError("Invalid vehicleType", 400));
    }

    const distanceKm = calculateDistance(pLat, pLng, dLat, dLng);
    const durationMinutes = estimateDuration(distanceKm);

    const activeRides = await Ride.countDocuments({ status: { $in: ["requested", "accepted", "in_progress"] } });
    const availableDrivers = await Driver.countDocuments({ isAvailable: true, isOnline: true });
    const surgeMultiplier = getSurgeMultiplier(activeRides, availableDrivers);

    const estimates = {
      UberX: calculateFare("UberX", distanceKm, durationMinutes, surgeMultiplier),
      Comfort: calculateFare("Comfort", distanceKm, durationMinutes, surgeMultiplier),
      XL: calculateFare("XL", distanceKm, durationMinutes, surgeMultiplier),
      Black: calculateFare("Black", distanceKm, durationMinutes, surgeMultiplier),
    };

    console.log("Fare estimate generated", { distanceKm, durationMinutes, surgeMultiplier });
    return res.status(200).json({
      success: true,
      distance: distanceKm,
      duration: durationMinutes,
      surgeMultiplier,
      estimates,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Book a new ride for an authenticated rider and auto-assign nearest eligible driver.
 */
const bookRide = async (req, res, next) => {
  try {
    const { pickupLocation, dropLocation, vehicleType, paymentMethod } = req.body;

    if (!pickupLocation || !dropLocation || !vehicleType || !paymentMethod) {
      return next(new AppError("pickupLocation, dropLocation, vehicleType and paymentMethod are required", 400));
    }

    if (!pickupLocation.address || !dropLocation.address) {
      return next(new AppError("pickupLocation.address and dropLocation.address are required", 400));
    }

    const pLat = Number(pickupLocation?.coordinates?.lat);
    const pLng = Number(pickupLocation?.coordinates?.lng);
    const dLat = Number(dropLocation?.coordinates?.lat);
    const dLng = Number(dropLocation?.coordinates?.lng);

    if ([pLat, pLng, dLat, dLng].some((n) => Number.isNaN(n))) {
      return next(new AppError("pickup and drop coordinates must be valid numbers", 400));
    }

    if (!allowedVehicleTypes.includes(vehicleType)) {
      return next(new AppError("Invalid vehicleType", 400));
    }

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return next(new AppError("Invalid paymentMethod", 400));
    }

    const existingActiveRide = await Ride.findOne({
      rider: req.user._id,
      status: { $in: activeStatuses },
    });

    if (existingActiveRide) {
      return next(new AppError("You already have an active ride", 400));
    }

    const distance = calculateDistance(pLat, pLng, dLat, dLng);
    const duration = estimateDuration(distance);
    const activeRides = await Ride.countDocuments({ status: { $in: ["requested", "accepted", "in_progress"] } });
    const availableDrivers = await Driver.countDocuments({ isAvailable: true, isOnline: true });
    const surgeMultiplier = getSurgeMultiplier(activeRides, availableDrivers);
    const fare = calculateFare(vehicleType, distance, duration, surgeMultiplier);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    let ride = await Ride.create({
      rider: req.user._id,
      pickupLocation,
      dropLocation,
      vehicleType,
      paymentMethod,
      distance,
      duration,
      fare,
      otp,
      status: "requested",
    });

    const nearestDriver = await Driver.findOne({
      isAvailable: true,
      isOnline: true,
      isApproved: true,
      "vehicle.type": vehicleType,
      currentLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [pLng, pLat] },
          $maxDistance: 5000,
        },
      },
    }).select("_id fullName");

    if (nearestDriver) {
      ride.driver = nearestDriver._id;
      ride.status = "accepted";
      await ride.save();
      await Driver.findByIdAndUpdate(nearestDriver._id, { isAvailable: false });
      console.log(`Driver ${nearestDriver.fullName} auto-assigned to ride ${ride._id}`);
    }

    ride = await Ride.findById(ride._id)
      .populate("rider", "fullName phone averageRating")
      .populate("driver", "fullName phone vehicle averageRating");

    const rideResponse = ride.toObject();
    delete rideResponse.otp;

    console.log(`New ride booked: ${ride._id} by ${req.user.fullName}`);
    return res.status(201).json({
      success: true,
      message: "Ride booked successfully",
      ride: rideResponse,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetch a single ride by ID if requester is the rider or assigned driver.
 */
const getRideById = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    if (!rideId) {
      return next(new AppError("Ride ID is required", 400));
    }

    const ride = await Ride.findById(rideId)
      .populate("rider", "fullName phone avatar averageRating")
      .populate("driver", "fullName phone avatar vehicle averageRating");

    if (!ride) {
      return next(new AppError("Ride not found", 404));
    }

    const requesterId = req.user._id.toString();
    const isRider = ride.rider?._id?.toString() === requesterId;
    const isDriver = ride.driver?._id?.toString() === requesterId;

    if (!isRider && !isDriver) {
      return next(new AppError("Not authorized to view this ride", 403));
    }

    const rideResponse = ride.toObject();
    delete rideResponse.otp;

    console.log(`Ride fetched by user ${requesterId}: ${rideId}`);
    return res.status(200).json({
      success: true,
      ride: rideResponse,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Cancel a rider-owned ride if it is still cancellable.
 */
const cancelRide = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const { reason } = req.body || {};

    if (!rideId) {
      return next(new AppError("Ride ID is required", 400));
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(new AppError("Ride not found", 404));
    }

    if (ride.rider.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to cancel this ride", 403));
    }

    if (ride.status === "in_progress") {
      return next(new AppError("Cannot cancel a ride that is in progress", 400));
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
      return next(new AppError(`Ride is already ${ride.status}`, 400));
    }

    if (!["requested", "accepted"].includes(ride.status)) {
      return next(new AppError(`Ride cannot be cancelled from status ${ride.status}`, 400));
    }

    ride.status = "cancelled";
    ride.cancelledBy = "rider";
    ride.cancellationReason = reason || "Cancelled by rider";
    await ride.save();

    if (ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
    }

    const rideResponse = ride.toObject();
    delete rideResponse.otp;

    console.log(`Ride cancelled by rider ${req.user._id}: ${rideId}`);
    return res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
      ride: rideResponse,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return paginated ride history for the authenticated rider.
 */
const getRideHistory = async (req, res, next) => {
  try {
    const status = req.query.status;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = { rider: req.user._id };
    if (status) {
      filter.status = status;
    }

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("driver", "fullName avatar vehicle averageRating"),
      Ride.countDocuments(filter),
    ]);

    const sanitizedRides = rides.map((ride) => {
      const obj = ride.toObject();
      delete obj.otp;
      return obj;
    });

    console.log(`Ride history fetched for rider ${req.user._id}: ${sanitizedRides.length} records`);
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
 * Return current active ride for the authenticated rider.
 */
const getActiveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({
      rider: req.user._id,
      status: { $nin: ["completed", "cancelled"] },
    })
      .sort({ createdAt: -1 })
      .populate("rider", "fullName phone avatar averageRating")
      .populate("driver", "fullName phone avatar vehicle averageRating");

    if (!ride) {
      return res.status(200).json({
        success: true,
        activeRide: null,
      });
    }

    const rideResponse = ride.toObject();
    delete rideResponse.otp;

    console.log(`Active ride fetched for rider ${req.user._id}`);
    return res.status(200).json({
      success: true,
      activeRide: rideResponse,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Submit rider rating for a completed ride and recalculate driver average rating.
 */
const rateRide = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const { rating, comment } = req.body;

    if (!rideId) {
      return next(new AppError("Ride ID is required", 400));
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return next(new AppError("rating must be an integer between 1 and 5", 400));
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(new AppError("Ride not found", 404));
    }

    if (ride.rider.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to rate this ride", 403));
    }

    if (ride.status !== "completed") {
      return next(new AppError("Only completed rides can be rated", 400));
    }

    if (!ride.driver) {
      return next(new AppError("Cannot rate ride without assigned driver", 400));
    }

    const existingRating = await Rating.findOne({
      ride: rideId,
      ratedBy: req.user._id,
      ratedByType: "rider",
    });

    if (existingRating) {
      return next(new AppError("You have already rated this ride", 400));
    }

    await Rating.create({
      ride: rideId,
      ratedBy: req.user._id,
      ratedTo: ride.driver,
      ratedByType: "rider",
      ratedToType: "driver",
      rating: numericRating,
      comment,
    });

    const driverRatings = await Rating.find({ ratedTo: ride.driver, ratedToType: "driver" }).select("rating");
    const totalRating = driverRatings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = driverRatings.length > 0 ? Number((totalRating / driverRatings.length).toFixed(2)) : 5;

    await Driver.findByIdAndUpdate(ride.driver, { averageRating });

    console.log(`Ride rated by rider ${req.user._id} for ride ${rideId}`);
    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNearbyDrivers,
  getFareEstimate,
  bookRide,
  getRideById,
  cancelRide,
  getRideHistory,
  getActiveRide,
  rateRide,
};
