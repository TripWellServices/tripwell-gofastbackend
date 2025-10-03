const mongoose = require('mongoose');

const Adaptive5kPaceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  weekIndex: { type: Number, required: true },
  sourceWeekId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeekPlan' },
  adaptive5kTime: { type: Number, required: true }, // in seconds
  delta: { type: Number }, // change from prior week (optional)
  rationale: { type: String }, // why it changed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Adaptive5kPace', Adaptive5kPaceSchema);
