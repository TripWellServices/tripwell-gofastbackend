# GoFast Normalized Architecture

## 🎯 Overview

This document describes the refactored, normalized database architecture for GoFast. The new structure provides clean separation of concerns, efficient data hydration, and scalable training plan management.

---

## 📊 Database Collections

### 1. **User** (Existing - Enhanced)
**Purpose:** Core user identity and authentication

```javascript
{
  _id: ObjectId,
  firebaseId: String,          // Firebase Auth UID
  userId: ObjectId,             // Self-reference
  email: String,
  name: String,
  preferredName: String,
  location: String,
  userStatus: String,           // Training journey state
  lastGarminLog: Date,
  createdAt: Date
}
```

**Key Fields:**
- `firebaseId`: Firebase authentication
- `userStatus`: `registered | onboarding | ready_to_train | training | race_mode | race_day | completed`

---

### 2. **Race** ⭐ NEW
**Purpose:** Unified race/event tracking (consolidates TrainingBase + GoalProfile)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // ref: User
  
  // Race Details
  raceName: String,
  raceType: String,             // 5k | 10k | half | marathon
  raceDate: Date,
  goalTime: String,             // "1:45:00"
  goalPace: String,             // "8:00"
  
  // Baseline
  baseline5k: String,           // "24:30"
  baselineWeeklyMileage: Number,
  
  // Race Info
  distanceMiles: Number,
  weeksAway: Number,
  location: String,
  
  // Predictions (updated during training)
  currentPrediction: {
    adaptive5kTime: String,
    projectedTime: String,
    projectedPace: String,
    deltaFromGoal: String,      // "+2:30" or "-1:15"
    confidence: String,         // high | medium | low
    lastUpdated: Date
  },
  
  // Status
  status: String,               // planning | training | taper | race_week | completed
  
  // Course Profile
  courseProfile: { ... },
  
  // Results
  actualResult: {
    finishTime: String,
    pace: String,
    placement: Number,
    completedAt: Date
  },
  
  trainingPlanId: ObjectId      // ref: TrainingPlan
}
```

**Key Features:**
- Single source of truth for race data
- Tracks predictions throughout training
- Stores both goal and actual results

---

### 3. **TrainingPlan** (Refactored)
**Purpose:** Master training plan structure with week summaries

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // ref: User
  raceId: ObjectId,             // ref: Race
  
  startDate: Date,
  raceDate: Date,
  totalWeeks: Number,
  
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
  
  // Week summaries (lightweight)
  weeks: [{
    weekIndex: Number,
    startDate: Date,
    endDate: Date,
    phase: String,
    targetMileage: Number,
    dayIds: [ObjectId],         // ref: TrainingDay
    workoutTypes: [String],
    keyWorkouts: [String]
  }],
  
  status: String                // draft | active | completed | archived
}
```

**Key Changes:**
- References Race for context
- Week summaries with TrainingDay IDs
- Lightweight structure for fast queries

---

