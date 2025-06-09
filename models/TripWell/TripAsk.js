const mongoose = require("mongoose");

const TripAskSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "TripBase", required: true },
  userId: { type: String }, // ✅ Firebase UID, not Mongo ObjectId
  userInput: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  dateString: { type: String }, // optional lookup key
});

module.exports = mongoose.model("TripAsk", TripAskSchema);
