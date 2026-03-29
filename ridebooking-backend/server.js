const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./config/db");
const routes = require("./routes/index");
const { globalErrorHandler } = require("./middleware/errorHandler");
const initializeSocket = require("./socket/socketManager");

// Load environment variables
dotenv.config();

// Import models to ensure they're registered
const User = require("./models/User");
const Driver = require("./models/Driver");
const Ride = require("./models/Ride");
const Payment = require("./models/Payment");
const Rating = require("./models/Rating");

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware - Security
app.use(helmet());

// Middleware - CORS
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "*" : ["https://yourdomain.com"],
    credentials: true,
  })
);

// Middleware - Logging
app.use(morgan("dev"));

// Middleware - Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use("/api", routes);

// Register models output
console.log("\n✓ Registered Mongoose Models:");
console.log("  - User");
console.log("  - Driver");
console.log("  - Ride");
console.log("  - Payment");
console.log("  - Rating\n");

// ==================== ROUTES ====================

/**
 * Root Route - API Health Check
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RideBooking API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health Check Route
 */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

/**
 * 404 Handler for undefined routes
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last middleware)
app.use(globalErrorHandler);

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const server = http.createServer(app);
const { io, emitToUser } = initializeSocket(server);

global.io = io;
global.emitToUser = emitToUser;

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`📍 http://localhost:${PORT}\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n⚠️  SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("✓ Server closed");
    process.exit(0);
  });
});

module.exports = app;
module.exports.io = io;
module.exports.emitToUser = emitToUser;
