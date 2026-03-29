const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Driver Schema
 * Represents a driver/vehicle service provider in the RideFlow app
 * Stores authentication, vehicle info, documents, location, and earnings
 * Includes geospatial indexing for location-based queries
 */
const driverSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      trim: true,
      minlength: [10, "Phone must be at least 10 digits"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "driver",
      immutable: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    // currentLocation: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     default: "Point", default: [0, 0]
    //   },
    //   coordinates: {
    //     type: [Number], // [longitude, latitude] — GeoJSON format
    //     index: "2dsphere",
    //   },
    // },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    vehicle: {
      make: String,
      model: String,
      year: Number,
      color: String,
      plateNumber: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: ["UberX", "Comfort", "XL", "Black"],
      },
    },
    documents: {
      license: String,
      insurance: String,
      registration: String,
      backgroundCheck: String,
    },
    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    totalRides: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
driverSchema.index({ currentLocation: "2dsphere" });

// Index for frequently queried fields
driverSchema.index({ email: 1 });
driverSchema.index({ phone: 1 });
driverSchema.index({ isApproved: 1 });
driverSchema.index({ isAvailable: 1 });

// Hash password before saving
driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare entered password with hashed password
 * @param {string} enteredPassword - Password entered by driver
 * @returns {Promise<boolean>} True if passwords match
 */
driverSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

/**
 * Instance method to generate JWT token
 * @returns {string} JWT token
 */
driverSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model("Driver", driverSchema);
