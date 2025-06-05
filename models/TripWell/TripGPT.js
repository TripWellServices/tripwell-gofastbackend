const mongoose = require("mongoose");

const TripGPTSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  askId: { type: mongoose.Schema.Types.ObjectId, ref: "TripAsk" },
  timestamp: { type: Date, default: Date.now },
  gpt: {
    reply: String,
    fullOutput: String,
    parsed: mongoose.Schema.Types.Mixed,
  },
});

module.exports = mongoose.model("TripGPT", TripGPTSchema);
