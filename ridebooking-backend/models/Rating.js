const mongoose = require("mongoose");

/**
 * Rating Schema
 * Records user and driver ratings after completed rides in the RideFlow app
 * Allows riders to rate drivers and vice versa
 */
const ratingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: [true, "Ride reference is required"],
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Rater ID is required"],
    },
    ratedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Rated person ID is required"],
    },
    ratedByType: {
      type: String,
      enum: ["rider", "driver"],
      required: [true, "Rater type is required"],
    },
    ratedToType: {
      type: String,
      enum: ["rider", "driver"],
      required: [true, "Rated person type is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for frequently queried fields
ratingSchema.index({ ride: 1 });
ratingSchema.index({ ratedBy: 1 });
ratingSchema.index({ ratedTo: 1 });
ratingSchema.index({ ratedByType: 1 });
ratingSchema.index({ ratedToType: 1 });
ratingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Rating", ratingSchema);
