const mongoose = require("mongoose");

const TripBaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinCode: { type: String, required: true, unique: true },
  tripName: { type: String, required: true },
  purpose: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isMultiCity: { type: Boolean, default: false },
  city: { type: String },
  partyCount: { type: Number, default: 1 },
  whoWith: {
    type: [String],
    default: [],
    enum: ["spouse", "kids", "friends", "parents", "multigen", "solo", "other"]
  },
  season: { type: String },
  daysTotal: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

TripBaseSchema.pre("save", function (next) {
  if (!this.city) {
    this.city = this.tripName || "Unknown";
  }
  next();
});

module.exports = mongoose.model("TripBase", TripBaseSchema);
