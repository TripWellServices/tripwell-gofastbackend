const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  title: String,
  description: String,
  timeOfDay: {
    type: String,
    enum: ["morning", "afternoon", "evening"]
  },
  location: String,
  neighborhoodTag: String,
  isTicketed: Boolean,
  isDayTrip: Boolean,
  notes: String,
  suggestedFollowOn: String,
  gptGenerated: {
    type: Boolean,
    default: true
  }
}, { _id: false }); // Reuse this inline without creating separate IDs for subdocs

const tripDaySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripBase",
    required: true
  },
  dayIndex: {
    type: Number,
    required: true
  },
  summary: {
    type: String
  },
  blocks: {
    morning: blockSchema,
    afternoon: blockSchema,
    evening: blockSchema
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  modifiedByUser: {
    type: Boolean,
    default: false
  },
  modificationMethod: {
    type: String,
    enum: ["gpt", "manual"]
  }
}, { timestamps: true });

// Canonical uniqueness: one TripDay per dayIndex + trip
tripDaySchema.index({ tripId: 1, dayIndex: 1 }, { unique: true });

module.exports = mongoose.model("TripDay", tripDaySchema);
