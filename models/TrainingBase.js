const TrainingBaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  raceGoal: {
    name: String,
    type: String,
    date: String,
    goalTime: String, // "00:45:00"
  },
  currentFitness: {
    current5kTime: String, // "00:24:30"
    weeklyMileage: Number,
    lastRace: {
      name: String,
      date: String,
      distance: String,
      time: String,
    }
  },
  goalDeltaSeconds: Number, // derived: goalTime - current5kTime
  initialRacePrediction: Object, // optional field, populated by race predictor
  // Other stuff
  generatedAt: { type: Date, default: Date.now },
});
