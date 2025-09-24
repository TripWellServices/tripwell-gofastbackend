# FLOW TRACING - CURRENT STATE

## 🚨 **STOP DELETING - TRACE FIRST**

Before deleting anything else, let's trace what we currently have and what's working.

## 📋 **COMPLETE USER FLOW MAPPING**

### **0. Authentication & Entry**
- **Frontend:** `Home.jsx` → `Access.jsx` → `LocalUniversalRouter.jsx`
- **Route:** `/` → `/access` → `/localrouter`
- **Backend:** `/tripwell/user/createOrFind` (POST)
- **Models:** `TripWellUser.js`
- **Status:** ✅ WORKING - Firebase auth + backend user creation

### **1. Profile Setup**
- **Frontend:** `ProfileSetup.jsx`
- **Route:** `/profilesetup`
- **Backend:** `/tripwell/profile` (PUT)
- **Models:** `TripWellUser.js`
- **Status:** ✅ WORKING - Sets profileComplete: true

### **2. Role Selection**
- **Frontend:** `PostProfileRoleSelect.jsx`
- **Route:** `/postprofileroleselect`
- **Backend:** `/tripwell/profile` (PUT)
- **Models:** `TripWellUser.js`
- **Status:** ✅ WORKING - Sets role: "originator" or "participant"

### **3. Trip Creation**
- **Frontend:** `TripSetup.jsx`
- **Route:** `/tripsetup`
- **Backend:** `/tripwell/trip-setup` (POST)
- **Models:** `TripBase.js`, `TripWellUser.js`
- **Status:** ✅ WORKING - Creates trip, links user, sets role

### **4. Trip Success & Role Assignment**
- **Frontend:** `TripCreated.jsx`
- **Route:** `/tripcreated`
- **Backend:** `/tripwell/tripcreated/:tripId` (GET)
- **Models:** `TripBase.js`, `TripWellUser.js`
- **Status:** ✅ WORKING - Shows success, displays join code

### **5. Persona Creation**
- **Frontend:** `TripPersonaForm.jsx` 
- **Route:** `/trip-persona`
- **Backend:** `/tripwell/trip-persona` (POST)
- **Model:** `TripPersona.js`
- **Status:** ✅ WORKING - Creates trip persona data

### **6. Meta Attractions Selection**
- **Frontend:** `TripMetaSelect.jsx`
- **Route:** `/meta-select` 
- **Backend Hydrate:** `/tripwell/meta-attractions` (POST)
- **Backend Save:** `/tripwell/user-selections/meta` (POST)
- **Models:** `MetaAttractions.js`, `UserSelections.js`
- **Status:** ❓ NEEDS TESTING

### **7. Persona Samples Selection**
- **Frontend:** `TripSampleSelect.jsx`
- **Route:** `/persona-sample`
- **Backend Generate:** `/tripwell/persona-samples` (POST)
- **Backend Save:** `/tripwell/persona-sample-service` (POST)
- **Models:** `TripPersona.js`, `UserSelections.js`
- **Status:** ❓ NEEDS TESTING

### **8. Itinerary Build**
- **Frontend:** `TripItineraryBuild.jsx`
- **Route:** `/build-itinerary`
- **Backend:** `/tripwell/itinerary/build` (POST)
- **Models:** `TripDay.js`, `TripBase.js`
- **Status:** ❓ NEEDS TESTING

### **9. Trip Planning Complete**
- **Frontend:** `PreTripHub.jsx`
- **Route:** `/pretriphub`
- **Backend:** No backend calls (localStorage only)
- **Models:** N/A
- **Status:** ✅ WORKING - Planning completion hub

### **10. Live Trip Experience**
- **Frontend:** `LiveDayReturner.jsx` → `TripLiveDay.jsx`
- **Route:** `/livedayreturner` → `/tripliveday`
- **Backend:** `/tripwell/livestatus/:tripId` (GET)
- **Models:** `TripDay.js`, `TripBase.js`
- **Status:** ✅ WORKING - Live trip progression

### **11. Live Trip Day Experience**
- **Frontend:** `TripLiveDay.jsx` → `TripLiveDayBlock.jsx`
- **Route:** `/tripliveday` → `/tripliveblock`
- **Backend:** `/tripwell/livestatus/:tripId` (GET), `/tripwell/doallcomplete` (POST)
- **Models:** `TripDay.js`
- **Status:** ✅ WORKING - Day-by-day live experience

