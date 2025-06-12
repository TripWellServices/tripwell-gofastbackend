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
    type: String, // Firebase UID
    required: true,
  },
  tripDayIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "TripDay",
    },
  ],
  sourceAskId: {
    type: Schema.Types.ObjectId,
    ref: "TripAsk",
  },
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
