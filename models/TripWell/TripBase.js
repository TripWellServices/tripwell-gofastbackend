// models/TripWell/TripBase.js
const mongoose = require("mongoose");

const TripBaseSchema = new mongoose.Schema({
  joinCode:  { type: String, required: true }, // No unique constraint - JoinCode registry handles this
  tripName:  { type: String, required: true },
  purpose:   { type: String, required: true },        // matches your route validation
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  city:      { type: String, required: true },
  partyCount:  { type: Number, default: 1, min: 1 },  // hardened
  whoWith: {
    type: [String],
    default: [],
    enum: ["spouse", "kids", "friends", "parents", "multigen", "solo", "other"]
  },
  season:    { type: String },
  daysTotal: { type: Number },
  tripStartedByOriginator: { type: Boolean, default: false },
  tripStartedByParticipant: { type: Boolean, default: false },
  tripComplete: { type: Boolean, default: false },
}, { timestamps: true }); // replaces manual createdAt

module.exports = mongoose.model("TripBase", TripBaseSchema);
