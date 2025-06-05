const mongoose = require("mongoose");

const TripAskSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "TripBase", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  userInput: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  dateString: { type: String }, // for fast lookup by date
});

module.exports = mongoose.model("TripAsk", TripAskSchema);
