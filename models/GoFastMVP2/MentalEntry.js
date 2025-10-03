const mongoose = require("mongoose");

const MentalEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  mood: { type: String },
  text: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MentalEntry", MentalEntrySchema);
