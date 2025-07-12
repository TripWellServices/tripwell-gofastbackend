// models/TripWell/AnchorLogic.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const AnchorLogicSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId, // ✅ Canon: Mongo _id
    ref: "User",
    required: true,
  },
  enrichedAnchors: [
    {
      title: String,
      description: String,
      location: String,
      type: { type: String, enum: ["experience", "attraction"] },
      isDayTrip: Boolean,
      isTicketed: Boolean,
      defaultTimeOfDay: { type: String, enum: ["morning", "afternoon", "evening"] },
      neighborhoodTag: String,
      notes: String,
      suggestedFollowOn: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔐 Canonical: One anchor logic doc per user/trip combo
AnchorLogicSchema.index({ tripId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("AnchorLogic", AnchorLogicSchema);
