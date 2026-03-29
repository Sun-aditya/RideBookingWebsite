const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  logoutUser,
} = require("../../controllers/auth/userAuthController");
const { protect } = require("../../middleware/auth");

const router = express.Router();

// @desc    Register new rider
// @route   POST /api/auth/user/register
// @access  Public
// @body    { fullName, email, phone, password, confirmPassword }
// @returns { success, token, user }
router.post("/register", registerUser);

// @desc    Login rider
// @route   POST /api/auth/user/login
// @access  Public
// @body    { email, password }
// @returns { success, token, user }
router.post("/login", loginUser);

// @desc    Get logged in rider profile
// @route   GET /api/auth/user/me
// @access  Private
// @body    {}
// @returns { success, user }
router.get("/me", protect, getMe);

// @desc    Update rider profile
// @route   PUT /api/auth/user/update-profile
// @access  Private
// @body    { fullName, phone, avatar }
// @returns { success, user }
router.put("/update-profile", protect, updateProfile);

// @desc    Change rider password
// @route   PUT /api/auth/user/change-password
// @access  Private
// @body    { currentPassword, newPassword, confirmNewPassword }
// @returns { success, message }
router.put("/change-password", protect, changePassword);

// @desc    Logout rider
// @route   POST /api/auth/user/logout
// @access  Private
// @body    {}
// @returns { success, message }
router.post("/logout", protect, logoutUser);

module.exports = router;
