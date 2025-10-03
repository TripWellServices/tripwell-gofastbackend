const mongoose = require('mongoose');

/**
 * RunnerProfile Model - Separate from User!
 * Created after authentication when user fills out their profile
 * This is the ACTUAL runner data
 */
const RunnerProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User',
    unique: true,
    index: true
  },

  // 👤 Runner Info
  name: { type: String, required: true },
  goesBy: { type: String, required: true }, // "Jeff", "Jeffrey", "F3 names", etc.
  age: { type: Number, required: true },

  // 🏃 Current Fitness Baseline
  baseline5k: { type: String, required: true },  // "24:30"
  weeklyMileage: { type: Number, required: true }, // 25

  // ⌚ Garmin Integration
  garminConnected: { type: Boolean, default: false },
  garminAccessToken: { type: String, default: null },
  garminAccessSecret: { type: String, default: null },
  lastGarminSync: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
RunnerProfileSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('RunnerProfile', RunnerProfileSchema);

