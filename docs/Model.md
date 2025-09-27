# MODEL DOCUMENTATION - TripWell Database Schema

## 🎯 **Purpose**
This document provides comprehensive documentation of all TripWell database models, their fields, relationships, and usage patterns.

## 📊 **MODEL OVERVIEW**

### **Core User Models**
- `TripWellUser` - User profiles and authentication
- `TripBase` - Trip information and metadata

### **Planning Models**
- `TripPersona` - User persona preferences per trip
- `MetaAttractions` - City-specific attraction libraries
- `UserSelections` - User's selected attractions and samples
- `CityStuffToDo` - Generated samples for cities
- `SampleSelects` - User's sample selections

### **Itinerary Models**
- `ItineraryDays` - **Source of Truth** - Raw AI-generated itinerary (Bible)
- `TripCurrentDays` - **Live Trip State** - User-modifiable daily itinerary during trip
- `TripDay` - **Planning Phase** - Day-by-day itinerary structure for planning
- `TripReflection` - Daily reflections and journaling

**🏗️ ARCHITECTURE RATIONALE:**
- **NO FLAG PLANTS** - Trip status determined by data existence, not boolean flags
- **Hydration Strategy** - Frontend checks for data existence to determine trip state
- **Separation of Concerns** - Planning vs Live trip data kept separate

### **Supporting Models**
- `City` - City metadata and references
- `JoinCode` - Trip join code registry

---

## 🔑 **CORE USER MODELS**

### **TripWellUser**
**Purpose:** User profiles, authentication, and journey tracking

```javascript
{
  // Authentication
  firebaseId: String (unique),           // Firebase UID
  email: String,                         // User email
  
  // Profile Information
  firstName: String,                     // User's first name
  lastName: String,                      // User's last name
  hometownCity: String,                  // "City/State You Call Home"
  homeState: String,                     // Dropdown selection
  dreamDestination: String,              // Dream travel destination
  
  // Travel Preferences
  travelStyle: [String],                 // ["Luxury", "Budget", "Spontaneous", "Planned"]
  tripVibe: [String],                    // ["Chill", "Adventure", "Party", "Culture"]
  
  // Journey Tracking
  profileComplete: Boolean,              // Profile setup completion
  userStatus: String,                    // "signup", "active", "demo_only", "abandoned", "inactive"
  journeyStage: String,                  // "new_user", "profile_complete", "trip_set_done", etc.
  funnelStage: String,                   // "none", "spots_demo", "itinerary_demo", "full_app"
  
  // Trip Association
  tripId: ObjectId,                      // Current trip reference
  role: String,                          // "noroleset", "originator", "participant"
  
  // Persona Weights (from ProfileSetup)
  personaScore: Number,                  // Art/Food/History/Adventure preference
  planningFlex: Number,                  // Spontaneity vs Planning preference
  
  // Marketing Tracking
  lastAnalyzedAt: Date,                  // When Python last analyzed user
  lastMarketingEmail: {
    sentAt: Date,
    campaign: String,
    status: String
  }
}
```

**Key Relationships:**
- `tripId` → `TripBase._id`
- One user can have multiple trips over time

---

### **TripBase**
**Purpose:** Trip information, dates, and metadata

```javascript
{
  // Trip Identity
  joinCode: String (required),           // Unique trip identifier
  tripName: String (required),           // User-defined trip name
  purpose: String (required),            // Trip purpose/description
  
  // Trip Details
  startDate: Date (required),            // Trip start date
  endDate: Date (required),              // Trip end date
  arrivalTime: String,                   // "14:30", "morning", "evening"
  city: String (required),               // Destination city
  country: String (required),            // Destination country
  cityId: ObjectId,                      // Reference to City model
  
  // Group Information
  partyCount: Number (min: 1),           // Number of travelers
  whoWith: String,                       // "spouse", "friends", "solo", etc.
  
  // Computed Weights
  romanceLevel: Number (0-1),            // Romance preference weight
  caretakerRole: Number (0-1),           // Caretaker role weight
  
  // Computed Fields
  season: String,                        // "Spring", "Summer", "Fall", "Winter"
  daysTotal: Number,                     // Total trip duration
  
  // Trip Status
  tripStartedByOriginator: Boolean,      // Has trip been started?
  tripStartedByParticipant: Boolean,     // Participant started?
  tripComplete: Boolean,                 // Is trip finished?
}
```

**Key Relationships:**
- `cityId` → `City._id`
- One trip can have multiple `TripDay` documents
- One trip can have multiple `TripReflection` documents