### **12. Daily Reflection**
- **Frontend:** `TripDayLookback.jsx`
- **Route:** `/daylookback`
- **Backend:** `/tripwell/reflection/:tripId/:dayIndex` (POST)
- **Models:** `TripReflection.js`
- **Status:** ✅ WORKING - Evening reflection with mood tags and journal

### **13. Trip Complete (Final Step)**
- **Frontend:** `TripComplete.jsx`
- **Route:** `/tripcomplete`
- **Backend:** `/tripwell/tripcomplete/:tripId` (GET)
- **Models:** `TripBase.js`
- **Status:** ✅ WORKING - Trip completion summary

### **14. Post-Trip Reflections Hub**
- **Frontend:** `TripReflectionsHub.jsx`
- **Route:** `/reflections`
- **Backend:** `/tripwell/reflections` (GET)
- **Models:** `TripReflection.js`
- **Status:** ✅ WORKING - Trip memories and reflections

### **15. Individual Trip Reflection**
- **Frontend:** `CurrentTripReflection.jsx`
- **Route:** `/reflections/:tripId`
- **Backend:** `/tripwell/reflection/:tripId` (GET)
- **Models:** `TripReflection.js`
- **Status:** ✅ WORKING - Detailed trip reflection

## 🚦 **LOCALUNIVERSALROUTER FLOW MAPPING**

The LocalUniversalRouter.jsx is the traffic cop that routes users based on their current state:

### **Routing Decision Tree:**
1. **No userData or profileComplete: false** → `/profilesetup`
2. **No role selected** → `/postprofileroleselect`
3. **No tripData** → `/tripsetup`
4. **Trip complete (tripComplete: true)** → `/tripcomplete`
5. **Trip started (startedTrip: true)** → `/livedayreturner`
6. **No tripPersonaData** → `/trip-persona`
7. **No selectedMetas** → `/meta-select`
8. **No selectedSamples** → `/persona-sample`
9. **No itineraryData** → `/build-itinerary`
10. **All planning done** → `/pretriphub`

### **Live Trip Flow (After Planning):**
- **LiveDayReturner** → Routes to current day based on trip progress
- **TripLiveDay** → Shows day overview with all blocks
- **TripLiveDayBlock** → Sequential block experience (morning → afternoon → evening)
- **TripDayLookback** → Evening reflection with mood tags and journal
- **TripReflection** → Saves to database, routes to next day or completion
- **TripComplete** → Shows completion message and routes to `/reflections`
- **TripReflectionsHub** → Shows trip memories and routes to `/reflections/:tripId`

### **Key localStorage Data Points:**
- `userData` - User profile and completion status
- `tripData` - Trip creation and status flags
- `tripPersonaData` - Trip persona information
- `selectedMetas` - Selected meta attractions
- `selectedSamples` - Selected persona samples
- `itineraryData` - Built itinerary data

## 🔍 **COMPREHENSIVE ROUTE-TO-MODEL TRACE**

### **✅ VERIFIED ROUTE-MODEL MATCHES**

#### **1. User Authentication & Creation**
- **Route:** `POST /tripwell/user/createOrFind`
- **File:** `TripWellUserRoute.js`
- **Model:** `TripWellUser.js`
- **Frontend Fields:** `firebaseId`, `email`, `funnelStage`
- **Model Fields:** `firebaseId`, `email`, `firstName`, `lastName`, `hometownCity`, `homeState`, `travelStyle`, `tripVibe`, `profileComplete`, `userStatus`, `tripId`, `role`, `funnelStage`, `journeyStage`
- **Status:** ✅ **MATCHES** - All frontend fields map to model fields

#### **2. Trip Creation**
- **Route:** `POST /tripwell/trip-setup`
- **File:** `tripSetupRoute.js`
- **Model:** `TripBase.js`
- **Frontend Fields:** `tripName`, `purpose`, `startDate`, `endDate`, `city`, `country`, `partyCount`, `whoWith`, `joinCode`
- **Model Fields:** `joinCode`, `tripName`, `purpose`, `startDate`, `endDate`, `city`, `country`, `partyCount`, `whoWith`, `romanceLevel`, `caretakerRole`, `season`, `daysTotal`
- **Status:** ✅ **MATCHES** - All frontend fields map to model fields, backend adds computed fields

#### **3. Trip Persona Creation**
- **Route:** `POST /tripwell/trip-persona`
- **File:** `tripPersonaRoute.js`
- **Model:** `TripPersona.js`
- **Frontend Fields:** `tripId`, `userId`, `primaryPersona`, `budget`, `dailySpacing`
- **Model Fields:** `tripId`, `userId`, `primaryPersona`, `budget`, `dailySpacing`, `status`
- **Status:** ✅ **MATCHES** - All frontend fields map to model fields

