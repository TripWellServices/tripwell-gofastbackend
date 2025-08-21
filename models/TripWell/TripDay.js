const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  title: String,
  description: String,
  complete: {
    type: Boolean,
    default: false
  }
}, { _id: false }); // Simplified for MVP1

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
