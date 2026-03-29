const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Driver = require("../../models/Driver");

const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = socket.handshake?.auth?.token || socket.handshake?.headers?.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "").trim();
    }

    if (!token) {
      return next(new Error("Authentication required — no token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    let user = null;
    if (role === "rider" || role === "admin") {
      user = await User.findById(id).select("-password");
    } else if (role === "driver") {
      user = await Driver.findById(id).select("-password");
    }

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    socket.role = role;
    socket.userId = user._id.toString();
    return next();
  } catch (error) {
    return next(new Error(error.message || "Socket authentication failed"));
  }
};

module.exports = socketAuthMiddleware;
