const mongoose = require("mongoose");

const TripIntentSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "TripBase", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priorities: { type: [String], default: [] },
  vibes: { type: [String], default: [] }
}, { timestamps: true });

TripIntentSchema.index({ tripId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("TripIntent", TripIntentSchema);
