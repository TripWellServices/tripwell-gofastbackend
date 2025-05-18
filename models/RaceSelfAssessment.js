const mongoose = require('mongoose');

const RaceSelfAssessmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  raceId: { type: String },
  liftCheck: [String],
  fuelReflection: [String],
  courseReality: [String],
  injuryCheck: [String],
  lockedPace: String,
  projectedTime: String,
  deltaFromGoal: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("RaceSelfAssessment", RaceSelfAssessmentSchema);