const User = require("../../models/User");
const { AppError } = require("../../middleware/errorHandler");
const { sendTokenResponse } = require("../../utils/generateToken");
const {
  validateEmail,
  validatePhone,
  validatePassword,
  checkRequiredFields,
} = require("../../utils/validateFields");

const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    const missingFields = checkRequiredFields(
      ["fullName", "email", "phone", "password", "confirmPassword"],
      req.body
    );
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400));
    }

    if (!validateEmail(email)) {
      return next(new AppError("Please provide a valid email", 400));
    }

    if (!validatePhone(phone)) {
      return next(new AppError("Please provide a valid phone number", 400));
    }

    if (!validatePassword(password)) {
      return next(new AppError("Password must be at least 6 characters", 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError("Confirm password does not match", 400));
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return next(new AppError("Email already registered", 400));
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return next(new AppError("Phone already registered", 400));
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "rider",
    });

    console.log(`New rider registered: ${user.email}`);
    return sendTokenResponse(user, 201, res);
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const missingFields = checkRequiredFields(["email", "password"], req.body);
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    console.log(`Rider logged in: ${user.email}`);
    return sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    console.log(`Fetched rider profile: ${user.email}`);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, avatar } = req.body;

    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    console.log(`Updated rider profile: ${user.email}`);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const missingFields = checkRequiredFields(
      ["currentPassword", "newPassword", "confirmNewPassword"],
      req.body
    );
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400));
    }

    if (!validatePassword(newPassword)) {
      return next(new AppError("New password must be at least 6 characters", 400));
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return next(new AppError("Current password is incorrect", 401));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new AppError("Confirm new password does not match", 400));
    }

    user.password = newPassword;
    await user.save();

    console.log(`Rider password changed: ${user.email}`);
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    console.log(`Rider logged out: ${req.user.email || req.user._id}`);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  logoutUser,
};
