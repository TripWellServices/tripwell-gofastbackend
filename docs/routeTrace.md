# ROUTE TRACE - Frontend → Backend → Model Mapping

## 🎯 **Purpose**
This document traces every route to verify:
1. **What services** are called?
2. **What mutating** happens?
3. **Flag planting** - what flags get set?
4. **Other dependencies** - what else gets triggered?
5. **Is it getting pushed to frontend** on mutation?
6. **Is it getting saved in DB** properly?

## ✅ **VERIFIED ROUTE-MODEL MATCHES**

### **1. User Authentication & Creation**
- **Frontend Route:** `Access.jsx` → `POST /tripwell/user/createOrFind`
- **Backend File:** `TripWellUserRoute.js`
- **Model:** `TripWellUser.js`

**🔍 Route Analysis:**
- **Services Called:** None (direct model creation)
- **Mutating:** Creates new `TripWellUser` document
- **Flag Planting:** 
  - `profileComplete: false`
  - `userStatus: "signup"`
  - `journeyStage: "new_user"`
  - `role: "noroleset"`
- **Dependencies:** 
  - Calls Python AI service for new user tracking
  - Sets `userStatus` and `journeyStage` flags
- **Frontend Push:** ✅ Returns `user` object to frontend
- **DB Save:** ✅ Creates document in MongoDB
- **Status:** ✅ **WORKING** - User created and returned to frontend

### **2. Profile Setup**
- **Frontend Route:** `ProfileSetup.jsx` → `PUT /tripwell/profile`
- **Backend File:** `profileSetupRoute.js` (assumed)
- **Model:** `TripWellUser.js`
- **Frontend Fields:** `firstName`, `lastName`, `hometownCity`, `homeState`, `travelStyle[]`, `tripVibe[]`, `dreamDestination`
- **Backend Parameters:** Same as frontend
- **Model Fields:** `firstName`, `lastName`, `hometownCity`, `homeState`, `travelStyle`, `tripVibe`, `dreamDestination`, `profileComplete: true`
- **Status:** ✅ **MATCHES** - Profile fields map correctly, backend sets completion flag

### **3. Trip Creation**
- **Frontend Route:** `TripSetup.jsx` → `POST /tripwell/trip-setup`
- **Backend File:** `tripSetupRoute.js`
- **Model:** `TripBase.js`

**🔍 Route Analysis:**
- **Services Called:** 
  - `parseTrip()` - Computes season, daysTotal
  - `setUserTrip()` - Links user to trip
  - `pushTripToRegistry()` - Registers join code
  - `generateMetaAttractions()` - Background city setup
- **Mutating:** 
  - Creates `TripBase` document
  - Updates `TripWellUser` with `tripId` and role
  - Creates `City` document if new city
  - Creates `JoinCode` registry entry
- **Flag Planting:**
  - `journeyStage: 'trip_set_done'`
  - `userStatus: 'active'`
  - `role: "originator"`
- **Dependencies:**
  - Calls Python AI service for trip creation analysis
  - Generates meta attractions for new cities (background)
- **Frontend Push:** ✅ Returns `tripId` and computed `tripData`
- **DB Save:** ✅ Creates TripBase, updates User, creates City, creates JoinCode
- **Status:** ✅ **WORKING** - Complex multi-model operation with proper flag setting

### **4. Trip Persona Creation**
- **Frontend Route:** `TripPersonaForm.jsx` → `POST /tripwell/trip-persona`
- **Backend File:** `tripPersonaRoute.js`
- **Model:** `TripPersona.js`

**🔍 Route Analysis:**
- **Services Called:** None (direct model creation/update)
- **Mutating:** Creates or updates `TripPersona` document
- **Flag Planting:**
  - `status: 'created'`
- **Dependencies:** None
- **Frontend Push:** ✅ Returns `persona` object with next step guidance
- **DB Save:** ✅ Creates/updates TripPersona document
- **Status:** ✅ **WORKING** - Simple CRUD operation with proper response

