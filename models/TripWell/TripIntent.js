const mongoose = require("mongoose");

const TripIntentSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  userId: { type: String, required: true }, // ✅ Firebase UID (not ObjectId)
  priorities: [String],
  vibes: [String],
  mobility: [String],
  budget: String,
  travelPace: [String],
}, { timestamps: true });

// Optional: prevent duplicate intents
TripIntentSchema.index({ tripId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("TripIntent", TripIntentSchema);
