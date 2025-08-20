# TripWell Backend Development Guide

## 🏗️ System Architecture Overview

TripWell is a Node.js/Express backend with MongoDB database, Firebase authentication, and OpenAI integration for AI-powered trip planning.

### Core Technologies
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **AI Integration**: OpenAI GPT API
- **Deployment**: Render (production), Replit (development)

## 🗄️ **DATA MODELS** (Deep Dive)

### **TripWellUser Model** (`models/TripWellUser.js`)
```javascript
{
  firebaseId: { type: String, required: true, unique: true },     // Firebase UID
  email: { type: String, default: "" },                           // Firebase email
  firstName: { type: String, default: "" },                       // User input
  lastName: { type: String, default: "" },                        // User input
  hometownCity: { type: String, default: "" },                    // "City/State You Call Home"
  state: { type: String, default: "" },                           // Dropdown selection
  travelStyle: { type: [String], default: [] },                   // ["Luxury", "Budget", "Spontaneous", "Planned"]
  tripVibe: { type: [String], default: [] },                      // ["Chill", "Adventure", "Party", "Culture"]
  profileComplete: { type: Boolean, default: false },             // Tracks profile setup completion
  tripId: { type: ObjectId, default: null },                      // Set post trip creation
  role: { 
    type: String, 
    default: "noroleset",
    enum: ["noroleset", "originator", "participant"]              // Set post trip creation
  }
}
```

### **TripBase Model** (`models/TripWell/TripBase.js`)
```javascript
{
  joinCode: { type: String, required: true },                     // Unique trip identifier
  tripName: { type: String, required: true },                     // User input
  purpose: { type: String, required: true },                      // User input
  startDate: { type: Date, required: true },                      // User input
  endDate: { type: Date, required: true },                        // User input
  city: { type: String, required: true },                         // User input
  partyCount: { type: Number, default: 1, min: 1 },              // User input
  whoWith: {
    type: [String],
    default: [],
    enum: ["spouse", "kids", "friends", "parents", "multigen", "solo", "other"]
  },
  season: { type: String },                                       // Computed by parseTrip service
  daysTotal: { type: Number },                                    // Computed by parseTrip service
  timestamps: true                                                // createdAt, updatedAt
}
```

## 🔄 **COMPLETE USER FLOW** (What to Debug)

### **Step 1: Access → Firebase Authentication**
**Frontend**: `/access` - Firebase Google sign-in
**Backend**: `POST /tripwell/user/createOrFind` (unprotected)

**What Can Break:**
- ❌ **Firebase popup blocked** → User can't sign in
- ❌ **Google OAuth fails** → Authentication error
- ❌ **User creation fails** → Backend error
- ❌ **Network issues** → Sign-in timeout

**Flow Logic:**
- ✅ **Existing user** → Route to `/hydratelocal`
- ❌ **New user** → Route to `/profilesetup`

**Debug Commands:**
```bash
# Test user creation endpoint
curl -X POST -H "Content-Type: application/json" \
  -d '{"firebaseId":"TEST_UID","email":"test@example.com"}' \
  http://localhost:5000/tripwell/user/createOrFind

# Check if user exists
# MongoDB: db.tripwellusers.findOne({firebaseId: "USER_UID"})
```

### **Step 2: ProfileSetup → User Profile Creation**
**Frontend**: User fills out profile (name, hometown, travel style, trip vibe)
**Backend**: `PUT /tripwell/profile` (protected)

**Model Fields Required:**
- `firstName` (String) - User input
- `lastName` (String) - User input  
- `hometownCity` (String) - "City/State You Call Home"
- `state` (String) - Dropdown selection
- `travelStyle` ([String]) - Checkbox group: ["Luxury", "Budget", "Spontaneous", "Planned"]
- `tripVibe` ([String]) - Checkbox group: ["Chill", "Adventure", "Party", "Culture"]

**Auto-filled from Firebase:**
- `firebaseId` - From `auth.currentUser.uid`
- `email` - From `auth.currentUser.email`

**What Can Break:**
- ❌ **Missing required fields** → Validation error
- ❌ **Invalid data types** → Schema validation fails
- ❌ **Profile save fails** → Database error
- ❌ **Firebase data missing** → Auto-fill fails

