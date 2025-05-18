
const mongoose = require('mongoose');

const RaceResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  raceDate: Date,
  distanceMiles: Number,
  finishTime: String,       // "1:39:45"
  averagePace: String,      // "7:36"
  submittedAt: { type: Date, default: Date.now },
  source: { type: String, default: 'manual' },
  notes: String
});

module.exports = mongoose.model('RaceResult', RaceResultSchema);