import mongoose from "mongoose";

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

export default mongoose.model("RaceSelfAssessment", RaceSelfAssessmentSchema);