**Flow Logic:**
- ✅ **Profile saved** → **ALWAYS routes to `/tripsetup`**
- ✅ **profileComplete** → Set to `true`

**Debug Commands:**
```bash
# Test profile update
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","hometownCity":"NYC","state":"NY","travelStyle":["Luxury"],"tripVibe":["Chill"]}' \
  http://localhost:5000/tripwell/profile

# Check profile completion
# MongoDB: db.tripwellusers.findOne({firebaseId: "USER_UID"}, {profileComplete: 1, firstName: 1, lastName: 1})
```

### **Step 3: TripSetup → Trip Creation**
**Frontend**: User creates new trip (name, purpose, city, dates, join code)
**Backend**: `POST /tripwell/trip-setup` (protected)

**Required Fields:**
- `tripName` (String) - User input
- `purpose` (String) - User input
- `city` (String) - User input
- `startDate` (Date) - User input
- `endDate` (Date) - User input
- `joinCode` (String) - User input

**Optional Fields:**
- `partyCount` (Number, min: 1) - Defaults to 1
- `whoWith` ([String]) - Array from enum: ["spouse", "kids", "friends", "parents", "multigen", "solo", "other"]

**Backend Processing:**
1. **Save TripBase** - Creates trip record
2. **parseTrip Service** - Computes `daysTotal`, `season`, `dateRange`
3. **setUserTrip Service** - Links user to trip, sets role to "originator"
4. **pushTripToRegistry** - Registers join code

**What Can Break:**
- ❌ **Missing required fields** → 400 error (tripName, purpose, city, startDate, endDate, joinCode)
- ❌ **Invalid date format** → 400 error
- ❌ **Join code already exists** → Validation error
- ❌ **User not found for patch work** → Trip saves but user not linked
- ❌ **parseTrip service fails** → Trip saves but no computed fields
- ❌ **setUserTrip fails** → Trip saves but user not linked

**Flow Logic:**
- ✅ **Trip created** → Route to `/tripcreated`
- ✅ **User role** → Set to "originator"
- ✅ **Computed fields** → `daysTotal`, `season` added

**Debug Commands:**
```bash
# Test trip creation
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tripName":"Test","purpose":"vacation","city":"NYC","startDate":"2024-01-01","endDate":"2024-01-03","joinCode":"TEST123"}' \
  http://localhost:5000/tripwell/trip-setup

# Check if trip was created
# MongoDB: db.tripbases.findOne({joinCode: "TEST123"})

# Check user role assignment
# MongoDB: db.tripwellusers.findOne({tripId: ObjectId("TRIP_ID")}, {role: 1})
```

### **Step 4: TripCreated → Success & Role Assignment**
**Frontend**: Shows trip success, share options, role assignment
**Backend**: `GET /tripwell/tripcreated/:tripId` (protected)

**What Can Break:**
- ❌ **Trip not found** → 404 error
- ❌ **Role assignment fails** → User not properly linked
- ❌ **User data missing** → Display errors

**Flow Logic:**
- ✅ **Trip created** → Shows success page with join code
- ✅ **"Let's Plan It"** → Route to `/prepbuild`
- ✅ **Role assigned** → User becomes "originator"

**Debug Commands:**
```bash
# Test trip created endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/tripwell/tripcreated/TRIP_ID

# Check user role assignment
# MongoDB: db.tripwellusers.findOne({tripId: ObjectId("TRIP_ID")}, {role: 1})
```

### **Step 5: PrepBuild → Trip Planning Hub**
**Frontend**: Planning overview and navigation hub
**Backend**: No backend calls (static page)

**What Can Break:**
- ❌ **Navigation logic errors** → Wrong routing
- ❌ **Missing localStorage data** → Display issues

**Flow Logic:**
- ✅ **"I'm Ready to Plan"** → Route to `/tripintent`
- ✅ **"Take Me Where I Left Off"** → Route to `/tripprebuild` (safe landing)
- ✅ **"Return Home"** → Route to `/`

### **Step 6: Trip Intent**
**Frontend**: User fills out trip preferences
**Backend**: `POST /tripwell/tripintent` (protected)

**Model Fields:**
- `priorities` ([String]) - User preferences
- `vibes` ([String]) - Trip vibes
- `mobility` ([String]) - Mobility options
- `travelPace` ([String]) - Travel pace
- `budget` (String) - Budget level

