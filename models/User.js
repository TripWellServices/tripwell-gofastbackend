const mongoose = require("mongoose");

/**
 * User Model - GoFast Only (TripWell fields removed)
 * Minimal user model for Firebase auth + runner profile
 */
const userSchema = new mongoose.Schema({
  // 🔐 Firebase Auth (REQUIRED)
  firebaseId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },

  // 🧑 Basic Info
  email: { type: String, default: "" },
  name: { type: String, default: "" },
  age: { type: Number, default: null },

  // 🏃 Training Status
  userStatus: {
    type: String,
    enum: [
      "registered",      // Just created account
      "profile_complete", // Filled out runner profile
      "race_set",        // Created race
      "training",        // Active training plan
      "race_week",       // Race week
      "race_complete",   // Finished race
      "inactive"         // Stopped training
    ],
    default: "registered"
  },

  // ⌚ Garmin Integration
  garminConnected: { type: Boolean, default: false },
  garminAccessToken: { type: String, default: null },
  garminAccessSecret: { type: String, default: null },
  lastGarminSync: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ userStatus: 1 });

module.exports = mongoose.model("User", userSchema);