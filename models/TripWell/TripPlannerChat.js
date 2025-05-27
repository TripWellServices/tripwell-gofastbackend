const mongoose = require("mongoose");

const TripPlannerChatSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  userInput: {
    type: String,
    required: true,
  },
  gptReply: {
    type: String,
    required: true,
  },
  parserOutput: {
    type: Object,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  dateString: {
    type: String, // e.g. "2025-05-26"
    required: true,
  },
});

module.exports = mongoose.model("TripPlannerChat", TripPlannerChatSchema);