#### **4. Meta Attractions**
- **Route:** `POST /tripwell/meta-attractions`
- **File:** `metaAttractionsRoute.js`
- **Model:** `MetaAttractions.js`
- **Frontend Fields:** `placeSlug`, `city`, `season`
- **Model Fields:** `cityId`, `cityName`, `season`, `metaAttractions[]`
- **Status:** ✅ **MATCHES** - Frontend provides city/season, backend maps to cityId and returns metaAttractions array

#### **5. User Selections (Meta)**
- **Route:** `POST /tripwell/user-selections/meta`
- **File:** `userSelectionsRoute.js`
- **Model:** `UserSelections.js`
- **Frontend Fields:** `tripId`, `selectedMetaNames[]`
- **Model Fields:** `tripId`, `userId`, `selectedMetas[]`, `behaviorData`
- **Status:** ✅ **MATCHES** - Frontend sends selectedMetaNames, backend creates selectedMetas objects with behavior tracking

#### **6. User Selections (Samples)**
- **Route:** `POST /tripwell/user-selections/samples`
- **File:** `userSelectionsRoute.js`
- **Model:** `UserSelections.js`
- **Frontend Fields:** `tripId`, `selectedSamples[]`
- **Model Fields:** `tripId`, `userId`, `selectedSamples[]`, `behaviorData`
- **Status:** ✅ **MATCHES** - Frontend sends selectedSamples, backend stores with behavior tracking

### **❓ ROUTES TO VERIFY**

#### **7. Persona Samples Generation**
- **Route:** `POST /tripwell/persona-samples`
- **File:** `personaSamplesRoute.js`
- **Model:** `SampleSelects.js` or `UserSelections.js`
- **Status:** ❓ **NEEDS VERIFICATION** - Check if route exists and model matches

#### **8. Itinerary Build**
- **Route:** `POST /tripwell/itinerary/build`
- **File:** `itineraryRoutes.js`
- **Model:** `TripDay.js`
- **Status:** ❓ **NEEDS VERIFICATION** - Check route and model mapping

#### **9. Trip Reflection**
- **Route:** `POST /tripwell/reflection/:tripId/:dayIndex`
- **File:** `TripReflectionSaveRoutes.js`
- **Model:** `TripReflection.js`
- **Status:** ❓ **NEEDS VERIFICATION** - Check route and model mapping

### **🔧 IDENTIFIED MISMATCHES**

#### **TripPersona Model Issue:**
- **Problem:** `TripPersona.js` uses `userId: String` but should use `ObjectId` for consistency
- **Current:** `userId: { type: String, required: true }`
- **Should be:** `userId: { type: mongoose.Schema.Types.ObjectId, ref: "TripWellUser", required: true }`
- **Impact:** Inconsistent data types across models

## 🧪 **TESTING CHECKLIST**

### **Step 1: Persona Creation**
- [ ] Create persona via `/trip-persona`
- [ ] Verify `tripPersonaData` saved to localStorage
- [ ] Verify `TripPersona` document created in database

### **Step 2: Meta Selection**
- [ ] Navigate to `/meta-select`
- [ ] Verify meta attractions load from `/tripwell/meta-attractions`
- [ ] Select some meta attractions
- [ ] Verify selections save via `/tripwell/user-selections/meta`
- [ ] Verify `selectedMetas` saved to localStorage

### **Step 3: Sample Selection**
- [ ] Navigate to `/persona-sample`
- [ ] Verify samples generate via `/tripwell/persona-samples`
- [ ] Select some samples
- [ ] Verify selections save via `/tripwell/persona-sample-service`
- [ ] Verify `selectedSamples` saved to localStorage

### **Step 4: Itinerary Build**
- [ ] Navigate to `/tripwell/itinerarybuild`
- [ ] Verify itinerary builds via `/tripwell/itinerary/build`
- [ ] Verify `itineraryData` saved to localStorage

## ⚠️ **DO NOT DELETE UNTIL TESTED**

- [ ] `AnchorSelect.jsx` - May be used in error states
- [ ] `LastDayReflection.jsx` - May be used elsewhere
- [ ] `anchorgptRoute.js` - May be used by meta system
- [ ] `tripLiveStatusRoute.js` - May be used by live features
- [ ] Any other routes - Test first!

## 🎯 **NEXT STEPS**

1. **Test the current flow end-to-end**
2. **Identify what's broken**
3. **Fix what's broken**
4. **Only then consider deletions**

---

**🚨 CRITICAL: Do not delete anything else until we've traced and tested the entire flow!**
