const mongoose = require('mongoose');

/**
 * TrainingPlan Model - Updated to work with normalized Race & TrainingDay models
 * Acts as the master plan structure with references to individual TrainingDay documents
 */
const TrainingPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  
  raceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Race',
    index: true
  },
  
  // Plan metadata
  startDate: { type: Date, required: true },
  raceDate: { type: Date, required: true },
  totalWeeks: { type: Number, required: true },
  
  // Phase breakdown
  phaseOverview: {
    base: { weeks: Number, startWeek: Number, endWeek: Number },
    build: { weeks: Number, startWeek: Number, endWeek: Number },
    peak: { weeks: Number, startWeek: Number, endWeek: Number },
    taper: { weeks: Number, startWeek: Number, endWeek: Number }
  },
  
  // Mileage progression
  weeklyMileagePlan: [{
    weekIndex: Number,
    targetMileage: Number,
    phase: String
  }],
  
  // Week summaries (lightweight - detailed days are in TrainingDay collection)
  weeks: [{
    weekIndex: Number,
    startDate: Date,
    endDate: Date,
    phase: String,
    targetMileage: Number,
    
    // Day references (IDs point to TrainingDay documents)
    dayIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrainingDay' }],
    
    // Quick summary
    workoutTypes: [String],  // ["easy", "tempo", "long_run", ...]
    keyWorkouts: [String]    // ["Tempo: 6mi @ 8:00", "Long Run: 12mi"]
  }],
  
  // Plan status
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  
  // Legacy fields (for backward compatibility during migration)
  _legacy: {
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
    }
  },
  
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
TrainingPlanSchema.index({ userId: 1, status: 1 });
TrainingPlanSchema.index({ raceId: 1 });

// Virtual: Current week
TrainingPlanSchema.virtual('currentWeek').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const diffTime = now - start;
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks >= 0 && diffWeeks < this.totalWeeks ? diffWeeks : null;
});

// Virtual: Weeks remaining
TrainingPlanSchema.virtual('weeksRemaining').get(function() {
  const currentWeek = this.currentWeek;
  if (currentWeek === null) return this.totalWeeks;
  return this.totalWeeks - currentWeek - 1;
});

const TrainingPlan = mongoose.model('TrainingPlan', TrainingPlanSchema);
module.exports = { TrainingPlan };
