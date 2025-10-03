const mongoose = require('mongoose');

/**
 * CompletionFlags Model - Track user progress through training journey
 * Centralized flag planting for all major milestones
 */
const CompletionFlagsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User',
    unique: true,
    index: true
  },
  
  raceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race'
  },
  
  // ==================== ONBOARDING FLAGS ====================
  onboarding: {
    accountCreated: { type: Boolean, default: false },
    accountCreatedAt: { type: Date },
    
    profileComplete: { type: Boolean, default: false },
    profileCompleteAt: { type: Date },
    
    baselineSet: { type: Boolean, default: false },  // Current 5k time entered
    baselineSetAt: { type: Date },
    
    goalSet: { type: Boolean, default: false },  // Race goal entered
    goalSetAt: { type: Date },
    
    planGenerated: { type: Boolean, default: false },
    planGeneratedAt: { type: Date },
    
    planAccepted: { type: Boolean, default: false },
    planAcceptedAt: { type: Date }
  },
  
  // ==================== INTEGRATION FLAGS ====================
  integrations: {
    garminConnected: { type: Boolean, default: false },
    garminConnectedAt: { type: Date },
    garminLastSync: { type: Date },
    
    stravaConnected: { type: Boolean, default: false },
    stravaConnectedAt: { type: Date },
    
    appleHealthConnected: { type: Boolean, default: false },
    appleHealthConnectedAt: { type: Date }
  },
  
  // ==================== TRAINING FLAGS ====================
  training: {
    trainingStarted: { type: Boolean, default: false },
    trainingStartedAt: { type: Date },
    
    firstWorkoutComplete: { type: Boolean, default: false },
    firstWorkoutCompleteAt: { type: Date },
    
    firstWeekComplete: { type: Boolean, default: false },
    firstWeekCompleteAt: { type: Date },
    
    // Week-by-week completion map
    weekCompletions: { type: Map, of: Boolean, default: {} },
    weekCompletionDates: { type: Map, of: Date, default: {} },
    
    // Milestone workouts
    firstLongRunComplete: { type: Boolean, default: false },
    firstTempoComplete: { type: Boolean, default: false },
    firstIntervalsComplete: { type: Boolean, default: false },
    
    // Adaptive tracking
    adaptive5kUpdated: { type: Boolean, default: false },
    lastAdaptive5kUpdate: { type: Date },
    
    // Training completion
    buildPhaseComplete: { type: Boolean, default: false },
    peakPhaseComplete: { type: Boolean, default: false },
    taperPhaseStarted: { type: Boolean, default: false }
  },
  
  // ==================== RACE WEEK FLAGS ====================
  raceWeek: {
    raceWeekStarted: { type: Boolean, default: false },
    raceWeekStartedAt: { type: Date },
    
    paceLockedIn: { type: Boolean, default: false },
    paceLockedInAt: { type: Date },
    lockedPace: { type: String },  // "8:00"
    
    courseVisualized: { type: Boolean, default: false },
    courseVisualizedAt: { type: Date },
    
    raceStrategySet: { type: Boolean, default: false },
    raceStrategySetAt: { type: Date },
    
    raceMorningChecklist: { type: Boolean, default: false },
    raceMorningChecklistAt: { type: Date }
  },
  
  // ==================== RACE DAY FLAGS ====================
  raceDay: {
    raceStarted: { type: Boolean, default: false },
    raceStartedAt: { type: Date },
    
    raceComplete: { type: Boolean, default: false },
    raceCompleteAt: { type: Date },
    
    resultSubmitted: { type: Boolean, default: false },
    resultSubmittedAt: { type: Date }
  },
  
  // ==================== POST-RACE FLAGS ====================
  postRace: {
    postRaceReview: { type: Boolean, default: false },
    postRaceReviewAt: { type: Date },
    
    reflectionComplete: { type: Boolean, default: false },
    reflectionCompleteAt: { type: Date },
    
    nextGoalSet: { type: Boolean, default: false },
    nextGoalSetAt: { type: Date },
    
    planArchived: { type: Boolean, default: false },
    planArchivedAt: { type: Date }
  },
  
  // ==================== ENGAGEMENT FLAGS ====================
  engagement: {
    // Weekly check-ins
    weeklyReviewsCompleted: { type: Number, default: 0 },
    lastWeeklyReview: { type: Date },
    
    // Mental game
    mentalEntriesLogged: { type: Number, default: 0 },
    lastMentalEntry: { type: Date },
    
    // Pulse checks
    pulseChecksCompleted: { type: Number, default: 0 },
    lastPulseCheck: { type: Date },
    
    // Community
    joinedRunCrew: { type: Boolean, default: false },
    joinedRunCrewAt: { type: Date }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
CompletionFlagsSchema.index({ userId: 1 }, { unique: true });
CompletionFlagsSchema.index({ raceId: 1 });

// Virtual: Overall completion percentage
CompletionFlagsSchema.virtual('completionPercentage').get(function() {
  const flags = [
    this.onboarding.accountCreated,
    this.onboarding.baselineSet,
    this.onboarding.goalSet,
    this.onboarding.planGenerated,
    this.onboarding.planAccepted,
    this.integrations.garminConnected,
    this.training.trainingStarted,
    this.training.firstWeekComplete,
    this.raceWeek.paceLockedIn,
    this.raceDay.raceComplete,
    this.postRace.postRaceReview
  ];
  
  const completed = flags.filter(f => f === true).length;
  return Math.round((completed / flags.length) * 100);
});

// Virtual: Training progress percentage
CompletionFlagsSchema.virtual('trainingProgress').get(function() {
  if (!this.training.weekCompletions || this.training.weekCompletions.size === 0) {
    return 0;
  }
  
  const totalWeeks = this.training.weekCompletions.size;
  const completedWeeks = Array.from(this.training.weekCompletions.values()).filter(v => v === true).length;
  return Math.round((completedWeeks / totalWeeks) * 100);
});

// Method: Mark week as complete
CompletionFlagsSchema.methods.markWeekComplete = function(weekIndex) {
  this.training.weekCompletions.set(weekIndex.toString(), true);
  this.training.weekCompletionDates.set(weekIndex.toString(), new Date());
  
  // Check if first week
  if (weekIndex === 0 && !this.training.firstWeekComplete) {
    this.training.firstWeekComplete = true;
    this.training.firstWeekCompleteAt = new Date();
  }
};

// Method: Check if week is complete
CompletionFlagsSchema.methods.isWeekComplete = function(weekIndex) {
  return this.training.weekCompletions.get(weekIndex.toString()) === true;
};

// Method: Plant flag with timestamp
CompletionFlagsSchema.methods.plantFlag = function(category, flagName) {
  if (this[category] && this[category][flagName] !== undefined) {
    this[category][flagName] = true;
    const timestampField = `${flagName}At`;
    if (this[category][timestampField] !== undefined) {
      this[category][timestampField] = new Date();
    }
  }
};

module.exports = mongoose.model('CompletionFlags', CompletionFlagsSchema);

