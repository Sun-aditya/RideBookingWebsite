const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Driver = require("../models/Driver");
const { AppError } = require("./errorHandler");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError("Not authorized, no token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let currentUser;
    if (decoded.role === "rider" || decoded.role === "admin") {
      currentUser = await User.findById(decoded.id);
    } else if (decoded.role === "driver") {
      currentUser = await Driver.findById(decoded.id);
    }

    if (!currentUser) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let currentUser;
    if (decoded.role === "rider" || decoded.role === "admin") {
      currentUser = await User.findById(decoded.id);
    } else if (decoded.role === "driver") {
      currentUser = await Driver.findById(decoded.id);
    }

    if (currentUser) {
      req.user = currentUser;
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  restrictTo,
  optionalAuth,
};