### 4. **TrainingDay** ⭐ NEW
**Purpose:** Individual training days with planned vs actual data

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // ref: User
  raceId: ObjectId,             // ref: Race
  trainingPlanId: ObjectId,     // ref: TrainingPlan
  
  // Day Identification
  date: Date,
  weekIndex: Number,            // 0-based
  dayIndex: Number,             // 0-6 (Mon-Sun)
  dayName: String,              // "Monday"
  phase: String,                // base | build | peak | taper
  
  // PLANNED WORKOUT
  planned: {
    type: String,               // rest | easy | tempo | intervals | long_run
    mileage: Number,
    duration: Number,
    paceRange: String,          // "8:30-9:00"
    targetPace: String,         // "8:45"
    hrZone: Number,             // 1-5
    hrRange: String,            // "140-150"
    segments: [{...}],          // For structured workouts
    label: String,              // "Easy Recovery Run"
    description: String,
    coachNotes: String
  },
  
  // ACTUAL WORKOUT (from Garmin)
  actual: {
    completed: Boolean,
    mileage: Number,
    duration: Number,
    pace: String,
    avgHR: Number,
    maxHR: Number,
    hrZoneDistribution: {...},
    sessionId: ObjectId,        // ref: Session
    garminActivityId: String,
    completedAt: Date,
    syncedAt: Date
  },
  
  // ANALYSIS (auto-calculated)
  analysis: {
    workoutCompleted: Boolean,
    hitTargetMileage: Boolean,
    hitTargetPace: Boolean,
    stayedInHRZone: Boolean,
    mileageVariance: Number,
    paceVariance: Number,
    qualityScore: Number        // 0-100
  },
  
  // USER FEEDBACK
  feedback: {
    mood: String,               // emoji
    effort: Number,             // RPE 1-10
    injuryFlag: Boolean,
    notes: String,
    submittedAt: Date
  }
}
```

**Key Features:**
- Planned vs Actual data separation
- Auto-calculated analysis
- Direct Garmin hydration support
- User feedback integration

---

### 5. **Session** ⭐ NEW
**Purpose:** Raw Garmin activity data storage

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // ref: User
  trainingDayId: ObjectId,      // ref: TrainingDay
  
  garminActivityId: String,     // Unique Garmin ID
  activityDate: Date,
  
  // Summary metrics
  distance: Number,
  duration: Number,
  avgPace: String,
  avgHR: Number,
  maxHR: Number,
  
  // Splits
  splits: [{
    lapNumber: Number,
    distance: Number,
    duration: Number,
    pace: String,
    avgHR: Number
  }],
  
  // Advanced metrics
  metrics: {
    aerobicEffect: Number,
    vo2max: Number,
    lactateThreshold: Number,
    recoveryTime: Number
  },
  
  // GPS (optional)
  gpsData: { ... },
  
  // Raw Garmin payload
  rawData: Object,
  
  syncedAt: Date,
  source: String                // garmin_webhook | manual_import
}
```

**Key Features:**
- Complete Garmin activity data
- Linked to TrainingDay for context
- GPS data optional (performance)
- Raw data preserved for future use

---

