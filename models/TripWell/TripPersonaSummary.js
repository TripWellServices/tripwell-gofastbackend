const mongoose = require("mongoose");

const TripPersonaSummarySchema = new mongoose.Schema({
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TripBase", 
    required: true 
  },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TripPersonaSummary", TripPersonaSummarySchema);
