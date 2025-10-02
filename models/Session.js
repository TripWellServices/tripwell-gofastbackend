const mongoose = require('mongoose');

/**
 * Session Model - Raw Garmin activity data
 * Stores complete activity details for deep analysis
 */
const SessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User',
    index: true
  },
  
  trainingDayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingDay',
    index: true
  },
  
  // Garmin identifiers
  garminActivityId: { type: String, unique: true, sparse: true },
  garminUserId: { type: String },
  
  // Activity basics
  activityType: { type: String, default: 'running' },
  activityDate: { type: Date, required: true, index: true },
  startTime: { type: Date },
  
  // Summary metrics
  distance: { type: Number },  // miles
  duration: { type: Number },  // seconds
  movingTime: { type: Number },  // seconds
  elapsedTime: { type: Number },  // seconds
  
  // Pace
  avgPace: { type: String },  // "8:45"
  avgPaceSeconds: { type: Number },  // seconds per mile
  
  // Heart Rate
  avgHR: { type: Number },
  maxHR: { type: Number },
  minHR: { type: Number },
  hrZoneDistribution: {
    z1Minutes: Number,
    z2Minutes: Number,
    z3Minutes: Number,
    z4Minutes: Number,
    z5Minutes: Number
  },
  
  // Cadence
  avgCadence: { type: Number },
  maxCadence: { type: Number },
  
  // Elevation
  elevationGain: { type: Number },  // feet
  elevationLoss: { type: Number },  // feet
  
  // Power (if available)
  avgPower: { type: Number },
  normalizedPower: { type: Number },
  
  // Calories
  calories: { type: Number },
  
  // Weather (if available)
  temperature: { type: Number },
  humidity: { type: Number },
  
  // Splits (lap data)
  splits: [{
    lapNumber: Number,
    distance: Number,
    duration: Number,
    pace: String,
    avgHR: Number,
    elevationGain: Number
  }],
  
  // Advanced metrics
  metrics: {
    aerobicEffect: Number,
    anaerobicEffect: Number,
    vo2max: Number,
    lactateThreshold: Number,
    recoveryTime: Number,  // hours
    performanceCondition: Number,
    groundContactTime: Number,
    verticalOscillation: Number,
    strideLength: Number
  },
  
  // GPS data (optional - can be large)
  gpsData: {
    points: [{
      lat: Number,
      lng: Number,
      elevation: Number,
      timestamp: Date,
      hr: Number,
      pace: Number
    }],
    enabled: { type: Boolean, default: false }
  },
  
  // Raw Garmin payload (for debugging/future use)
  rawData: { type: mongoose.Schema.Types.Mixed },
  
  // Sync tracking
  syncedAt: { type: Date, default: Date.now },
  source: { type: String, default: 'garmin_webhook' },  // or 'manual_import', 'api_pull'
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
SessionSchema.index({ userId: 1, activityDate: 1 });
SessionSchema.index({ garminActivityId: 1 }, { unique: true, sparse: true });
SessionSchema.index({ trainingDayId: 1 });

// Virtual for activity date string (YYYY-MM-DD)
SessionSchema.virtual('dateString').get(function() {
  return this.activityDate.toISOString().split('T')[0];
});

// Method to extract splits summary
SessionSchema.methods.getSplitsSummary = function() {
  if (!this.splits || this.splits.length === 0) return null;
  
  const paces = this.splits.map(s => this.paceToSeconds(s.pace)).filter(p => !isNaN(p));
  const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
  const fastestPace = Math.min(...paces);
  const slowestPace = Math.max(...paces);
  
  return {
    totalLaps: this.splits.length,
    avgPace: this.secondsToPace(avgPace),
    fastestPace: this.secondsToPace(fastestPace),
    slowestPace: this.secondsToPace(slowestPace),
    paceVariability: slowestPace - fastestPace  // seconds
  };
};

// Helper: pace string to seconds
SessionSchema.methods.paceToSeconds = function(paceStr) {
  if (!paceStr || typeof paceStr !== 'string') return NaN;
  const [min, sec] = paceStr.split(':').map(Number);
  return min * 60 + sec;
};

// Helper: seconds to pace string
SessionSchema.methods.secondsToPace = function(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

module.exports = mongoose.model('Session', SessionSchema);

