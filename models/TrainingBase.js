const mongoose = require('mongoose');

const TrainingBaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

  raceGoal: {
    name: String,
    type: String,     // e.g., "5k", "marathon"
    date: String,     // consider using `Date` if you'll do date math
    goalTime: String, // e.g., "00:45:00"
  },

  currentFitness: {
    current5kTime: String,  // e.g., "00:24:30"
    weeklyMileage: Number,
    lastRace: {
      name: String,
      date: String,         // again, consider `Date`
      distance: String,     // e.g., "10K"
      time: String,         // e.g., "00:49:00"
    }
  },

  goalDeltaSeconds: Number, // derived: goalTime - current5kTime (in seconds)

  initialRacePrediction: Object, // populated later by race prediction logic

  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingBase', TrainingBaseSchema);