# TripWell Admin Routes Audit

## 🚨 **Current State: MESSY!**
We have **90+ admin routes** scattered across multiple files. Many are deprecated or redundant.

## 📋 **Route Categories**

### **✅ ACTIVE ADMIN ROUTES (Keep)**
#### User Management
- `GET /tripwell/admin/users` - Fetch all users (adminUserFetchRoute.js)
- `DELETE /tripwell/admin/users/:id` - Delete user with cascade (adminUserModifyRoute.js)
- `POST /tripwell/admin/user/:userId/reset-journey` - Reset user journey (adminUserModifyRoute.js)
- `PUT /tripwell/admin/fixProfileComplete` - Fix profile completion (adminUserModifyRoute.js)

#### Trip Management  
- `GET /tripwell/admin/trips` - Fetch all trips (adminTripModifyRoute.js)
- `DELETE /tripwell/admin/trips/:id` - Delete trip with cascade (adminTripModifyRoute.js)
- `GET /tripwell/admin/trips/:id` - Get trip details (adminTripModifyRoute.js)

#### Analytics
- `GET /tripwell/admin/analytics` - Get basic analytics (adminAnalyticsRoute.js)
- `POST /tripwell/admin/analyze-user` - Analyze user with Python (adminUserAnalyzeRoute.js)
- `GET /tripwell/admin/get-user/:userId` - Get updated user data (adminUserAnalyzeRoute.js)

#### Admin Auth
- `POST /tripwell/admin/login` - Validate admin credentials (adminLoginRoute.js)
- `GET /tripwell/admin/ping` - Test route (adminUserModifyRoute.js)
- `GET /tripwell/admin/test` - Test TripWellUser model (adminUserModifyRoute.js)

### **❌ DEPRECATED ROUTES (Delete)**
#### Old Content Library Routes
- `POST /tripwell/parse-city` - Parse city data (contentLibraryRoute.js)
- `GET /tripwell/content-library/status` - Content library status (contentLibraryRoute.js)
- `GET /tripwell/content-library/city/:cityName` - Get city content (contentLibraryRoute.js)

#### Old Meta Attraction Routes
- `POST /tripwell/meta-parse-and-save` - Parse and save meta attractions (metaParseAndSaveRoute.js)
- `POST /tripwell/meta-creator` - Create meta attractions (metaCreatorRoute.js)

#### Old Place/Profile Routes
- `POST /tripwell/place-profile-save` - Save place profile (placeProfileSaveRoute.js)
- `POST /tripwell/placetodo-gpt` - Generate place todos (placetodoGPTRoute.js)
- `POST /tripwell/meta-place-gpt` - Generate meta place (metaPlaceRoute.js)
- `GET /tripwell/place-detail/:profileSlug` - Get place detail (profileDetailRoute.js)
- `GET /tripwell/place-library` - Get place library (placeLibraryRoute.js)

#### Old City Data Routes
- `POST /tripwell/city-data` - Save city data (cityDataCallRoute.js)
- `POST /tripwell/city-data-parser` - Parse city data (cityDataParserRoute.js)
- `POST /tripwell/city-data-gpt` - Generate city data (cityDataGPTRoute.js)

#### Old Profile Routes
- `POST /tripwell/profile-gpt` - Generate profile (profileGPTRoute.js)
- `POST /tripwell/profile-parser` - Parse profile (profileParserRoute.js)

#### Old Demo Routes
- `POST /tripwell/bestthings` - Demo best things (demoBestThingsRoute.js)
- `POST /tripwell/bestthings/save` - Save demo best things (demoBestThingsRoute.js)
- `POST /tripwell/generate` - Generate demo itinerary (ItineraryDemoRoute.js)
- `POST /tripwell/save` - Save demo trip (ItineraryDemoRoute.js)

#### Old Vacation Planner Routes
- `POST /tripwell/vacation-planner` - Generate vacation plan (vacationLocationPlannerRoute.js)
- `POST /tripwell/vacation-planner/save` - Save vacation plan (vacationLocationPlannerRoute.js)

#### Old Email Routes
- `POST /tripwell/email-test` - Test email service (emailTestRoute.js)

### **🔄 MIGRATION ROUTES (Keep for now)**
#### User Reset
- `POST /tripwell/usertrip/reset` - Reset user to new state (userTripUpdate.js)
- `GET /tripwell/usertrip/reset-options` - Get reset options (userTripUpdate.js)

#### Trip Setup
- `POST /tripwell/tripsetup/` - Create trip (tripSetupRoute.js)
- `POST /tripwell/tripsetup/demo` - Demo trip setup (tripSetupRoute.js)
- `POST /tripwell/tripsetup/demo/save` - Save demo trip (tripSetupRoute.js)