**What Can Break:**
- ❌ **User has no tripId** → 400 error "No trip associated with user"
- ❌ **Invalid array data** → Schema validation fails
- ❌ **ObjectId conversion issues** → Database lookup fails

**Flow Logic:**
- ✅ **Intent saved** → Route to `/anchorselect`

**Debug Commands:**
```bash
# Test trip intent
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priorities":["food","culture"],"vibes":["relaxed"],"mobility":["walking"],"travelPace":["moderate"],"budget":"medium"}' \
  http://localhost:5000/tripwell/tripintent

# Check if TripIntent was saved
# MongoDB: db.tripintents.findOne({tripId: ObjectId("TRIP_ID")})
```

### **Step 7: Anchor Select**
**Frontend**: User selects anchor activities
**Backend**: `POST /tripwell/anchorselect/save/:tripId` (protected)

**Complete Anchor Flow:**
1. **Frontend** → Calls `POST /tripwell/anchorgpt/:tripId` (unprotected) - Gets 5 AI-generated anchors
2. **Frontend** → User selects from generated anchors
3. **Frontend** → Calls `POST /tripwell/anchorselect/save/:tripId` (protected) - Saves selected anchors
4. **Backend** → `saveAnchorLogic()` service processes selections
5. **Backend** → `parseAnchorSuggestionsWithLogic()` enriches anchor data
6. **Backend** → Saves to `AnchorLogic` model

**Model Fields (AnchorLogic):**
```javascript
{
  tripId: ObjectId,                    // Required - Trip reference
  userId: ObjectId,                    // Required - User reference  
  enrichedAnchors: [{
    title: String,                     // Anchor name
    description: String,               // Detailed description
    location: String,                  // Physical location
    type: "experience" | "attraction", // Anchor type
    isDayTrip: Boolean,                // Full day activity?
    isTicketed: Boolean,               // Requires tickets?
    defaultTimeOfDay: "morning" | "afternoon" | "evening",
    neighborhoodTag: String,           // Area/neighborhood
    notes: String,                     // Additional notes
    suggestedFollowOn: String          // What to do after
  }]
}
```

**What Can Break:**
- ❌ **Missing tripId, userId, or anchorTitles** → 400 error
- ❌ **anchorTitles not an array** → 400 error
- ❌ **User not found** → Database error
- ❌ **Token undefined** → 401 Unauthorized (CRITICAL ISSUE)
- ❌ **OpenAI API fails** → Anchor generation fails
- ❌ **parseAnchorSuggestionsWithLogic missing** → Service error

**Current Issue (401 Error):**
- **Problem**: `🔍 Token: undefined` in frontend logs
- **Cause**: Missing Firebase token in Authorization header
- **Impact**: Anchor save fails, user stuck at anchor selection
- **Fix**: Ensure Firebase token is properly passed to save endpoint

**Flow Logic:**
- ✅ **Anchors generated** → 5 AI suggestions from GPT
- ✅ **User selects** → Frontend saves to localStorage
- ✅ **Anchors saved** → Route to `/itinerarybuild`

**Debug Commands:**
```bash
# Test anchor generation (unprotected)
curl -X POST -H "Content-Type: application/json" \
  -d '{"tripData":{"city":"NYC","season":"Summer"},"tripIntentData":{"priorities":["food","culture"]}}' \
  "http://localhost:5000/tripwell/anchorgpt/TRIP_ID?userId=USER_ID"

# Test anchor save (protected - needs token)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","anchorTitles":["Museum","Restaurant"]}' \
  http://localhost:5000/tripwell/anchorselect/save/TRIP_ID

# Check if AnchorLogic was saved
# MongoDB: db.anchorlogics.findOne({tripId: ObjectId("TRIP_ID"), userId: ObjectId("USER_ID")})

# Check user progress
# MongoDB: db.users.findOne({_id: ObjectId("USER_ID")}, {anchorSelectComplete: 1})
```

### **Step 8: Itinerary Build**
**Frontend**: AI generates initial itinerary
**Backend**: `POST /tripwell/itinerarybuild` (protected)

**What Can Break:**
- ❌ **OpenAI API issues** → Generation fails
- ❌ **Invalid trip data** → GPT prompt fails
- ❌ **Save fails** → Database error

