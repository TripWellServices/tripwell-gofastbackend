# TripWell User Model Documentation

## Overview
The TripWellUser model tracks users through their journey from signup to trip completion, with Python providing intelligent analysis and state management.

## Core Identity Fields
```javascript
{
  _id: ObjectId,           // MongoDB primary key - THE USER ID
  firebaseId: String,      // Firebase Auth UID (unique)
  email: String,           // User's email address
}
```

## Profile Fields
```javascript
{
  firstName: String,       // User's first name
  lastName: String,        // User's last name
  hometownCity: String,    // "City/State You Call Home"
  state: String,           // State dropdown selection
  travelStyle: [String],   // Checkbox group selections
  tripVibe: [String],      // Checkbox group selections
  profileComplete: Boolean // true when profile setup is complete
}
```

## Trip Fields
```javascript
{
  tripId: ObjectId,        // Reference to user's trip (null if no trip)
  role: String,            // "noroleset" | "originator" | "participant"
}
```

## Funnel Stage (User Progression)
```javascript
{
  funnelStage: String,     // Where user is in the funnel
  // Values:
  // - "none" (default) - Just signed up
  // - "spots_demo" - Best spots demo mode
  // - "itinerary_demo" - Itinerary demo mode  
  // - "vacation_planner_demo" - Vacation Location Planner demo mode
  // - "updates_only" - Updates only mode
  // - "full_app" - Full app experience
}
```

## Journey Stage (Where they are in the flow)
```javascript
{
  journeyStage: String,    // Where user is in their journey
  // Values:
  // - "new_user" - Pre profile complete
  // - "profile_complete" - Profile done, no trip yet
  // - "trip_set_done" - Trip created, itinerary not complete
  // - "itinerary_complete" - Itinerary done, trip not started
  // - "trip_active" - Trip is happening now
  // - "trip_complete" - Trip finished
}
```

## User State (Simplified)
```javascript
{
  userState: String,               // Simple user state
  // Values:
  // - "demo_only" - User only uses demos, no profile/trip
  // - "active" - User has profile and/or trip, engaged
  // - "abandoned" - User signed up but never completed profile
  // - "inactive" - User completed profile but no trip activity, or trip created but never activated and date passed
}
```

## Analysis Tracking
```javascript
{
  lastAnalyzedAt: Date,    // When Python last analyzed this user
  createdAt: Date,         // When user was created (MongoDB timestamp)
  updatedAt: Date          // When user was last updated (MongoDB timestamp)
}
```

## Complete Schema
```javascript
const tripWellUserSchema = new mongoose.Schema({
  // Core Identity
  firebaseId: { type: String, required: true, unique: true },
  email: { type: String, default: "" },
  
  // Profile
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  hometownCity: { type: String, default: "" },
  state: { type: String, default: "" },
  travelStyle: { type: [String], default: [] },
  tripVibe: { type: [String], default: [] },
  profileComplete: { type: Boolean, default: false },
  
  // Trip
  tripId: { type: mongoose.Schema.Types.ObjectId, default: null },
  role: { 
    type: String, 
    default: "noroleset",
    enum: ["noroleset", "originator", "participant"]
  },
  
  // Funnel Stage
  funnelStage: {
    type: String,
    default: "none",
    enum: ["none", "spots_demo", "itinerary_demo", "vacation_planner_demo", "updates_only", "full_app"]
  },
  
  // Journey Stage (Python managed)
  journeyStage: {
    type: String,
    default: "new_user",
    enum: ["new_user", "profile_complete", "trip_set_done", "itinerary_complete", "trip_active", "trip_complete"]
  },
  
  // User State (Python managed)
  userState: {
    type: String,
    default: "demo_only",
    enum: ["demo_only", "active", "abandoned", "inactive"]
  },
  
  // Analysis Tracking
  lastAnalyzedAt: { type: Date, default: null }
}, { timestamps: true });
```

## Key Relationships

### Funnel Stage vs Journey Stage
- **Funnel Stage**: Where user is in the app experience (demo vs full app)
- **Journey Stage**: Where user is in their trip planning journey

### Demo Mode Logic
```javascript
// User is in demo mode if funnelStage is:
is_demo_mode = funnelStage in ['spots_demo', 'itinerary_demo', 'vacation_planner_demo']

// User is in full app if:
funnelStage === 'full_app'
```

### User State Logic
```javascript
// Demo Only: User only uses demos, no profile/trip
userState = "demo_only" // when funnelStage is demo mode and no profile

// Active: User has profile and/or trip, engaged
userState = "active" // when profileComplete OR has tripId

// Abandoned: User signed up but never completed profile
userState = "abandoned" // when !profileComplete && days_since_signup > 15

// Inactive: User completed profile but no trip activity, or trip created but never activated and date passed
userState = "inactive" // when:
//   - profileComplete && !tripId && days_since_signup > 15, OR
//   - has trip but trip date passed and never activated
```

## Python Integration

### What Python Does
1. **Analyzes** user data to determine journey stage
2. **Calculates** user state based on current state
3. **Updates** the user model with journey stage and user state
4. **Sends** appropriate emails based on user state

### What Node.js Does
1. **Creates** users with basic info
2. **Sends** user data to Python for analysis
3. **Reads** journey stage and user state from model
4. **Displays** user state in admin dashboard

### Data Flow
```
User Action → Node.js → Python Analysis → Model Update → Admin Dashboard
```

## Usage Examples

### Creating a New User
```javascript
const user = new TripWellUser({
  firebaseId: "abc123",
  email: "user@example.com",
  funnelStage: "none"
});
// journeyStage defaults to "new_user"
// userState defaults to "demo_only"
```

### Python Analysis Result
```javascript
// After Python analysis:
user.journeyStage = "profile_complete";
user.userState = "active";
user.lastAnalyzedAt = new Date();
```

### Admin Dashboard Query
```javascript
// Get all demo only users
const demoUsers = await TripWellUser.find({
  userState: "demo_only"
});

// Get all active users
const activeUsers = await TripWellUser.find({
  userState: "active"
});

// Get all abandoned users
const abandonedUsers = await TripWellUser.find({
  userState: "abandoned"
});

// Get users by journey stage
const profileCompleteUsers = await TripWellUser.find({
  journeyStage: "profile_complete"
});
```
