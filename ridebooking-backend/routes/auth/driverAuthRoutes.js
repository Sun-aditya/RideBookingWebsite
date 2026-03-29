const express = require("express");
const {
  registerDriver,
  loginDriver,
  getDriverMe,
  updateDriverLocation,
  toggleOnlineStatus,
} = require("../../controllers/auth/driverAuthController");
const { protect, restrictTo } = require("../../middleware/auth");

const router = express.Router();

// @desc    Register new driver
// @route   POST /api/auth/driver/register
// @access  Public
// @body    { fullName, email, phone, password, confirmPassword, vehicle }
// @returns { success, message, driver }
router.post("/register", registerDriver);

// @desc    Login driver
// @route   POST /api/auth/driver/login
// @access  Public
// @body    { email, password }
// @returns { success, token, user }
router.post("/login", loginDriver);

// @desc    Get logged in driver profile
// @route   GET /api/auth/driver/me
// @access  Private (driver)
// @body    {}
// @returns { success, user }
router.get("/me", protect, restrictTo("driver"), getDriverMe);

// @desc    Update driver location
// @route   PUT /api/auth/driver/update-location
// @access  Private (driver)
// @body    { longitude, latitude }
// @returns { success, message, location }
router.put("/update-location", protect, restrictTo("driver"), updateDriverLocation);

// @desc    Toggle driver online status
// @route   PUT /api/auth/driver/toggle-status
// @access  Private (driver)
// @body    { isOnline }
// @returns { success, message, isOnline }
router.put("/toggle-status", protect, restrictTo("driver"), toggleOnlineStatus);

module.exports = router;
