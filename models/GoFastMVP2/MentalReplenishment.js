const mongoose = require('mongoose');

const MentalReplenishmentSchema = new mongoose.Schema({
  userId: String,
  selectedEmoji: String,
  message: String,
  action: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MentalReplenishment", MentalReplenishmentSchema);