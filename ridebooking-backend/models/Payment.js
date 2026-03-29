const mongoose = require("mongoose");

/**
 * Payment Schema
 * Records financial transactions for rides in the RideFlow app
 * Tracks payment status, gateway responses, and refunds
 */
const paymentSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: [true, "Ride reference is required"],
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Rider is required"],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Driver is required"],
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    method: {
      type: String,
      enum: ["cash", "card", "wallet"],
      required: [true, "Payment method is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
      trim: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for frequently queried fields
paymentSchema.index({ ride: 1 });
paymentSchema.index({ rider: 1 });
paymentSchema.index({ driver: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
