// models/TripWell/TripGPTRaw.js
const mongoose = require("mongoose");

const TripGPTRawSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  userId: { type: String, required: true },
  response: {
    id: String,
    object: String,
    created: Number,
    model: String,
    choices: [{
      index: Number,
      message: {
        role: String,
        content: String
      },
      finish_reason: String
    }],
    usage: {
      prompt_tokens: Number,
      completion_tokens: Number,
      total_tokens: Number
    }
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TripGPTRaw", TripGPTRawSchema);