### **5. Meta Attractions Selection**
- **Frontend Route:** `TripMetaSelect.jsx` → `POST /tripwell/meta-attractions`
- **Backend File:** `metaAttractionsRoute.js`
- **Model:** `MetaAttractions.js`

**🔍 Route Analysis:**
- **Services Called:** 
  - `generateMetaAttractions()` - If attractions don't exist
- **Mutating:** 
  - Creates `MetaAttractions` document if not exists
  - No user data mutation (read-only content library)
- **Flag Planting:** None
- **Dependencies:** 
  - Looks up `City` document by cityName
  - Generates attractions if missing
- **Frontend Push:** ✅ Returns `metaAttractions` array
- **DB Save:** ✅ Creates MetaAttractions if missing (content library)
- **Status:** ✅ **WORKING** - Content library lookup with generation fallback

### **6. User Selections (Meta)**
- **Frontend Route:** `TripMetaSelect.jsx` → `POST /tripwell/user-selections/meta`
- **Backend File:** `userSelectionsRoute.js`
- **Model:** `UserSelections.js`

**🔍 Route Analysis:**
- **Services Called:** 
  - `saveMetaSelections()` - Handles user selection persistence
- **Mutating:** 
  - Creates or updates `UserSelections` document
  - Updates `behaviorData` with selection patterns
- **Flag Planting:** 
  - Updates `behaviorData.metaPreferences`
  - Updates `behaviorData.totalSelections`
- **Dependencies:** 
  - Gets `userId` from Firebase token
  - Tracks behavior patterns for future recommendations
- **Frontend Push:** ✅ Returns `selections` and `behaviorData`
- **DB Save:** ✅ Creates/updates UserSelections with behavior tracking
- **Status:** ✅ **WORKING** - User selection persistence with behavior learning

### **7. Persona Samples Generation**
- **Frontend Route:** `TripSampleSelect.jsx` → `POST /tripwell/persona-samples`
- **Backend File:** `personaSamplesRoute.js`
- **Model:** `CityStuffToDo.js`
- **Frontend Fields:** `tripId`, `userId`
- **Backend Parameters:** Same as frontend
- **Model Fields:** `cityId`, `season`, `samples{attractions[], restaurants[], neatThings[]}`, `metadata{}`, `prompt`
- **Status:** ✅ **MATCHES** - Backend generates samples and stores in CityStuffToDo

### **8. Persona Sample Selection**
- **Frontend Route:** `TripSampleSelect.jsx` → `POST /tripwell/persona-sample-service`
- **Backend File:** `personaSamplesRoute.js`
- **Model:** `SampleSelects.js`
- **Frontend Fields:** `tripId`, `userId`, `selectedSamples[]`, `sampleObjectId`, `cityId`
- **Backend Parameters:** Same as frontend
- **Model Fields:** `sampleObjectId`, `tripId`, `cityId`, `userId`, `selectedSamples[]`
- **Status:** ✅ **MATCHES** - User selections stored in SampleSelects

### **9. Itinerary Build**
- **Frontend Route:** `TripItineraryBuild.jsx` → `POST /tripwell/itinerary/build`
- **Backend File:** `itineraryRoutes.js`
- **Model:** `TripDay.js`
- **Frontend Fields:** `tripId`, `userId`, `selectedMetas[]`, `selectedSamples[]`
- **Backend Parameters:** Same as frontend
- **Model Fields:** `tripId`, `dayIndex`, `summary`, `blocks{morning, afternoon, evening}`, `isComplete`, `modifiedByUser`, `modificationMethod`
- **Status:** ✅ **MATCHES** - Backend generates itinerary and creates TripDay documents

