const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activityDate: Date,
  distance: Number,
  avgPace: String,
  avgHeartRate: Number,
  elevationGain: Number,
  workoutType: String,
  source: { type: String, default: "Garmin" }
});

module.exports = mongoose.model('Activity', ActivitySchema);
