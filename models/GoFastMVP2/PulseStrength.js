const mongoose = require('mongoose');

const PulseStrengthSchema = new mongoose.Schema({
  userId: String,            // who submitted this (if available)
  durability: String,        // 1–5, body strength rating
  longRunFeel: String,       // 1–5, how the long run felt
  oxygenControl: String,     // 1–5, breathing/ease of effort
  injuryRisk: String,        // "true" or "false"
  injurySeverity: String,    // 1–5 if injuryRisk is true, otherwise "0"
  mood: String,              // emoji: 🙂 😎 😫 etc.
  notes: String,             // freeform input
  createdAt: { type: Date, default: Date.now } // timestamp
});

module.exports = mongoose.model("PulseStrength", PulseStrengthSchema);