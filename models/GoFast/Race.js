const mongoose = require('mongoose');

/**
 * Race Model - Normalized race/event tracking
 * Consolidates TrainingBase + GoalProfile into single source of truth
 */
const RaceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User',
    index: true
  },

  // Race Details
  raceName: { type: String, required: true },
  raceType: { 
    type: String, 
    required: true,
    enum: ['5k', '10k', '10m', 'half', 'marathon', 'other']
  },
  raceDate: { type: Date, required: true },
  
  // Goals
  goalTime: { type: String, required: true },  // "1:45:00"
  goalPace: { type: String },  // "8:00" per mile
  
  // Baseline (at time of plan creation)
  baseline5k: { type: String, required: true },  // "24:30"
  baselineWeeklyMileage: { type: Number },
  
  // Race Info
  distanceMiles: { type: Number, required: true },
  weeksAway: { type: Number },
  location: { type: String },
  
  // Predictions (updated throughout training)
  currentPrediction: {
    adaptive5kTime: String,  // Latest adaptive 5k
    projectedTime: String,
    projectedPace: String,
    deltaFromGoal: String,  // "+2:30" or "-1:15"
    confidence: String,  // "high", "medium", "low"
    lastUpdated: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['planning', 'training', 'taper', 'race_week', 'completed', 'cancelled'],
    default: 'planning'
  },
  
  // Course Profile (if available)
  courseProfile: {
    elevationGain: Number,
    difficulty: String,  // "flat", "rolling", "hilly", "mountainous"
    surface: String,  // "road", "trail", "mixed"
    weather: String
  },

  // Results (post-race)
  actualResult: {
    finishTime: String,
    pace: String,
    placement: Number,
    ageGroupPlacement: Number,
    notes: String,
    completedAt: Date
  },

  // Metadata
  trainingPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingPlan' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
RaceSchema.index({ userId: 1, raceDate: 1 });
RaceSchema.index({ status: 1 });

// Virtual for weeks until race
RaceSchema.virtual('weeksUntilRace').get(function() {
  const now = new Date();
  const race = new Date(this.raceDate);
  const diffTime = race - now;
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks > 0 ? diffWeeks : 0;
});

// Virtual for days until race
RaceSchema.virtual('daysUntilRace').get(function() {
  const now = new Date();
  const race = new Date(this.raceDate);
  const diffTime = race - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

module.exports = mongoose.model('Race', RaceSchema);

