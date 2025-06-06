const mongoose = require("mongoose");

const TripGPTSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional: allows guest/anon chat
  },
  gptReply: {
    type: String,
    required: true,
  },
  parsed: {
    type: mongoose.Schema.Types.Mixed,
    default: {}, // Optional: can store vibes, days, suggestions, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TripGPT", TripGPTSchema);
