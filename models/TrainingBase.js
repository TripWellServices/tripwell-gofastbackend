const mongoose = require('mongoose');

const TrainingBaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

  raceGoal: {
    name: { type: String, trim: true },
    type: { type: String, trim: true },     // e.g., "5k", "marathon"
    date: { type: Date },                   // using Date for real math
    goalTime: { type: String, trim: true }, // e.g., "00:45:00"
  },

  currentFitness: {
    current5kTime: { type: String, trim: true },  // e.g., "00:24:30"
    weeklyMileage: Number,
    lastRace: {
      name: { type: String, trim: true },
      date: { type: Date },
      distance: { type: String, trim: true },     // e.g., "10K"
      time: { type: String, trim: true },         // e.g., "00:49:00"
    },
  },

  goalDeltaSeconds: Number, // derived: goalTime - current5kTime (in seconds)

  initialRacePrediction: {
    type: mongoose.Schema.Types.Mixed, // flexible object placeholder
    default: {},
  },

  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingBase', TrainingBaseSchema);
