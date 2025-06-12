// models/TripWell/TripGPT.js
const mongoose = require("mongoose");

const TripGPTSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  userId: { type: String, required: true },
  gptReply: { type: String, required: true },
  parsed: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.TripGPT || mongoose.model("TripGPT", TripGPTSchema);