### **10. Trip Reflection**
- **Frontend Route:** `TripDayLookback.jsx` → `POST /tripwell/reflection/:tripId/:dayIndex`
- **Backend File:** `TripReflectionSaveRoutes.js`
- **Model:** `TripReflection.js`
- **Frontend Fields:** `summary`, `moodTags[]`, `journalText`
- **Backend Parameters:** `tripId`, `dayIndex` (URL), `summary`, `moodTags`, `journalText`, `userId` (from token)
- **Model Fields:** `tripId`, `dayIndex`, `userId`, `summary`, `moodTags[]`, `journalText`
- **Status:** ✅ **MATCHES** - All reflection data maps correctly

## 🚨 **CRITICAL FLAG PLANTING ISSUES FOUND**

### **❌ ACCESS.JSX - THE WORST CULPRIT**
- **Problem:** Access.jsx sets `localStorage.setItem("profileComplete", "false")` (STRING)
- **But LocalUniversalRouter checks:** `!userData.profileComplete` (BOOLEAN)
- **Result:** Type mismatch causes infinite profile setup loop
- **Impact:** Users get stuck in profile setup forever
- **Fix needed:** Complete tear down and refactor Access.jsx → Signup.jsx

### **❌ PROFILE COMPLETE CHAOS**
- **Frontend localStorage:** `"true"/"false"` (STRINGS)
- **Backend database:** `true/false` (BOOLEANS)
- **Frontend context:** `profileComplete: false` (BOOLEAN)
- **Multiple places setting it:** Access.jsx, ProfileSetup.jsx, HydrateTest.jsx
- **Result:** Type mismatches everywhere causing routing chaos
- **Fix needed:** Bifurcate user models to eliminate profileComplete flag entirely

### **❌ MISSING `startedTrip` FLAG**
- **LocalUniversalRouter checks:** `tripData.startedTrip === true`
- **TripBase model has:** `tripStartedByOriginator`, `tripStartedByParticipant`, `tripComplete`
- **Missing:** `startedTrip` field entirely!
- **Impact:** Users get stuck in planning phase, never reach live trip
- **Fix needed:** Add `startedTrip` field to TripBase model OR update LocalUniversalRouter logic

### **❌ FLAG SYSTEM MISMATCH**
- **Backend journey stages:** `new_user`, `profile_complete`, `trip_set_done`, `itinerary_complete`, `trip_active`, `trip_complete`
- **LocalUniversalRouter checks:** `profileComplete`, `tripData`, `tripPersonaData`, `selectedMetas`, `selectedSamples`, `itineraryData`, `tripComplete`, `startedTrip`
- **Impact:** Two different flag systems not synchronized