**Flow Logic:**
- ✅ **Itinerary generated** → Route to `/itinerarymodify`

**Debug Commands:**
```bash
# Test itinerary generation
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tripId":"TRIP_ID"}' \
  http://localhost:5000/tripwell/itinerarybuild
```

### **Step 9: Itinerary Modify**
**Frontend**: User reviews and modifies full itinerary
**Backend**: `POST /tripwell/itinerarymodify` (protected)

**What Can Break:**
- ❌ **Itinerary not found** → 404 error
- ❌ **Save fails** → Database error
- ❌ **Validation errors** → Invalid modifications

**Flow Logic:**
- ✅ **Itinerary modified** → Route to `/itinerarymodifysingleday`

**Debug Commands:**
```bash
# Test itinerary modification
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tripId":"TRIP_ID","modifications":{}}' \
  http://localhost:5000/tripwell/itinerarymodify
```

### **Step 10: Itinerary Modify Single Day**
**Frontend**: User modifies individual day details
**Backend**: `POST /tripwell/itinerarymodifysingleday` (protected)

**What Can Break:**
- ❌ **Day not found** → 404 error
- ❌ **Invalid day data** → Validation error
- ❌ **Save fails** → Database error

**Flow Logic:**
- ✅ **Day modified** → Route to `/prephub` (completion state)

**Debug Commands:**
```bash
# Test single day modification
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tripId":"TRIP_ID","dayIndex":1,"modifications":{}}' \
  http://localhost:5000/tripwell/itinerarymodifysingleday
```

### **Step 11: Prephub → Planning Completion**
**Frontend**: Trip summary and "Start My Trip!" button
**Backend**: No backend calls (localStorage only)

**What Can Break:**
- ❌ **Missing localStorage data** → Display errors
- ❌ **Navigation logic errors** → Wrong routing

**Flow Logic:**
- ✅ **"Start My Trip!"** → Sets `startedTrip: true` → Route to `/tripliveday`
- ✅ **Modify Itinerary** → Route back to `/itinerarymodify`

**Debug Commands:**
```bash
# Check localStorage data
# Browser: localStorage.getItem("tripData")
# Browser: localStorage.getItem("itineraryData")
```

### **Step 12: TripLiveDay → Live Trip Experience**
**Frontend**: Live trip day-by-day experience
**Backend**: `GET /tripwell/tripliveday/:tripId` (protected)

**What Can Break:**
- ❌ **Trip not found** → 404 error
- ❌ **Day data missing** → Display errors
- ❌ **Status updates fail** → Progress not saved

**Flow Logic:**
- ✅ **Trip in progress** → Continue through days
- ✅ **All days complete** → Route to `/tripcomplete`

**Debug Commands:**
```bash
# Test live trip status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/tripwell/tripliveday/TRIP_ID
```

### **Step 13: TripComplete → Trip Finished**
**Frontend**: Trip completion summary
**Backend**: `GET /tripwell/tripcomplete/:tripId` (protected)

**What Can Break:**
- ❌ **Trip not found** → 404 error
- ❌ **Completion data missing** → Display errors

**Flow Logic:**
- ✅ **Trip complete** → Route to `/reflection`

**Debug Commands:**
```bash
# Test trip completion
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/tripwell/tripcomplete/TRIP_ID
```

### **Step 14: Reflection → Post-Trip Reflection**
**Frontend**: User reflects on trip experience
**Backend**: `POST /tripwell/reflection` (protected)

**What Can Break:**
- ❌ **Reflection save fails** → Database error
- ❌ **Invalid reflection data** → Validation error

**Flow Logic:**
- ✅ **Reflection saved** → Trip experience complete

**Debug Commands:**
```bash
# Test reflection save
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tripId":"TRIP_ID","reflection":"Great trip!"}' \
  http://localhost:5000/tripwell/reflection
```

## 🔑 **JOIN CODE VALIDATION** (Critical Nuances)

### **Join Code Check Flow:**
1. **Frontend** → User enters join code
2. **Backend** → `POST /tripwell/validatejoincode` (unprotected)
3. **Validation** → Check if trip exists with join code
4. **Response** → Return trip details and creator info

### **Join Code Nuances:**
- **Case Insensitive** → `code.trim().toLowerCase()`
- **No Unique Constraint** → JoinCode registry handles uniqueness
- **Creator Lookup** → Finds originator user for display
- **Trip Details** → Returns tripId, tripName, city, dates, creatorFirstName

