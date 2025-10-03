
const mongoose = require('mongoose');

const GarminSummarySchema = new mongoose.Schema({
  totalMileage: Number,
  avgHR: Number,
  longestRun: Number,
  z2Time: Number,
  effortScore: Number
}, { _id: false });

const FeedbackSchema = new mongoose.Schema({
  mood: String,
  emoji: String,
  injuryFlag: Boolean,
  notes: String
}, { _id: false });

const AdaptiveOutputSchema = new mongoose.Schema({
  adaptive5kTime: String,
  deltaSeconds: Number,
  updatedAt: Date
}, { _id: false });

const WeekPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekIndex: { type: Number, required: true },
  startDate: String,
  endDate: String,
  sourceTrainingPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingPlan' },
  garminSummary: GarminSummarySchema,
  feedback: FeedbackSchema,
  adaptiveOutput: AdaptiveOutputSchema,
  initializedAt: { type: Date, default: Date.now }
});

WeekPlanSchema.index({ userId: 1, weekIndex: 1 }, { unique: true });

module.exports = mongoose.model('WeekPlan', WeekPlanSchema);