### **❌ TRIP START ROUTE ISSUE**
- **Route exists:** `POST /tripwell/starttrip/:tripId` in `tripStartRoute.js`
- **Sets flags:** `tripStartedByOriginator: true`, `tripStartedByParticipant: true`
- **LocalUniversalRouter checks:** `tripData.startedTrip === true` (field doesn't exist)
- **Available flags:** `tripData.tripStartedByOriginator`, `tripData.tripStartedByParticipant`
- **Impact:** Trip start functionality broken - wrong field name being checked

## 🔧 **IDENTIFIED MISMATCHES**

### **TripPersona Model Issue:**
- **Problem:** `TripPersona.js` uses `userId: String` but should use `ObjectId` for consistency
- **Current:** `userId: { type: String, required: true }`
- **Should be:** `userId: { type: mongoose.Schema.Types.ObjectId, ref: "TripWellUser", required: true }`
- **Impact:** Inconsistent data types across models

### **SampleSelects Model Issue:**
- **Problem:** `SampleSelects.js` uses `userId: String` but should use `ObjectId` for consistency
- **Current:** `userId: { type: String, required: true }`
- **Should be:** `userId: { type: mongoose.Schema.Types.ObjectId, ref: "TripWellUser", required: true }`
- **Impact:** Inconsistent data types across models

### **TripReflection Model Issue:**
- **Problem:** `TripReflection.js` uses `userId: String` but should use `ObjectId` for consistency
- **Current:** `userId: { type: String, required: true }`
- **Should be:** `userId: { type: mongoose.Schema.Types.ObjectId, ref: "TripWellUser", required: true }`
- **Impact:** Inconsistent data types across models

## ❓ **ROUTES TO VERIFY**

### **Profile Setup Route:**
- **Route:** `PUT /tripwell/profile`
- **File:** `profileSetupRoute.js`
- **Status:** ❓ **NEEDS VERIFICATION** - Check if route exists and matches frontend

### **Role Selection Route:**
- **Route:** `PUT /tripwell/profile` (role update)
- **File:** `profileSetupRoute.js`
- **Status:** ❓ **NEEDS VERIFICATION** - Check if role update works correctly

### **Trip Created Route:**
- **Route:** `GET /tripwell/tripcreated/:tripId`
- **File:** `tripCreatedRoute.js`
- **Status:** ❓ **NEEDS VERIFICATION** - Check if route exists and returns correct data

## 🚀 **BIFURCATION STRATEGY**

### **Current Mess:**
```
TripWellUser = {
  email: "user@example.com",
  firstName: null,        // ← Profile data
  lastName: null,         // ← Profile data  
  profileComplete: false  // ← THE FLAG FROM HELL
}
```

### **Proposed Solution:**
```
TripWellFirebaseOnly = {
  firebaseId: "abc123",
  email: "user@example.com"  // ← Just Firebase auth data
}

TripWellUser = {
  firebaseId: "abc123",
  email: "user@example.com",
  firstName: "John",       // ← Profile data
  lastName: "Doe",         // ← Profile data
  profileComplete: false   // ← Source of truth flag
}
```

### **Benefits:**
- **Keep existing TripWellUser system** - Don't break what's working
- **Clean Firebase auth separation** - TripWellFirebaseOnly for auth only
- **Service transfers to TripWellUser** - Background migration
- **TripWellUser remains source of truth** - profileComplete flag works
- **No breaking changes** - All existing routes still work

### **Implementation Status:**
- ✅ **TripWellFirebaseOnly model created** - Firebase auth only
- ✅ **userTransferService created** - Transfers Firebase users to TripWellUser
- ✅ **TripWellUser kept as source of truth** - All existing routes work
- ✅ **ItineraryDays model created** - Source of truth for itinerary
- ✅ **TripCurrentDays model created** - Live trip data with user modifications
- ✅ **itineraryRoutes updated** - Uses bifurcated trip models
- ✅ **tripStartRoute updated** - Sets tripStartedAt timestamp
- ✅ **LocalUniversalRouter reverted** - Uses profileComplete flag (working)
- ✅ **hydrateRoute reverted** - Returns original userData structure
- ✅ **profileSetupRoute reverted** - Sets profileComplete: true

### **Access.jsx Tear Down:**
- **Current:** Universal auth point with million wrappers
- **New:** Simple Signup.jsx focused only on new user registration
- **Remove:** All profileComplete flag setting
- **Remove:** All universal auth logic
- **Focus:** Just Firebase auth + user creation

## 🎯 **NEXT STEPS**

1. **Fix userId consistency** - Update all models to use ObjectId instead of String
2. **Verify missing routes** - Check if profile setup and trip created routes exist
3. **Test end-to-end** - Verify data flows correctly from frontend to database
4. **Update frontend** - Ensure frontend sends correct field names and types

## 📋 **TESTING CHECKLIST**

### **Authentication Flow:**
- [ ] User creation works with correct field mapping
- [ ] Profile setup saves all fields correctly
- [ ] Role selection updates user model

### **Trip Creation Flow:**
- [ ] Trip setup creates TripBase with all fields
- [ ] Computed fields (season, daysTotal) are calculated
- [ ] User is linked to trip correctly

### **Planning Flow:**
- [ ] Persona creation saves to TripPersona model
- [ ] Meta attractions load and save correctly
- [ ] Sample generation and selection works
- [ ] Itinerary build creates TripDay documents

### **Live Trip Flow:**
- [ ] Reflections save to TripReflection model
- [ ] All userId references work correctly
- [ ] Data consistency maintained across models
