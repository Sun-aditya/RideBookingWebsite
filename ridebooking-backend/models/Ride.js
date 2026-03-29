const mongoose = require("mongoose");

/**
 * Ride Schema
 * Represents a completed or in-progress ride in the RideFlow app
 * Links rider and driver, tracks location, fare, payment, and OTP verification
 */
const rideSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Rider is required"],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, "Pickup address is required"],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    dropLocation: {
      address: {
        type: String,
        required: [true, "Drop address is required"],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    vehicleType: {
      type: String,
      enum: ["UberX", "Comfort", "XL", "Black"],
      required: [true, "Vehicle type is required"],
    },
    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "driver_arriving",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },
    fare: {
      baseFare: Number,
      distanceFare: Number,
      timeFare: Number,
      surgeMultiplier: {
        type: Number,
        default: 1,
        min: 1,
      },
      totalFare: Number,
      currency: {
        type: String,
        default: "INR",
      },
    },
    distance: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    actualDuration: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "wallet"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    otp: {
      type: String,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ["rider", "driver", "system" , null],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    startTime: Date,
    endTime: Date,
  },
  { timestamps: true }
);

// Indexes for frequently queried fields
rideSchema.index({ rider: 1 });
rideSchema.index({ driver: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ createdAt: -1 });
rideSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Ride", rideSchema);
