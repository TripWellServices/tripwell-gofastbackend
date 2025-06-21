const mongoose = require("mongoose");

const AnchorSelectSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "TripIntent",
  },
  userId: {
    type: String,
    required: true,
  },
  selectedAnchors: [
    {
      title: String,
      description: String,
      whyItFits: String,
      type: String,
      modifiers: [String], // optional: "dayTrip", "jumpingOffPoint"
    }
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("AnchorSelect", AnchorSelectSchema);