## 🗑️ **Files to DELETE (Deprecated Routes)**

### **Content Library Routes (OLD)**
- `contentLibraryRoute.js` - Parse city data
- `cityDataCallRoute.js` - Save city data
- `cityDataParserRoute.js` - Parse city data
- `cityDataGPTRoute.js` - Generate city data

### **Meta Attraction Routes (OLD)**
- `metaParseAndSaveRoute.js` - Parse and save meta attractions
- `metaCreatorRoute.js` - Create meta attractions

### **Place/Profile Routes (OLD)**
- `placeProfileSaveRoute.js` - Save place profile
- `placetodoGPTRoute.js` - Generate place todos
- `metaPlaceRoute.js` - Generate meta place
- `profileDetailRoute.js` - Get place detail
- `placeLibraryRoute.js` - Get place library
- `profileGPTRoute.js` - Generate profile
- `profileParserRoute.js` - Parse profile

### **Demo Routes (OLD)**
- `demoBestThingsRoute.js` - Demo best things
- `ItineraryDemoRoute.js` - Demo itinerary
- `vacationLocationPlannerRoute.js` - Vacation planner

### **Email Routes (OLD)**
- `emailTestRoute.js` - Test email service

## 📁 **Files to KEEP (Active Routes)**

### **Core Admin Routes**
- `adminUserFetchRoute.js` - Fetch users
- `adminUserModifyRoute.js` - Modify users
- `adminTripModifyRoute.js` - Modify trips
- `adminAnalyticsRoute.js` - Analytics
- `adminUserAnalyzeRoute.js` - User analysis
- `adminLoginRoute.js` - Admin auth

### **Core User Routes**
- `userTripUpdate.js` - User trip updates
- `tripSetupRoute.js` - Trip setup
- `profileSetupRoute.js` - Profile setup
- `TripWellUserRoute.js` - User management

### **Core Trip Routes**
- `tripPersonaRoute.js` - Trip persona
- `personaSamplesRoute.js` - Persona samples
- `metaAttractionsRoute.js` - Meta attractions
- `userSelectionsRoute.js` - User selections
- `itineraryRoutes.js` - Itinerary generation

### **Core Live Trip Routes**
- `TripReflectionLoadRoutes.js` - Load reflections
- `TripReflectionSaveRoutes.js` - Save reflections
- `livedayGPTModifyBlockRoute.js` - Modify blocks
- `askAngelaLiveRoute.js` - Ask Angela
- `TripDoAllCompleterRoute.js` - Complete blocks

## 🎯 **Recommended Actions**

### **1. DELETE Deprecated Files (15+ files)**
```bash
# Delete old content library routes
rm routes/TripWell/contentLibraryRoute.js
rm routes/TripWell/cityDataCallRoute.js
rm routes/TripWell/cityDataParserRoute.js
rm routes/TripWell/cityDataGPTRoute.js

# Delete old meta attraction routes
rm routes/TripWell/metaParseAndSaveRoute.js
rm routes/TripWell/metaCreatorRoute.js

# Delete old place/profile routes
rm routes/TripWell/placeProfileSaveRoute.js
rm routes/TripWell/placetodoGPTRoute.js
rm routes/TripWell/metaPlaceRoute.js
rm routes/TripWell/profileDetailRoute.js
rm routes/TripWell/placeLibraryRoute.js
rm routes/TripWell/profileGPTRoute.js
rm routes/TripWell/profileParserRoute.js

# Delete old demo routes
rm routes/TripWell/demoBestThingsRoute.js
rm routes/TripWell/ItineraryDemoRoute.js
rm routes/TripWell/vacationLocationPlannerRoute.js

# Delete old email routes
rm routes/TripWell/emailTestRoute.js
```

### **2. CLEAN UP Route Registration**
Remove deprecated routes from `index.js`:
```javascript
// Remove these lines from index.js
app.use("/tripwell", require("./routes/TripWell/contentLibraryRoute"));
app.use("/tripwell", require("./routes/TripWell/cityDataCallRoute"));
// ... etc for all deprecated routes
```

### **3. UPDATE Documentation**
- Update `ADMIN.md` with current routes
- Update `DELETION.md` with current deletion methods
- Create `ROUTE_INDEX.md` with all active routes

## 📊 **Impact**
- **Before**: 90+ routes across 25+ files
- **After**: ~30 routes across 15 files
- **Reduction**: 60+ deprecated routes removed
- **Maintenance**: Much easier to manage

## 🚀 **Next Steps**
1. **Audit each route** - Verify it's actually used
2. **Delete deprecated files** - Remove unused routes
3. **Update route registration** - Clean up index.js
4. **Test admin dashboard** - Ensure it still works
5. **Update documentation** - Reflect current state
