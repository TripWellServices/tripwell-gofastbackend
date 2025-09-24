// models/TripWell/TripWellLiveUser.js
const mongoose = require("mongoose");

const TripWellLiveUserSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripWellUser', 
    required: true,
    unique: true
  },
  // Profile data (moved from TripWellUser)
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  hometownCity: { type: String, required: true },
  homeState: { type: String, required: true },
  travelStyle: [{ type: String }], // Array of travel style preferences
  tripVibe: [{ type: String }], // Array of trip vibe preferences
  dreamDestination: { type: String, required: true },
  
  // Trip planning data
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripBase', 
    default: null 
  },
  role: { 
    type: String, 
    enum: ["originator", "participant", "noroleset"], 
    default: "noroleset" 
  },
  
  // Timestamps
  profileCreatedAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast lookups
TripWellLiveUserSchema.index({ userId: 1 });
TripWellLiveUserSchema.index({ tripId: 1 });

module.exports = mongoose.model("TripWellLiveUser", TripWellLiveUserSchema);
