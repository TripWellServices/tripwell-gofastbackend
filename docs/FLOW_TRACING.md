# FLOW TRACING - CURRENT STATE

## 🚨 **STOP DELETING - TRACE FIRST**

Before deleting anything else, let's trace what we currently have and what's working.

## 📋 **CURRENT FLOW MAPPING**

### **1. Persona Creation**
- **Frontend:** `TripPersonaForm.jsx` 
- **Route:** `/trip-persona`
- **Backend:** `/tripwell/trip-persona` (POST)
- **Model:** `TripPersona.js`
- **Status:** ✅ NEW - Should work

### **2. Meta Attractions**
- **Frontend:** `TripMetaSelect.jsx`
- **Route:** `/meta-select` 
- **Backend Hydrate:** `/tripwell/meta-attractions` (POST)
- **Backend Save:** `/tripwell/user-selections/meta` (POST)
- **Models:** `MetaAttractions.js`, `UserSelections.js`
- **Status:** ❓ NEEDS TESTING

### **3. Persona Samples**
- **Frontend:** `TripSampleSelect.jsx`
- **Route:** `/persona-sample`
- **Backend Generate:** `/tripwell/persona-samples` (POST)
- **Backend Save:** `/tripwell/persona-sample-service` (POST)
- **Models:** `TripPersona.js`, `UserSelections.js`
- **Status:** ❓ NEEDS TESTING

### **4. Itinerary Build**
- **Frontend:** `TripItineraryBuild.jsx`
- **Route:** `/tripwell/itinerarybuild`
- **Backend:** `/tripwell/itinerary/build` (POST)
- **Models:** `TripDay.js`, `TripBase.js`
- **Status:** ❓ NEEDS TESTING

## 🔍 **ROUTES TO VERIFY**

### **Meta Attractions Flow**
- [ ] `/tripwell/meta-attractions` - Takes `{ placeSlug, city, season }` from `tripData` - ✅ **WORKS** - Gets season from TripSetup via hydrateRoute
- [ ] `/tripwell/user-selections/meta` - Takes `{ tripId, selectedMetaNames }` - Does this save correctly?

### **Season Data Flow**
1. **TripSetup** → Creates `TripBase` with `season` field (computed by parseTrip service)
2. **hydrateRoute** → Returns `tripData.season` from `TripBase`
3. **TripMetaSelect** → Calls `/meta-attractions` with `tripData.season`
4. **MetaAttractions** → Uses `season` to find/generate season-specific meta attractions

### **Persona Samples Flow**  
- [ ] `/tripwell/persona-samples` - Takes `{ tripId, userId, city, personas, budget, whoWith }` - Does this generate samples?
- [ ] `/tripwell/persona-sample-service` - Takes `{ tripId, userId, selectedSamples, currentPersonas }` - Does this update weights?

### **Itinerary Build Flow**
- [ ] `/tripwell/itinerary/build` - Takes `{ tripId, userId, selectedMetas, selectedSamples }` - Does this build itinerary?

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
