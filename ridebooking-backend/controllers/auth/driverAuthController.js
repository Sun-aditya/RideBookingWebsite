const Driver = require("../../models/Driver");
const { AppError } = require("../../middleware/errorHandler");
const { sendTokenResponse } = require("../../utils/generateToken");
const {
  validateEmail,
  validatePhone,
  validatePassword,
  checkRequiredFields,
} = require("../../utils/validateFields");

const allowedVehicleTypes = ["UberX", "Comfort", "XL", "Black"];

const registerDriver = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, confirmPassword, vehicle } = req.body;

    const missingFields = checkRequiredFields(
      ["fullName", "email", "phone", "password", "confirmPassword", "vehicle"],
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

    if (!vehicle || typeof vehicle !== "object") {
      return next(new AppError("Vehicle details are required", 400));
    }

    if (!allowedVehicleTypes.includes(vehicle.type)) {
      return next(new AppError("Invalid vehicle type", 400));
    }

    const existingEmail = await Driver.findOne({ email });
    if (existingEmail) {
      return next(new AppError("Email already registered", 400));
    }

    const existingPhone = await Driver.findOne({ phone });
    if (existingPhone) {
      return next(new AppError("Phone already registered", 400));
    }

    const driver = await Driver.create({
      fullName,
      email,
      phone,
      password,
      vehicle,
      role: "driver",
      isApproved: false,
    });

    console.log(`New driver registered: ${driver.email}`);
    return res.status(201).json({
      success: true,
      message: "Driver registered successfully. Await admin approval.",
      driver: {
        _id: driver._id,
        fullName: driver.fullName,
        email: driver.email,
        phone: driver.phone,
        vehicle: driver.vehicle,
        isApproved: driver.isApproved,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const loginDriver = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const missingFields = checkRequiredFields(["email", "password"], req.body);
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400));
    }

    const driver = await Driver.findOne({ email }).select("+password");
    if (!driver) {
      return next(new AppError("Invalid email or password", 401));
    }

    const isMatch = await driver.matchPassword(password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password", 401));
    }

    if (!driver.isApproved) {
      return next(new AppError("Your account is pending admin approval", 403));
    }

    if (!driver.isVerified) {
      return next(new AppError("Please complete your profile verification", 403));
    }

    console.log(`Driver logged in: ${driver.email}`);
    return sendTokenResponse(driver, 200, res);
  } catch (error) {
    return next(error);
  }
};

const getDriverMe = async (req, res, next) => {
  try {
    console.log(`Fetched driver profile: ${req.user.email || req.user._id}`);
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return next(error);
  }
};

const updateDriverLocation = async (req, res, next) => {
  try {
    const { longitude, latitude } = req.body;

    if (typeof longitude !== "number" || typeof latitude !== "number") {
      return next(new AppError("Longitude and latitude must be valid numbers", 400));
    }

    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      {
        currentLocation: { type: "Point", coordinates: [longitude, latitude] },
        isOnline: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!driver) {
      return next(new AppError("Driver not found", 404));
    }

    console.log(`Driver location updated: ${driver.email} -> [${longitude}, ${latitude}]`);
    return res.status(200).json({
      success: true,
      message: "Location updated",
      location: {
        longitude,
        latitude,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const toggleOnlineStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body;

    if (typeof isOnline !== "boolean") {
      return next(new AppError("isOnline must be a boolean", 400));
    }

    const driver = await Driver.findByIdAndUpdate(
      req.user._id,
      {
        isOnline,
        isAvailable: isOnline,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!driver) {
      return next(new AppError("Driver not found", 404));
    }

    console.log(`Driver online status changed: ${driver.email} -> ${isOnline}`);
    return res.status(200).json({
      success: true,
      message: `Driver is now ${isOnline ? "online" : "offline"}`,
      isOnline,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerDriver,
  loginDriver,
  getDriverMe,
  updateDriverLocation,
  toggleOnlineStatus,
};