---

## 🎭 **PLANNING MODELS**

### **TripPersona**
**Purpose:** User's persona preferences for a specific trip

```javascript
{
  // References
  tripId: ObjectId (required),           // Trip reference
  userId: String (required),             // User reference (⚠️ Should be ObjectId)
  
  // Persona Preferences
  primaryPersona: String,                // "art", "foodie", "adventure", "history"
  budget: Number,                        // Daily budget amount
  dailySpacing: Number (0-1),            // Activity density preference
  
  // Status
  status: String,                        // "created", "active", "completed"
  createdAt: Date,
  updatedAt: Date
}
```

**⚠️ Issue:** `userId` should be `ObjectId` for consistency

---

### **MetaAttractions**
**Purpose:** City-specific attraction libraries by season

```javascript
{
  // Location
  cityId: ObjectId (required),           // City reference
  cityName: String (required),           // City name for easy queries
  season: String (required),             // "spring", "summer", "fall", "winter"
  
  // Attractions
  metaAttractions: [{
    name: String (required),             // Attraction name
    type: String (required),             // Attraction type
    reason: String (required)            // Why it's recommended
  }],
  
  // Status
  status: String,                        // "meta_generated"
  createdAt: Date
}
```

**Usage Pattern:**
- Generated once per city/season combination
- Cached for fast lookups
- Used as source for user selection

---

### **UserSelections**
**Purpose:** User's selected attractions and behavior tracking

```javascript
{
  // References
  tripId: ObjectId (required),           // Trip reference
  userId: String (required),             // User reference (⚠️ Should be ObjectId)
  
  // Meta Attraction Selections
  selectedMetas: [{
    name: String (required),             // Selected attraction name
    type: String (required),             // Attraction type
    reason: String (required),           // Why user selected it
    selectedAt: Date                     // When selected
  }],
  
  // Sample Selections
  selectedSamples: [{
    name: String (required),             // Selected sample name
    type: String (required),             // Sample type
    why_recommended: String (required),  // Why recommended
    selectedAt: Date                     // When selected
  }],
  
  // Behavior Tracking
  behaviorData: {
    totalSelections: Number,             // Total selections made
    metaPreferences: {                   // Meta type preferences
      art: Number,
      foodie: Number,
      adventure: Number,
      history: Number
    },
    samplePreferences: {                 // Sample type preferences
      attraction: Number,
      restaurant: Number,
      neat_thing: Number
    },
    lastUpdated: Date
  },
  
  // Status
  status: String,                        // "active", "completed", "archived"
  createdAt: Date,
  updatedAt: Date
}
```

**⚠️ Issue:** `userId` should be `ObjectId` for consistency

---

### **CityStuffToDo**
**Purpose:** Generated samples for cities (content library)

```javascript
{
  // Location
  cityId: String (required),             // City identifier
  season: String (required),             // "spring", "summer", "fall", "winter", "any"
  
  // Generated Samples
  samples: {
    attractions: [{
      id: String,
      name: String,
      description: String
    }],
    restaurants: [{
      id: String,
      name: String,
      description: String
    }],
    neatThings: [{
      id: String,
      name: String,
      description: String
    }]
  },
  
  // Generation Metadata
  metadata: {
    persona_weights: {                   // Persona weights used
      art: Number,
      foodie: Number,
      adventure: Number,
      history: Number
    },
    budget_level: Number,
    romance_level: Number,
    caretaker_role: Number,
    flexibility: Number,
    who_with: String,
    daily_spacing: Number,
    season: String,
    purpose: String,
    budget: Number
  },
  
  // Debugging
  prompt: String,                        // Full prompt used for generation
  
  createdAt: Date,
  updatedAt: Date
}
```

**Usage Pattern:**
- Generated once per city/season/persona combination
- Cached for fast lookups
- Used as source for user sample selection

---

### **SampleSelects**
**Purpose:** User's selected samples from generated options

```javascript
{
  // References
  sampleObjectId: ObjectId (required),   // Reference to CityStuffToDo
  tripId: ObjectId (required),           // Trip reference
  cityId: String (required),             // City identifier
  userId: String (required),             // User reference (⚠️ Should be ObjectId)
  
  // Selections
  selectedSamples: [String],             // Array of sample IDs
  
  createdAt: Date
}
```

**⚠️ Issue:** `userId` should be `ObjectId` for consistency

---

## 📅 **ITINERARY MODELS**

### **TripDay**
**Purpose:** Day-by-day itinerary structure