### **What Can Break:**
- ❌ **Join code not found** → 404 "Trip not found"
- ❌ **Originator not found** → Falls back to "Trip lead"
- ❌ **Invalid code format** → Validation error

### **Debug Commands:**
```bash
# Test join code validation
curl -X POST -H "Content-Type: application/json" \
  -d '{"code":"TEST123"}' \
  http://localhost:5000/tripwell/validatejoincode

# Check join code in database
# MongoDB: db.tripbases.findOne({joinCode: "test123"})

# Check originator user
# MongoDB: db.tripwellusers.findOne({tripId: ObjectId("TRIP_ID"), role: "originator"})
```

## 👥 **PARTICIPANT FLOW** (Separate Path)

### **Join Flow:**
1. **JoinAccess** → Firebase sign-in for participants
2. **TripJoin** → Enter join code
3. **ProfileParticipant** → Quick profile setup
4. **PlannerParticipantHub** → Participant view

### **Role Assignment:**
- **Originator**: User who creates the trip (gets full planning access)
- **Participant**: User who joins via join code (gets limited view)

**Debug Commands:**
```bash
# Check participant creation
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"joinCode":"TEST123","firebaseId":"PARTICIPANT_UID"}' \
  http://localhost:5000/tripwell/participant

# Check user roles
# MongoDB: db.tripwellusers.find({tripId: ObjectId("TRIP_ID")}, {role: 1, firstName: 1})
```

## 🛡️ **SAFE LANDING ZONES**

### **During Planning:**
- **`/tripprebuild`** → "Take Me Where I Left Off" - resumes planning
- **`/prephub`** → Planning completion state with modify options
- **`/tripwell/home`** → Main trip hub

### **Error Recovery:**
- **`/access`** → Authentication issues
- **`/profilesetup`** → Profile incomplete
- **`/tripsetup`** → No trip found
- **`/tripintent`** → Missing trip preferences
- **`/anchorselect`** → Missing anchor selections
- **`/itinerarymodify`** → Missing itinerary

## 🐛 **COMPREHENSIVE BUG ANALYSIS** (Big Level Issues)

### **🚨 CRITICAL ISSUE #1: Missing Authorization Headers**

**Problem**: Multiple pages are making API calls without Firebase tokens
**Impact**: 401 Unauthorized errors across the app
**Root Cause**: Inconsistent token handling

**Affected Pages:**
1. **AnchorSelect.jsx** → `handleSubmit()` calls save endpoint without token
2. **Multiple pages** → Using axios without Authorization headers

