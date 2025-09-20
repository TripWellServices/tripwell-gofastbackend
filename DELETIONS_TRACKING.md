# DELETIONS TRACKING

## 🗑️ **COMPLETED DELETIONS**

### **Old TripIntent System (COMPLETED)**
- ✅ **`TripIntent.js`** model - DELETED
- ✅ **`tripIntentRoutes.js`** routes - DELETED  
- ✅ **`TripIntentForm.jsx`** component - DELETED
- ✅ **`tripStatusRoute.js`** deprecated route - DELETED
- ✅ **`AnchorSelectSaveRoutes.js`** old anchor routes - DELETED

### **Backend Route Registrations Removed (COMPLETED)**
- ✅ **`tripIntentRoutes`** registration - REMOVED from index.js
- ✅ **`tripStatusRoute`** registration - REMOVED from index.js
- ✅ **`AnchorSelectSaveRoutes`** registration - REMOVED from index.js

## 🔄 **CURRENT NEW FLOW (ACTIVE)**
1. **`/trip-persona`** → `TripPersonaForm` → `/tripwell/trip-persona`
2. **`/meta-select`** → `TripMetaSelect` → `/tripwell/meta-attractions`  
3. **`/persona-sample`** → `TripSampleSelect` → `/tripwell/persona-samples`
4. **`/tripwell/itinerarybuild`** → `TripItineraryBuild` → `/tripwell/itinerary/build`

## 🚨 **POTENTIAL FUTURE DELETIONS (DO NOT DELETE YET)**

### **Deprecated Components (Not in Active Routes)**
- ⚠️ **`LastDayReflection.jsx`** - Not in App.jsx routing but may be used elsewhere
- ⚠️ **`AnchorSelect.jsx`** - Commented out but may have dependencies
- ⚠️ **`TripIntentRequired.jsx`** - May be used in error states
- ⚠️ **`TripItineraryRequired.jsx`** - May be used in error states

### **Potentially Unused Routes (Need Testing)**
- ⚠️ **`anchorgptRoute.js`** - May be used by new meta system
- ⚠️ **`anchorgpttestRoute.js`** - May be used for testing
- ⚠️ **`itineraryRoutes.js`** - Currently used by new flow
- ⚠️ **`tripLiveStatusRoute.js`** - May be used by live trip features

### **Models to Review**
- ⚠️ **`AnchorLogic.js`** - May still be used by new system
- ⚠️ **`TripDay.js`** - Likely still used for itinerary data
- ⚠️ **`TripBase.js`** - Core trip data, definitely needed

## 🎯 **FOCUS: GET TO ITINERARY**

The new persona flow should get users from:
1. **Persona Creation** → 
2. **Meta Selection** → 
3. **Sample Selection** → 
4. **Itinerary Build** ✅

**DO NOT DELETE ANYTHING ELSE** until this flow is fully tested and working!

## 📝 **TESTING CHECKLIST**

- [ ] Test `/trip-persona` route works
- [ ] Test `/meta-select` route works  
- [ ] Test `/persona-sample` route works
- [ ] Test `/tripwell/itinerarybuild` route works
- [ ] Test full flow from persona → itinerary
- [ ] Verify localStorage data flow
- [ ] Verify backend data persistence

## 🔍 **ROUTES THAT NEED VERIFICATION**

### **Frontend Calls vs Backend Routes**
- [ ] `/tripwell/joincodecheck` ✅ (JoinCodeCheckRoute.js)
- [ ] `/tripwell/livestatus` ✅ (tripLiveStatusRoute.js)  
- [ ] `/tripwell/meta-attractions` ✅ (metaAttractionsRoute.js)
- [ ] `/tripwell/persona-samples` ✅ (personaSamplesRoute.js)
- [ ] `/tripwell/persona-sample-service` ✅ (personaSamplesRoute.js)
- [ ] `/tripwell/trip-persona` ✅ (tripPersonaRoute.js)
- [ ] `/tripwell/itinerary/build` ✅ (itineraryRoutes.js)
- [ ] `/tripwell/hydrate` ✅ (hydrateRoute.js - updated)

---

**⚠️ IMPORTANT: Do not delete anything else until the new persona flow is fully tested and working end-to-end!**
