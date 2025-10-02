const mongoose = require('mongoose');

/**
 * TrainingDay Model - Individual training day with planned vs actual
 * Handles hydration of Garmin data over planned workouts
 */
const TrainingDaySchema = new mongoose.Schema({
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
  
  trainingPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'TrainingPlan'
  },

  // Day Identification
  date: { type: Date, required: true, index: true },
  weekIndex: { type: Number, required: true },  // 0-based
  dayIndex: { type: Number, required: true },   // 0-6 (Mon-Sun)
  dayName: { type: String },  // "Monday", "Tuesday", etc.
  
  // Training Context
  phase: { 
    type: String, 
    enum: ['base', 'build', 'peak', 'taper'],
    required: true 
  },
  
  // ==================== PLANNED WORKOUT ====================
  planned: {
    type: { 
      type: String, 
      enum: ['rest', 'easy', 'tempo', 'intervals', 'long_run', 'race_pace', 
             'hills', 'fartlek', 'recovery', 'sharpener', 'over_unders', 'cross_train'],
      required: true
    },
    mileage: { type: Number, default: 0 },
    duration: { type: Number },  // minutes
    
    // Pace zones
    paceRange: { type: String },  // "8:30-9:00"
    targetPace: { type: String }, // "8:45"
    
    // HR zones
    hrZone: { type: Number },  // 1-5
    hrRange: { type: String }, // "140-150"
    
    // Workout structure (for intervals, tempo, etc.)
    segments: [{
      type: String,  // "warmup", "work", "recovery", "cooldown"
      duration: Number,  // minutes
      distance: Number,  // miles
      pace: String,
      reps: Number
    }],
    
    // Instructions
    label: { type: String },  // "Easy Recovery Run", "Tempo Workout", etc.
    description: { type: String },
    coachNotes: { type: String }
  },
  
  // ==================== ACTUAL WORKOUT (from Garmin) ====================
  actual: {
    completed: { type: Boolean, default: false },
    
    mileage: { type: Number },
    duration: { type: Number },  // minutes
    pace: { type: String },       // "8:45"
    
    // Heart Rate
    avgHR: { type: Number },
    maxHR: { type: Number },
    hrZoneDistribution: {
      z1: Number,  // minutes in each zone
      z2: Number,
      z3: Number,
      z4: Number,
      z5: Number
    },
    
    // Performance metrics
    cadence: { type: Number },
    elevationGain: { type: Number },
    calories: { type: Number },
    
    // Session reference
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    garminActivityId: { type: String },
    
    // Completion tracking
    completedAt: { type: Date },
    syncedAt: { type: Date }
  },
  
  // ==================== COMPARISON & ANALYSIS ====================
  analysis: {
    workoutCompleted: { type: Boolean, default: false },
    hitTargetMileage: { type: Boolean },
    hitTargetPace: { type: Boolean },
    stayedInHRZone: { type: Boolean },
    
    // Variance
    mileageVariance: { type: Number },  // actual - planned (miles)
    paceVariance: { type: Number },     // seconds per mile difference
    
    // Quality score (0-100)
    qualityScore: { type: Number },
    
    // Notes
    performanceNotes: { type: String }
  },
  
  // ==================== USER FEEDBACK ====================
  feedback: {
    mood: { type: String },  // "😊", "😐", "😫"
    effort: { type: Number, min: 1, max: 10 },  // RPE
    injuryFlag: { type: Boolean, default: false },
    notes: { type: String },
    submittedAt: { type: Date }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound indexes for efficient queries
TrainingDaySchema.index({ userId: 1, date: 1 }, { unique: true });
TrainingDaySchema.index({ raceId: 1, weekIndex: 1, dayIndex: 1 });
TrainingDaySchema.index({ trainingPlanId: 1, weekIndex: 1 });
TrainingDaySchema.index({ userId: 1, 'actual.completed': 1 });

// Virtual for status
TrainingDaySchema.virtual('status').get(function() {
  if (this.planned.type === 'rest') return 'rest';
  if (this.actual.completed) return 'completed';
  if (new Date() > this.date) return 'missed';
  return 'pending';
});

// Method to hydrate actual data from Garmin
TrainingDaySchema.methods.hydrateGarminData = function(garminData) {
  this.actual.completed = true;
  this.actual.mileage = garminData.mileage;
  this.actual.duration = garminData.duration;
  this.actual.pace = garminData.pace;
  this.actual.avgHR = garminData.avgHR;
  this.actual.maxHR = garminData.maxHR;
  this.actual.garminActivityId = garminData.activityId;
  this.actual.completedAt = garminData.activityDate || new Date();
  this.actual.syncedAt = new Date();
  
  // Calculate analysis
  this.calculateAnalysis();
};

// Method to calculate workout analysis
TrainingDaySchema.methods.calculateAnalysis = function() {
  if (!this.actual.completed || this.planned.type === 'rest') return;
  
  // Mileage check
  const mileageVariance = this.actual.mileage - this.planned.mileage;
  this.analysis.mileageVariance = mileageVariance;
  this.analysis.hitTargetMileage = Math.abs(mileageVariance) <= 0.5;  // within 0.5 miles
  
  // Pace check (if target pace exists)
  if (this.planned.targetPace && this.actual.pace) {
    const plannedPaceSec = this.paceToSeconds(this.planned.targetPace);
    const actualPaceSec = this.paceToSeconds(this.actual.pace);
    this.analysis.paceVariance = actualPaceSec - plannedPaceSec;
    this.analysis.hitTargetPace = Math.abs(this.analysis.paceVariance) <= 15;  // within 15 sec/mile
  }
  
  // HR zone check (if HR data available)
  if (this.planned.hrZone && this.actual.avgHR) {
    const targetZone = this.planned.hrZone;
    const avgHR = this.actual.avgHR;
    // Simplified: check if avg HR is reasonable for zone (more complex logic possible)
    this.analysis.stayedInHRZone = true;  // Placeholder - implement zone ranges
  }
  
  // Quality score (0-100)
  let score = 100;
  if (!this.analysis.hitTargetMileage) score -= 20;
  if (this.planned.targetPace && !this.analysis.hitTargetPace) score -= 30;
  if (this.feedback?.injuryFlag) score -= 25;
  this.analysis.qualityScore = Math.max(0, score);
  
  this.analysis.workoutCompleted = true;
};

// Helper to convert pace string to seconds
TrainingDaySchema.methods.paceToSeconds = function(paceStr) {
  const [min, sec] = paceStr.split(':').map(Number);
  return min * 60 + sec;
};

module.exports = mongoose.model('TrainingDay', TrainingDaySchema);