**Fix Pattern:**
```javascript
// ❌ WRONG - No token
const res = await axios.post(`${BACKEND_URL}/tripwell/anchorselect/save/${tripId}`, {
  userId: userData.firebaseId,
  anchorTitles: selected,
});

// ✅ CORRECT - With token
const token = await auth.currentUser.getIdToken();
const res = await axios.post(`${BACKEND_URL}/tripwell/anchorselect/save/${tripId}`, {
  userId: userData.firebaseId,
  anchorTitles: selected,
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### **🚨 CRITICAL ISSUE #2: Inconsistent Token Handling**

**Problem**: Different pages use different token patterns
**Impact**: Some calls work, others fail

**Token Patterns Found:**
- `auth.currentUser.getIdToken()` - Most common
- `auth.currentUser.getIdToken(true)` - Force refresh
- `firebaseUser.getIdToken()` - Direct user reference
- `getAuth().currentUser.getIdToken()` - Different import

**Standardization Needed:**
```javascript
// ✅ STANDARD PATTERN
import { auth } from "../firebase";
const token = await auth.currentUser.getIdToken();
```

### **🚨 CRITICAL ISSUE #3: localStorage vs Backend Sync**

**Problem**: Frontend relies heavily on localStorage but doesn't always sync with backend
**Impact**: Data inconsistencies, users stuck in loops

**Issues:**
1. **AnchorSelect** → Saves to localStorage but backend save fails (401)
2. **LocalUniversalRouter** → Refreshes from `/localflush` but some data missing
3. **Multiple pages** → Assume localStorage has correct data

### **🚨 CRITICAL ISSUE #4: Missing Error Handling**

**Problem**: API failures don't provide clear user feedback
**Impact**: Users don't know why they're stuck

**Examples:**
- AnchorSelect → `catch (err)` just logs, no user message
- LocalUniversalRouter → Falls back to `/access` on any error
- ProfileSetup → No retry logic for failed saves

### **🚨 CRITICAL ISSUE #5: Route Dependencies**

**Problem**: Pages assume previous steps completed successfully
**Impact**: Users can get stuck in invalid states

**Dependency Chain:**
1. **Access** → Creates user, calls `/hydrate`
2. **LocalUniversalRouter** → Calls `/localflush` 
3. **ProfileSetup** → Saves profile, routes to `/tripsetup`
4. **TripSetup** → Creates trip, routes to `/tripcreated`
5. **AnchorSelect** → Needs tripId, userId, tripIntentData

**Missing Validations:**
- Check if previous step actually saved to backend
- Verify required data exists before proceeding
- Handle partial completion states

## 🔧 **IMMEDIATE FIXES NEEDED**

### **Fix #1: Add Token to AnchorSelect Save**
```javascript
// In AnchorSelect.jsx handleSubmit()
const token = await auth.currentUser.getIdToken();
const res = await axios.post(`${BACKEND_URL}/tripwell/anchorselect/save/${tripId}`, {
  userId: userData.firebaseId,
  anchorTitles: selected,
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### **Fix #2: Standardize Token Handling**
Create a utility function:
```javascript
// utils/auth.js
import { auth } from "../firebase";

export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  return await user.getIdToken();
}
```

### **Fix #3: Add Error Boundaries**
```javascript
// In each page component
try {
  const res = await apiCall();
  // handle success
} catch (err) {
  console.error("API Error:", err);
  if (err.response?.status === 401) {
    // Token expired, redirect to access
    navigate("/access");
  } else {
    // Show user-friendly error
    setError("Something went wrong. Please try again.");
  }
}
```

### **Fix #4: Validate Data Before API Calls**
```javascript
// Before making API calls
if (!userData?.firebaseId || !tripData?.tripId) {
  console.error("Missing required data");
  navigate("/access");
  return;
}
```

## 📋 **DEBUGGING CHECKLIST** (Updated)

### **Authentication Chain**
- [ ] **Firebase Token**: Valid and not expired?
- [ ] **Token in Headers**: All API calls include Authorization?
- [ ] **User Exists**: TripWellUser record for firebaseId?
- [ ] **Profile Complete**: User has required profile data?
- [ ] **Trip Assignment**: User has valid tripId?

### **Data Flow Validation**
- [ ] **localStorage Sync**: Data matches backend state?
- [ ] **API Calls**: All include proper headers?
- [ ] **Error Handling**: Users get clear feedback?
- [ ] **Route Dependencies**: Previous steps completed?

### **Critical Endpoints**
- [ ] **`/tripwell/user/createOrFind`** → User creation works?
- [ ] **`/tripwell/hydrate`** → Returns all user data?
- [ ] **`/tripwell/localflush`** → Syncs localStorage?
- [ ] **`/tripwell/anchorselect/save/:tripId`** → Saves with token?
- [ ] **`/tripwell/anchorgpt/:tripId`** → Generates anchors?

---

*This analysis identifies the major architectural issues causing the 401 errors and data inconsistencies. The fixes focus on standardizing token handling and improving error management.*

## 🐛 **CRITICAL DEBUGGING CHECKLIST**

### **Authentication Chain (Most Important)**
1. **Firebase Token**: Valid and not expired?
2. **User Exists**: TripWellUser record for firebaseId?
3. **Profile Complete**: User has required profile data?
4. **Trip Assignment**: User has valid tripId?
5. **Role Assignment**: User has proper role (originator/participant)?

### **Data Flow Validation**
1. **Access**: User creation/authentication works?
2. **ProfileSetup**: Profile saves and routes to trip setup?
3. **TripSetup**: Trip creation and user linking works?
4. **TripCreated**: Role assignment and success display?
5. **Trip Intent**: Arrays properly formatted?
6. **Anchor Select**: Valid anchor titles?
7. **Itinerary Build**: OpenAI service working?
8. **Itinerary Modify**: Save operations working?
9. **Prephub**: Completion state and trip start?
10. **TripLiveDay**: Live trip experience?
11. **TripComplete**: Trip completion?
12. **Reflection**: Post-trip reflection?

### **External Services**
1. **MongoDB**: Connection stable?
2. **Firebase**: Admin SDK configured?
3. **OpenAI**: API key valid, rate limits OK?

## 🛠️ **Quick Debug Commands**

```bash
# 1. Check server health
curl http://localhost:5000/

# 2. Test authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/tripwell/whoami

# 3. Check MongoDB connection
node -e "require('mongoose').connect(process.env.MONGO_URI).then(() => console.log('✅ Connected')).catch(console.error)"

# 4. Test OpenAI
node -e "const openai = require('openai'); const client = new openai({apiKey: process.env.OPENAI_API_KEY}); console.log('✅ OpenAI configured')"

# 5. Check environment
echo "MONGO_URI: ${MONGO_URI:0:20}..."
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."
```

## 📋 **"Go Through the Flow" Checklist**

When debugging the live frontend:

### **Step 1: Access & Authentication**
- [ ] User can sign in with Google
- [ ] User creation/finding works
- [ ] Routes to correct next step (hydratelocal vs profilesetup)

### **Step 2: Profile Setup**
- [ ] Profile form loads correctly
- [ ] Firebase data auto-fills (email, firebaseId)
- [ ] User can input all required fields
- [ ] Profile saves to backend
- [ ] Routes to `/tripsetup` after save

### **Step 3: Trip Setup**
- [ ] Trip creation endpoint works
- [ ] All required fields validated
- [ ] Join code validation works
- [ ] User gets assigned to trip
- [ ] Role set to "originator"
- [ ] Routes to `/tripcreated`

### **Step 4: Trip Created & Role Assignment**
- [ ] Success page displays correctly
- [ ] User role assigned as "originator"
- [ ] Join code displayed for sharing
- [ ] "Let's Plan It" routes to `/prepbuild`

### **Step 5: PrepBuild Hub**
- [ ] Planning overview displays
- [ ] Navigation buttons work correctly
- [ ] Safe landing zones accessible

### **Step 6: Trip Intent**
- [ ] User can submit preferences
- [ ] Arrays properly handled
- [ ] TripIntent saved to database
- [ ] Routes to `/anchorselect`

### **Step 7: Anchor Select**
- [ ] User can select anchors
- [ ] Anchor data saved
- [ ] Routes to `/itinerarybuild`

### **Step 8: Itinerary Build**
- [ ] OpenAI API accessible
- [ ] Itinerary generation works
- [ ] Routes to `/itinerarymodify`

### **Step 9: Itinerary Modify**
- [ ] User can modify itinerary
- [ ] Modifications save correctly
- [ ] Routes to `/itinerarymodifysingleday`

### **Step 10: Itinerary Modify Single Day**
- [ ] User can modify individual days
- [ ] Day modifications save
- [ ] Routes to `/prephub`

### **Step 11: Prephub (Planning Completion)**
- [ ] Trip summary displays correctly
- [ ] "Start My Trip!" sets startedTrip flag
- [ ] Routes to `/tripliveday`

### **Step 12: TripLiveDay (Live Experience)**
- [ ] Live trip experience works
- [ ] Day-by-day progression
- [ ] Routes to `/tripcomplete` when finished

### **Step 13: TripComplete**
- [ ] Trip completion displays
- [ ] Routes to `/reflection`

### **Step 14: Reflection**
- [ ] Reflection form works
- [ ] Reflection saves correctly

## 🚨 **Common Error Patterns**

### **401 Unauthorized**
- Check Firebase token in Authorization header
- Verify token hasn't expired
- Confirm Firebase Admin SDK is configured

### **400 Bad Request**
- Check required fields in request body
- Validate data types (arrays, dates, etc.)
- Ensure ObjectId format is correct

### **404 Not Found**
- Verify user exists in TripWellUser collection
- Check trip exists in TripBase collection
- Confirm ObjectId references are valid

### **500 Internal Server Error**
- Check MongoDB connection
- Verify OpenAI API key and rate limits
- Look for unhandled exceptions in logs

---

*This guide covers the complete user flow from Firebase authentication through trip creation, planning phases, live trip experience, and post-trip reflection. Each step has specific debugging points and commands to help identify and fix issues quickly.*
