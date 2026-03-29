const express = require("express");
const { protect, restrictTo } = require("../../middleware/auth");
const {
  getNearbyDrivers,
  getFareEstimate,
  bookRide,
  getRideById,
  cancelRide,
  getRideHistory,
  getActiveRide,
  rateRide,
} = require("../../controllers/ride/rideController");

const router = express.Router();

// @desc    Get nearby available drivers
// @route   GET /api/rides/nearby-drivers
// @access  Public (no auth needed for fare estimate browsing)
router.get("/nearby-drivers", getNearbyDrivers);

// @desc    Get fare estimate for a trip
// @route   GET /api/rides/fare-estimate
// @access  Public
router.get("/fare-estimate", getFareEstimate);

// @desc    Book a new ride
// @route   POST /api/rides/book
// @access  Private (rider)
router.post("/book", protect, restrictTo("rider"), bookRide);

// @desc    Get rider's active ride
// @route   GET /api/rides/active
// @access  Private (rider)
router.get("/active", protect, restrictTo("rider"), getActiveRide);

// @desc    Get rider's ride history
// @route   GET /api/rides/history
// @access  Private (rider)
router.get("/history", protect, restrictTo("rider"), getRideHistory);

// @desc    Get single ride by ID
// @route   GET /api/rides/:id
// @access  Private
router.get("/:id", protect, getRideById);

// @desc    Cancel a ride
// @route   PATCH /api/rides/:id/cancel
// @access  Private (rider)
router.patch("/:id/cancel", protect, restrictTo("rider"), cancelRide);

// @desc    Rate a completed ride
// @route   POST /api/rides/:id/rate
// @access  Private (rider)
router.post("/:id/rate", protect, restrictTo("rider"), rateRide);

module.exports = router;
