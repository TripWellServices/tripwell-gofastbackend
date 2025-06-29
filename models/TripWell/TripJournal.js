// models/TripWell/TripJournal.js

const mongoose = require("mongoose");

const tripJournalSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: String, // Firebase UID
    required: true,
  },
  entry: {
    type: String,
    required: true,
  },
  dayIndex: {
    type: Number, // Optional – allow journaling per day
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("TripJournal", tripJournalSchema);
