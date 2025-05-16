const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weekStartDate: Date,
  projectedRaceTime: String,
  projectedRacePace: String,
  deltaFromGoal: String,
  trend: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);