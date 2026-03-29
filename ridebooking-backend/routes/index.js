const express = require("express");
const userAuthRoutes = require("./auth/userAuthRoutes");
const driverAuthRoutes = require("./auth/driverAuthRoutes");
const rideRoutes = require("./ride/rideRoutes");
const driverRideRoutes = require("./ride/driverRideRoutes");

const router = express.Router();

router.use("/auth/user", userAuthRoutes);
router.use("/auth/driver", driverAuthRoutes);
router.use("/rides", rideRoutes);
router.use("/driver/rides", driverRideRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API healthy",
    timestamp: new Date(),
  });
});

module.exports = router;
