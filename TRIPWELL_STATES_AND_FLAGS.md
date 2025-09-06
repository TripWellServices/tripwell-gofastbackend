# TripWell States & Flags Reference

## 🚨 **FREEZE FRAME - ALL THE FLAGS WE GOT**

This is getting nuts, so here's EVERY flag, state, and status in the TripWell system.

## 👤 **USER STATES & FLAGS**

### **TripWellUser Model Flags**
```javascript
{
  // === AUTHENTICATION ===
  firebaseId: String,           // Firebase UID (unique identifier)
  email: String,               // User's email address
  
  // === PROFILE DATA ===
  firstName: String,           // User's first name
  lastName: String,            // User's last name
  hometownCity: String,        // "City/State You Call Home"
  state: String,               // US state dropdown
  
  // === PREFERENCES ===
  travelStyle: [String],       // ["Luxury", "Budget", "Spontaneous", "Planned"]
  tripVibe: [String],          // ["Chill", "Adventure", "Party", "Culture"]
  
  // === STATUS FLAGS ===
  profileComplete: Boolean,    // ✅ Profile setup completed?
  tripId: ObjectId,           // Current trip assignment
  role: String,               // "noroleset" | "originator" | "participant"
  funnelStage: String,        // User engagement level (see below)
}
```

### **User Role States**
- **"noroleset"** - Default, no role assigned yet
- **"originator"** - User who created the trip
- **"participant"** - User who joined via join code

### **Funnel Stage States** 🎯
- **"none"** - Brand new user (gets welcome emails)
- **"itinerary_demo"** - User tried itinerary demo
- **"spots_demo"** - User tried best things demo
- **"updates_only"** - User wants updates only
- **"full_app"** - User is using full app

## 🏗️ **TRIP STATES & FLAGS**

### **TripBase Model**
```javascript
{
  joinCode: String,           // Unique trip identifier
  tripName: String,           // User-defined trip name
  purpose: String,            // Trip purpose/description
  startDate: Date,            // Trip start date
  endDate: Date,              // Trip end date
  city: String,               // Destination city
  partyCount: Number,         // Number of people
  whoWith: [String],          // ["spouse", "kids", "friends", "parents", "multigen", "solo", "other"]
  season: String,             // Computed season
  daysTotal: Number,          // Computed total days
}
```

### **TripDay Model Flags**
```javascript
{
  tripId: ObjectId,           // Trip reference
  dayIndex: Number,           // Day number (1, 2, 3...)
  summary: String,            // Day summary
  blocks: {
    morning: { 
      title: String,
      description: String,
      complete: Boolean,      // ✅ Block completion flag
      // ... other fields
    },
    afternoon: { /* same structure */ },
    evening: { /* same structure */ }
  },
  isComplete: Boolean,        // ✅ Day completion flag
  modifiedByUser: Boolean,    // ✅ User modification flag
  modificationMethod: String, // "gpt" | "manual"
}
```

## 🎯 **LIVE TRIP STATES**

### **Trip Live Status Flags**
- **tripStarted: Boolean** - Has the trip begun?
- **currentDayIndex: Number** - Which day are we on?
- **currentBlock: String** - "morning" | "afternoon" | "evening"
- **tripComplete: Boolean** - Is the entire trip finished?

### **Block Completion States**
- **morning.complete: Boolean**
- **afternoon.complete: Boolean** 
- **evening.complete: Boolean**
- **isComplete: Boolean** - All blocks complete

## 📧 **EMAIL STATES & FLAGS**

### **Email Service States**
- **status: "sent"** - Email sent successfully
- **status: "failed"** - Email failed to send
- **status: "pending"** - Email queued for sending

### **Email Trigger Flags**
- **onboarding: Boolean** - Should send welcome email?
- **funnelStage: "none"** - Triggers welcome email
- **isNewUser: Boolean** - New user creation flag

## 🛡️ **ADMIN STATES & FLAGS**

### **Admin Authentication**
- **adminLoggedIn: Boolean** - Admin session active
- **ADMIN_USERNAME: String** - Admin username
- **ADMIN_PASSWORD: String** - Admin password

