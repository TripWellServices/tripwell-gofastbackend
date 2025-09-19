// models/TripWell/TripBase.js
const mongoose = require("mongoose");

const TripBaseSchema = new mongoose.Schema({
  joinCode:  { type: String, required: true }, // No unique constraint - JoinCode registry handles this
  tripName:  { type: String, required: true },
  purpose:   { type: String, required: true },        // matches your route validation
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  arrivalTime: { type: String, default: null }, // For MVP2: "14:30", "morning", "evening", etc.
  city:      { type: String, required: true },
  country:   { type: String, required: true },
  cityId:    { type: mongoose.Schema.Types.ObjectId, ref: 'City', default: null }, // Link to City object
  partyCount:  { type: Number, default: 1, min: 1 },  // hardened
  whoWith: {
    type: String,
    default: "",
    enum: ["spouse", "spouse-kids", "son-daughter", "friends", "solo", "other"]
  },
  season:    { type: String },
  daysTotal: { type: Number },
  tripStartedByOriginator: { type: Boolean, default: false },
  tripStartedByParticipant: { type: Boolean, default: false },
  tripComplete: { type: Boolean, default: false },
}, { timestamps: true }); // replaces manual createdAt

module.exports = mongoose.model("TripBase", TripBaseSchema);
