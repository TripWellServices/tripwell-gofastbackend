// models/TripWell/TripComplete.js
const mongoose = require("mongoose");

/*
  TripComplete Schema — Final trip archive
  
  ✅ When trip is completed:
    - Copy ALL data from TripBase
    - Add completion timestamp
    - Clear TripBase for next trip
    - Archive for history/analytics
*/

const TripCompleteSchema = new mongoose.Schema({
  // Copy all TripBase fields
  originalTripId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripBase', required: true },
  joinCode: { type: String, required: true },
  tripName: { type: String, required: true },
  purpose: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  arrivalTime: { type: String, default: null },
  city: { type: String, required: true },
  country: { type: String, required: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', default: null },
  partyCount: { type: Number, default: 1, min: 1 },
  whoWith: {
    type: String,
    default: "",
    enum: ["spouse", "spouse-kids", "son-daughter", "friends", "solo", "other"]
  },
  romanceLevel: { type: Number, default: 0.0, min: 0, max: 1 },
  caretakerRole: { type: Number, default: 0.0, min: 0, max: 1 },
  season: { type: String },
  daysTotal: { type: Number },
  
  // Trip completion data
  tripStartedByOriginator: { type: Boolean, default: false },
  tripStartedByParticipant: { type: Boolean, default: false },
  tripStartedAt: { type: Date, default: null },
  tripCompletedAt: { type: Date, default: Date.now },
  
  // User data at completion
  originatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripWellUser' },
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripWellUser' },
  
  // Archive metadata
  archivedAt: { type: Date, default: Date.now },
  completionReason: { 
    type: String, 
    enum: ["completed", "cancelled", "abandoned"],
    default: "completed"
  }
}, { timestamps: true });

module.exports = mongoose.model("TripComplete", TripCompleteSchema);
