// models/TripWell/TripItinerary.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const tripItinerarySchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId, // ✅ MongoDB _id, not Firebase UID
    ref: "TripWellUser",
    required: true,
  },
  tripDayIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "TripDay",
    },
  ],
  generatedFromGPT: {
    type: Boolean,
    default: false,
  },
  finalized: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TripItinerary", tripItinerarySchema);
