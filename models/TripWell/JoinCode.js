// models/TripWell/JoinCode.js
const mongoose = require("mongoose");

const JoinCodeSchema = new mongoose.Schema({
  joinCode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TripBase", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TripWellUser", 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Ensure unique join codes
JoinCodeSchema.index({ joinCode: 1 }, { unique: true });

// Index for quick trip lookups
JoinCodeSchema.index({ tripId: 1 });

// Index for user lookups
JoinCodeSchema.index({ userId: 1 });

module.exports = mongoose.model("JoinCode", JoinCodeSchema);