### 6. **CompletionFlags** ⭐ NEW
**Purpose:** Centralized progress tracking and milestone flags

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // ref: User (unique)
  raceId: ObjectId,             // ref: Race
  
  // ONBOARDING FLAGS
  onboarding: {
    accountCreated: Boolean,
    baselineSet: Boolean,
    goalSet: Boolean,
    planGenerated: Boolean,
    planAccepted: Boolean
  },
  
  // INTEGRATION FLAGS
  integrations: {
    garminConnected: Boolean,
    garminLastSync: Date
  },
  
  // TRAINING FLAGS
  training: {
    trainingStarted: Boolean,
    firstWorkoutComplete: Boolean,
    firstWeekComplete: Boolean,
    weekCompletions: Map,       // weekIndex → Boolean
    buildPhaseComplete: Boolean,
    peakPhaseComplete: Boolean,
    taperPhaseStarted: Boolean
  },
  
  // RACE WEEK FLAGS
  raceWeek: {
    raceWeekStarted: Boolean,
    paceLockedIn: Boolean,
    lockedPace: String,
    courseVisualized: Boolean,
    raceStrategySet: Boolean
  },
  
  // RACE DAY FLAGS
  raceDay: {
    raceStarted: Boolean,
    raceComplete: Boolean,
    resultSubmitted: Boolean
  },
  
  // POST-RACE FLAGS
  postRace: {
    postRaceReview: Boolean,
    reflectionComplete: Boolean,
    nextGoalSet: Boolean
  }
}
```

**Key Features:**
- One document per user
- Comprehensive milestone tracking
- Week-by-week completion map
- Timestamps for all flags

---

## 🔄 Data Flow

### 1. **Plan Generation Flow**
```
User → Create Race → Generate Plan → Create TrainingDays → Activate Plan
```

1. User enters race goal & baseline → **Race** created
2. System generates training plan → **TrainingPlan** created
3. System generates all daily workouts → **TrainingDay** documents created
4. User accepts plan → Status updated, flags planted

### 2. **Daily Workout Flow**
```
Today → Get TrainingDay → Display Planned → Garmin Sync → Hydrate Actual
```

1. Query `TrainingDay` for today's date
2. Display `planned` workout to user
3. Garmin webhook fires when activity complete
4. Create `Session` with raw data
5. Hydrate `TrainingDay.actual` with summary data
6. Calculate `TrainingDay.analysis` automatically

### 3. **Weekly Review Flow**
```
Week End → Aggregate TrainingDays → Update Adaptive5k → Update Race Prediction
```

1. Get all `TrainingDay` docs for week
2. Calculate weekly totals & averages
3. Update adaptive 5k prediction
4. Update `Race.currentPrediction`
5. Plant completion flags

---

## 🚀 API Endpoints

### Race Endpoints
```
POST   /api/race/create              Create new race
GET    /api/race/active              Get active race
GET    /api/race/:raceId             Get race by ID
PUT    /api/race/:raceId/prediction  Update prediction
PUT    /api/race/:raceId/status      Update status
POST   /api/race/:raceId/result      Submit result
GET    /api/race/user/all            Get all user races
```

### Training Plan Endpoints
```
POST   /api/training-plan/generate/:raceId    Generate plan
PUT    /api/training-plan/:planId/activate    Activate plan
GET    /api/training-plan/race/:raceId        Get plan for race
GET    /api/training-plan/active              Get active plan
```

### Training Day Endpoints
```
GET    /api/training-day/today                Get today's workout
GET    /api/training-day/date/:date           Get workout by date
GET    /api/training-day/week/:weekIndex      Get week workouts
POST   /api/training-day/:id/feedback         Submit feedback
GET    /api/training-day/week/:weekIndex/summary  Weekly summary
GET    /api/training-day/progress             Training progress
POST   /api/training-day/hydrate/:date        Trigger Garmin hydration
```

---

## 🔧 Services

### RaceService
- `createRace()` - Create new race
- `getActiveRace()` - Get user's active race
- `updateRacePrediction()` - Update prediction from adaptive 5k
- `submitRaceResult()` - Submit race result

### TrainingPlanGeneratorService
- `generateTrainingPlan()` - Generate complete plan
- `activateTrainingPlan()` - Activate plan
- `getTrainingPlan()` - Get plan for race

### TrainingDayService
- `getTodayWorkout()` - Get today's workout
- `hydrateGarminData()` - Hydrate Garmin data
- `submitWorkoutFeedback()` - Submit user feedback
- `getWeeklySummary()` - Get weekly summary
- `batchCreateTrainingDays()` - Create multiple days

---

## 🔄 Migration

### Running the Migration Script

```bash
node scripts/migrateToNormalizedModels.js
```

**What it does:**
1. Migrates `TrainingBase + GoalProfile` → `Race`
2. Migrates old `TrainingPlan` → new structure + `TrainingDay`
3. Migrates `GarminActivity` → `Session`
4. Creates `CompletionFlags` for existing users

**Safe to re-run:** Script checks for existing data and skips duplicates

---

## ✅ Benefits of New Architecture

### 1. **Clean Separation**
- Race data separate from training data
- Planned vs actual clearly distinguished
- Raw Garmin data isolated in Session

### 2. **Efficient Queries**
- Direct queries for today's workout
- Week summaries without loading all days
- Fast status checks via CompletionFlags

### 3. **Scalability**
- TrainingDay can scale to 100+ weeks
- Session can store unlimited GPS data
- Race supports multiple races per user

### 4. **Data Integrity**
- Clear relationships via ObjectId refs
- No duplicate data
- Single source of truth for each entity

### 5. **Hydration Pattern**
- Garmin data overlays planned workouts
- Analysis auto-calculated on save
- No manual sync required

---

## 📝 Development Guidelines

### Creating a Race
```javascript
const race = await RaceService.createRace({
  userId: user._id,
  raceName: "Boston Marathon",
  raceType: "marathon",
  raceDate: "2024-04-15",
  goalTime: "3:30:00",
  baseline5k: "22:30",
  baselineWeeklyMileage: 30
});
```

### Generating a Plan
```javascript
const { plan } = await TrainingPlanGeneratorService.generateTrainingPlan(
  race._id,
  userAge
);
```

### Getting Today's Workout
```javascript
const workout = await TrainingDayService.getTodayWorkout(userId);
// Returns: { planned, actual, analysis, feedback, status }
```

### Hydrating Garmin Data
```javascript
// Automatic via webhook OR manual trigger:
const trainingDay = await TrainingDayService.hydrateGarminData(
  userId,
  "2024-01-15"
);
```

---

## 🎯 Next Steps

1. ✅ Models created
2. ✅ Services implemented
3. ✅ Routes wired up
4. ✅ Migration script ready
5. 🔄 Run migration on staging
6. 🔄 Test API endpoints
7. 🔄 Update frontend to use new endpoints
8. 🔄 Deploy to production

---

**Last Updated:** January 2024  
**Version:** 2.0.0  
**Status:** Ready for deployment

