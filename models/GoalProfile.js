const mongoose = require('mongoose');

const GoalProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  goalRaceDistance: String,
  goalRaceDate: Date,
  targetFinishTime: String,
  targetPace: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GoalProfile', GoalProfileSchema);
