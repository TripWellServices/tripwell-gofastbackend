// models/TripWell/TripReflection.js

const mongoose = require("mongoose");

const tripReflectionSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: String, // Firebase UID
    required: true,
  },
  overallMood: String, // e.g., emoji or short word
  favoriteMemory: String,
  lessonsLearned: String,
  wouldDoDifferently: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("TripReflection", tripReflectionSchema);
