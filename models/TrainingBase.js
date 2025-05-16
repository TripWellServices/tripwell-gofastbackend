const mongoose = require('mongoose');

const TrainingPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  raceGoal: {
    name: String,
    type: String,
    date: String,
    goalTime: String,
  },
  currentFitness: {
    current5kTime: String,
    weeklyMileage: Number,
    lastRace: {
      name: String,
      date: String,
      distance: String,
      time: String,
    }
  },
  startDate: String,
  raceDate: String,
  totalWeeks: Number,
  phaseOverview: Object,
  weeklyMileagePlan: Array,
  weeks: Array,
  generatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('TrainingPlan', TrainingPlanSchema);