```javascript
{
  // References
  tripId: ObjectId (required),           // Trip reference
  dayIndex: Number (required),           // Day number (1, 2, 3...)
  
  // Day Content
  summary: String,                       // Day summary from GPT
  blocks: {
    morning: {
      title: String,
      description: String,
      complete: Boolean (default: false)
    },
    afternoon: {
      title: String,
      description: String,
      complete: Boolean (default: false)
    },
    evening: {
      title: String,
      description: String,
      complete: Boolean (default: false)
    }
  },
  
  // Status Tracking
  isComplete: Boolean (default: false),  // Day completion status
  modifiedByUser: Boolean (default: false), // User modifications
  modificationMethod: String,            // "gpt", "manual"
  
  createdAt: Date,
  updatedAt: Date
}
```

**Key Constraints:**
- Unique combination of `tripId` + `dayIndex`
- `dayIndex` starts at 1 (not 0)

---

### **TripReflection**
**Purpose:** Daily reflections and journaling

```javascript
{
  // References
  tripId: ObjectId (required),           // Trip reference
  dayIndex: Number (required),           // Day number
  userId: String (required),             // User reference (⚠️ Should be ObjectId)
  
  // Reflection Content
  summary: String,                       // Day summary (from TripDay)
  moodTags: [String],                    // Mood tags/sentiment categories
  journalText: String,                   // Freeform reflection text
  
  createdAt: Date,
  updatedAt: Date
}
```

**⚠️ Issue:** `userId` should be `ObjectId` for consistency

---

## 🏙️ **SUPPORTING MODELS**

### **City**
**Purpose:** City metadata and references

```javascript
{
  cityName: String (required),           // City name
  // Additional city metadata can be added here
}
```

**Usage Pattern:**
- Created when new cities are encountered
- Referenced by `TripBase.cityId`
- Used for meta attractions and samples generation

---

### **JoinCode**
**Purpose:** Trip join code registry

```javascript
{
  joinCode: String (required),           // Join code
  tripId: ObjectId (required),           // Trip reference
  userId: ObjectId (required),           // Creator reference
  createdAt: Date
}
```

**Usage Pattern:**
- Ensures join code uniqueness
- Links join codes to trips and creators
- Used for participant joining flow

---

## 🔧 **IDENTIFIED ISSUES**

### **1. UserId Consistency Issue**
**Problem:** Multiple models use `String` for `userId` instead of `ObjectId`

**Affected Models:**
- `TripPersona.userId`
- `UserSelections.userId`
- `SampleSelects.userId`
- `TripReflection.userId`

**Fix Required:**
```javascript
// Current (WRONG)
userId: { type: String, required: true }

// Should be (CORRECT)
userId: { type: mongoose.Schema.Types.ObjectId, ref: "TripWellUser", required: true }
```

### **2. CityId Type Inconsistency**
**Problem:** Some models use `String` for `cityId`, others use `ObjectId`

**Affected Models:**
- `CityStuffToDo.cityId` (String)
- `SampleSelects.cityId` (String)
- `TripBase.cityId` (ObjectId)

**Fix Required:**
- Standardize on `ObjectId` for all city references
- Update frontend to send ObjectIds instead of strings

---

## 🎯 **BEST PRACTICES**

### **1. Data Consistency**
- Use `ObjectId` for all references to other models
- Include `ref` property for proper population
- Use consistent naming conventions

### **2. Indexing Strategy**
- Index frequently queried fields
- Use compound indexes for multi-field queries
- Consider unique constraints where appropriate

### **3. Validation**
- Use Mongoose validators for data integrity
- Implement business logic validation
- Handle edge cases gracefully

### **4. Relationships**
- Use proper references instead of embedding
- Consider population needs in queries
- Maintain referential integrity

---

## 📋 **TESTING CHECKLIST**

### **Model Validation:**
- [ ] All required fields are properly validated
- [ ] Enum values are correctly defined
- [ ] ObjectId references work correctly
- [ ] Unique constraints prevent duplicates

### **Data Consistency:**
- [ ] UserId references work across all models
- [ ] CityId references work across all models
- [ ] TripId references work across all models
- [ ] No orphaned references exist

### **Performance:**
- [ ] Indexes are properly defined
- [ ] Queries are optimized
- [ ] Population works efficiently
- [ ] No N+1 query problems

### **Business Logic:**
- [ ] Journey stage transitions work correctly
- [ ] Trip status updates properly
- [ ] User role assignments work
- [ ] Reflection data saves correctly
