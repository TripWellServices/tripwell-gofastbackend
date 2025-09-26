// models/TripWell/ItineraryDays.js - The Bible/Source of Truth
const mongoose = require("mongoose");

const ItineraryDaysSchema = new mongoose.Schema({
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
  
  // The raw AI-generated itinerary text (source of truth)
  rawItineraryText: { 
    type: String, 
    required: true 
  },
  
  // Parsed days from the raw text
  parsedDays: [{
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
    }
  }],
  
  // Metadata
  generatedAt: { type: Date, default: Date.now },
  aiPrompt: { type: String }, // The prompt used to generate this itinerary
  aiModel: { type: String, default: "gpt-4" },
  
  // Version control
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for fast lookups
ItineraryDaysSchema.index({ tripId: 1 });
ItineraryDaysSchema.index({ userId: 1 });
ItineraryDaysSchema.index({ isActive: 1 });

module.exports = mongoose.model("ItineraryDays", ItineraryDaysSchema);
