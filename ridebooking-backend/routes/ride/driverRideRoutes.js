const express = require("express");
const { protect, restrictTo } = require("../../middleware/auth");
const {
  getDriverActiveRide,
  getDriverRideHistory,
  getDriverEarnings,
  acceptRide,
  updateRideStatus,
  verifyRideOTP,
} = require("../../controllers/ride/driverRideController");

const router = express.Router();

// @desc    Get driver's active ride
// @route   GET /api/driver/rides/active
// @access  Private (driver)
router.get("/active", protect, restrictTo("driver"), getDriverActiveRide);

// @desc    Get driver's ride history
// @route   GET /api/driver/rides/history
// @access  Private (driver)
router.get("/history", protect, restrictTo("driver"), getDriverRideHistory);

// @desc    Get driver's earnings summary
// @route   GET /api/driver/rides/earnings
// @access  Private (driver)
router.get("/earnings", protect, restrictTo("driver"), getDriverEarnings);

// @desc    Accept requested ride
// @route   PATCH /api/driver/rides/:id/accept
// @access  Private (driver)
router.patch("/:id/accept", protect, restrictTo("driver"), acceptRide);

// @desc    Update ride status
// @route   PATCH /api/driver/rides/:id/status
// @access  Private (driver)
router.patch("/:id/status", protect, restrictTo("driver"), updateRideStatus);

// @desc    Verify ride OTP and start ride
// @route   POST /api/driver/rides/:id/verify-otp
// @access  Private (driver)
router.post("/:id/verify-otp", protect, restrictTo("driver"), verifyRideOTP);

module.exports = router;
