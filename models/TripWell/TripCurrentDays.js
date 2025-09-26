// models/TripWell/TripCurrentDays.js - Live Trip Data
const mongoose = require("mongoose");

const TripCurrentDaysSchema = new mongoose.Schema({
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripBase', 
    required: true,
    unique: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripWellUser', 
    required: true 
  },
  
  // Live trip state
  currentDay: { type: Number, default: 1 },
  tripStartedAt: { type: Date, default: null },
  tripCompletedAt: { type: Date, default: null },
  
  // Live trip days (user can modify these)
  days: [{
    dayIndex: { type: Number, required: true },
    summary: { type: String, required: true },
    blocks: {
      morning: {
        activity: { type: String, required: true },
        type: { 
          type: String, 
          enum: ["attraction", "restaurant", "activity", "transport", "free_time"],
          default: "attraction"
        },
        persona: { 
          type: String, 
          enum: ["art", "foodie", "history", "adventure"],
          default: "history"
        },
        budget: { 
          type: String, 
          enum: ["budget", "moderate", "luxury"],
          default: "moderate"
        }
      },
      afternoon: {
        activity: { type: String, required: true },
        type: { 
          type: String, 
          enum: ["attraction", "restaurant", "activity", "transport", "free_time"],
          default: "attraction"
        },
        persona: { 
          type: String, 
          enum: ["art", "foodie", "history", "adventure"],
          default: "history"
        },
        budget: { 
          type: String, 
          enum: ["budget", "moderate", "luxury"],
          default: "moderate"
        }
      },
      evening: {
        activity: { type: String, required: true },
        type: { 
          type: String, 
          enum: ["attraction", "restaurant", "activity", "transport", "free_time"],
          default: "attraction"
        },
        persona: { 
          type: String, 
          enum: ["art", "foodie", "history", "adventure"],
          default: "history"
        },
        budget: { 
          type: String, 
          enum: ["budget", "moderate", "luxury"],
          default: "moderate"
        }
      }
    },
    isComplete: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    
    // User modifications tracking
    userModifications: [{
      block: { 
        type: String, 
        enum: ["morning", "afternoon", "evening"], 
        required: true 
      },
      originalText: { type: String, required: true },
      modifiedText: { type: String, required: true },
      modifiedAt: { type: Date, default: Date.now },
      reason: { type: String } // Why user modified it
    }]
  }],
  
  // Trip progression tracking
  totalDays: { type: Number, required: true },
  completedDays: { type: Number, default: 0 },
  
  // Status flags
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for fast lookups
TripCurrentDaysSchema.index({ tripId: 1 });
TripCurrentDaysSchema.index({ userId: 1 });
TripCurrentDaysSchema.index({ isActive: 1 });
TripCurrentDaysSchema.index({ tripStartedAt: 1 });

module.exports = mongoose.model("TripCurrentDays", TripCurrentDaysSchema);
