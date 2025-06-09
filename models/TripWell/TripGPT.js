const mongoose = require("mongoose");

const TripGPTSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: String, // 🔄 Firebase UID, not Mongo ObjectId
    required: true,
  },
  gptReply: {
    type: String,
    required: true,
  },
  parsed: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TripGPT", TripGPTSchema);