### **User Status Categories**
- **Active User** - Has active trip (do not delete)
- **New User** - Account <15 days old with profile
- **Incomplete Profile** - New account, give them time
- **Abandoned Account** - Account >15 days old, no profile (safe to delete)
- **Inactive User** - Account >15 days old with profile but no trip

## 🔄 **DEMO FUNNEL STATES**

### **Demo User States**
- **funnelStage: "spots_demo"** - Best things demo user
- **funnelStage: "itinerary_demo"** - Itinerary demo user
- **funnelStage: "vacation_planner_demo"** - Vacation planner demo user

### **Demo Data Flags**
- **bestThingsData: Object** - Stored demo recommendations
- **itineraryData: Object** - Stored demo itinerary
- **vacationData: Object** - Stored vacation recommendations

## 🧠 **AI/OPENAI STATES**

### **GPT Service States**
- **generationStatus: "pending"** - AI generation in progress
- **generationStatus: "complete"** - AI generation finished
- **generationStatus: "failed"** - AI generation failed

### **Anchor Logic States**
- **enrichedAnchors: Array** - AI-enriched anchor data
- **anchorTitles: Array** - Selected anchor titles
- **anchorSelectComplete: Boolean** - Anchor selection done

## 📱 **FRONTEND STATES**

### **localStorage Flags**
- **userData: Object** - Cached user data
- **tripData: Object** - Cached trip data
- **itineraryData: Object** - Cached itinerary
- **anchorLogic: Object** - Cached anchor selections
- **profileComplete: Boolean** - Profile completion flag

### **Navigation States**
- **startedTrip: Boolean** - Has user started their trip?
- **currentRoute: String** - Current page/route
- **authState: String** - Firebase auth state

## 🚨 **ERROR STATES**

### **API Error States**
- **401 Unauthorized** - Missing/invalid Firebase token
- **400 Bad Request** - Missing required fields
- **404 Not Found** - User/trip not found
- **500 Internal Server Error** - Server/database error

### **Service Error States**
- **ECONNREFUSED** - Service unavailable
- **ETIMEDOUT** - Request timeout
- **Email service error** - Email sending failed

## 🔧 **DEPLOYMENT STATES**

### **Environment States**
- **NODE_ENV: "development" | "production"**
- **MONGO_URI: String** - Database connection
- **OPENAI_API_KEY: String** - AI service key
- **EMAIL_SERVICE_URL: String** - Email service URL

### **Service Health States**
- **status: "healthy"** - Service is running
- **status: "unhealthy"** - Service has issues
- **status: "starting"** - Service is starting up

## 📊 **ANALYTICS STATES**

### **User Journey States**
- **signupDate: Date** - When user joined
- **lastActive: Date** - Last activity timestamp
- **tripCount: Number** - Number of trips created
- **completionRate: Number** - Trip completion percentage

### **Funnel Conversion States**
- **demoToFullConversion: Boolean** - Did demo user convert?
- **profileCompletionRate: Number** - Profile completion percentage
- **tripStartRate: Number** - Trip start percentage

## 🎯 **QUICK REFERENCE**

### **Most Important Flags**
1. **funnelStage** - User engagement level
2. **profileComplete** - Profile setup done
3. **role** - User's trip role
4. **tripStarted** - Has trip begun?
5. **isComplete** - Day/trip finished?

### **Email Trigger Logic**
```javascript
// Send welcome email when:
if (isNewUser && funnelStage === "none") {
  // Send welcome email
}

// Don't send when:
if (funnelStage === "spots_demo" || funnelStage === "itinerary_demo") {
  // Skip welcome email
}
```

### **User State Progression**
```
New User → funnelStage: "none" → profileComplete: false
    ↓
Profile Setup → profileComplete: true → funnelStage: "full_app"
    ↓
Trip Creation → role: "originator" → tripId: assigned
    ↓
Trip Start → tripStarted: true → currentDayIndex: 1
    ↓
Trip Complete → tripComplete: true → isComplete: true
```

## 🚨 **THIS IS WHY WE NEED THIS DOC**

The system has **WAY TOO MANY** flags and states. This reference should help us:
- Avoid creating duplicate flags
- Understand existing state logic
- Debug state-related issues
- Plan new features without conflicts

**Bottom line**: We have flags for everything. Use this doc to avoid adding more! 🚩
