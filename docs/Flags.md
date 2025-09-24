# FLAGS.md - TripWell Flag System Documentation

## 🎯 **Purpose**
This document defines flags that are NOT obvious from data existence and serve specific business purposes beyond simple routing.

## 🚦 **FLAG DEFINITIONS**

### **TripBase Model Flags**

#### **`tripStartedByOriginator`** 
- **Type:** Boolean (default: false)
- **Purpose:** Track if the trip originator has started their live trip experience
- **Business Logic:** Used for analytics, email marketing, and admin tracking
- **Sets:** When originator clicks "Start My Trip" button
- **Route:** `POST /tripwell/starttrip/:tripId`
- **Admin Use:** Track originator engagement and trip activation

#### **`tripStartedByParticipant`**
- **Type:** Boolean (default: false) 
- **Purpose:** Track if a participant has started their live trip experience
- **Business Logic:** Used for analytics, email marketing, and admin tracking
- **Sets:** When participant clicks "Start My Trip" button
- **Route:** `POST /tripwell/starttrip/:tripId`
- **Admin Use:** Track participant engagement and trip activation

#### **`tripComplete`**
- **Type:** Boolean (default: false)
- **Purpose:** Mark trip as officially completed (not just data exists)
- **Business Logic:** Triggers post-trip flows, email campaigns, reflection prompts
- **Sets:** When trip end date passes OR user completes final day
- **Routes:** `TripDoAllCompleterRoute.js`, `tripLiveStatusRoute.js`
- **Admin Use:** Analytics, conversion tracking, post-trip marketing

### **TripWellUser Model Flags**

#### **`profileComplete`**
- **Type:** Boolean (default: false)
- **Purpose:** Mark user profile as fully completed (not just has data)
- **Business Logic:** Gates access to trip creation, email marketing segmentation
- **Sets:** When user completes all required profile fields
- **Route:** `profileSetupRoute.js`
- **Admin Use:** User segmentation, onboarding analytics

#### **`userStatus`**
- **Type:** String enum
- **Values:** `"signup"`, `"active"`, `"demo_only"`, `"abandoned"`, `"inactive"`
- **Purpose:** User lifecycle tracking for marketing and admin
- **Business Logic:** Email campaign triggers, user health scoring
- **Sets:** Various routes based on user behavior
- **Admin Use:** User health dashboard, retention campaigns

#### **`journeyStage`**
- **Type:** String enum  
- **Values:** `"new_user"`, `"profile_complete"`, `"trip_set_done"`, `"itinerary_complete"`, `"trip_active"`, `"trip_complete"`
- **Purpose:** Backend business logic progression (NOT frontend routing)
- **Business Logic:** Python AI tracking, analytics, admin dashboards
- **Sets:** Backend routes based on user progression
- **Admin Use:** Journey analytics, conversion funnels

#### **`funnelStage`**
- **Type:** String enum
- **Values:** `"full app"`, `"demos"`
- **Purpose:** Track user engagement level (deprecated in favor of journeyStage)
- **Business Logic:** Legacy tracking system
- **Sets:** Various routes
- **Admin Use:** Legacy analytics (being phased out)

## 🔍 **FLAG vs DATA EXISTENCE**

### **Flags (Business Logic)**
- `tripStartedByOriginator` - Has user clicked "Start Trip"?
- `tripStartedByParticipant` - Has participant clicked "Start Trip"?
- `tripComplete` - Is trip officially finished?
- `profileComplete` - Is profile fully filled out?
- `userStatus` - What's the user's lifecycle state?
- `journeyStage` - What's the user's progression stage?

### **Data Existence (Simple Routing)**
- `tripData` - Does trip document exist?
- `tripPersonaData` - Does persona document exist?
- `selectedMetas` - Does array have items?
- `selectedSamples` - Does array have items?
- `itineraryData` - Does itinerary document exist?

## 🚨 **CRITICAL FLAG ISSUES**

### **❌ LocalUniversalRouter Flag Mismatch**
- **Expects:** `tripData.startedTrip === true`
- **Available:** `tripData.tripStartedByOriginator`, `tripData.tripStartedByParticipant`
- **Fix Needed:** Update LocalUniversalRouter to check existing flags

### **❌ Flag vs Data Confusion**
- **Journey Stages** = Backend business logic (analytics, Python AI)
- **Navigation Flags** = Frontend routing logic (what page to show)
- **Data Existence** = Simple localStorage checks (does data exist?)

## 📊 **FLAG USAGE BY SYSTEM**

### **🎯 Navigation/TripBrain Tags (Frontend Routing)**
- **`profileComplete`** - Straight up nav flag (user created but profile empty vs filled)
- **`tripComplete`** - Straight up nav flag (trip exists but not finished vs finished)
- **`tripStartedByOriginator/Participant`** - Nav flag (trip exists but not started vs started)
- **Purpose:** LocalUniversalRouter routing decisions

### **👥 Admin Functionality**
- **`userStatus`** - Admin functionality (active/inactive for user management)
  - Values: `"active"`, `"inactive"`, `"abandoned"`, `"demo_only"`
  - Purpose: Delete inactive users, user health tracking
- **`journeyStage`** - Admin functionality (high-level progression markers)
  - Values: `"new_user"`, `"profile_complete"`, `"trip_set_done"`, etc.
  - Purpose: See if users are progressing through the funnel
- **Purpose:** Admin dashboards, user management, analytics

### **📧 Email Marketing**
- Uses: `userStatus`, `profileComplete`, `tripComplete`
- Purpose: Campaign triggers, user segmentation

### **🔧 Backend Business Logic**
- Uses: `journeyStage`, `userStatus`, `funnelStage`
- Purpose: Python AI tracking, analytics, admin dashboards

## 🎯 **FLAG PLANTING VERIFICATION**

### **✅ Working Flags**
- `profileComplete` - Set in profileSetupRoute.js
- `tripComplete` - Set in TripDoAllCompleterRoute.js
- `tripStartedByOriginator/Participant` - Set in tripStartRoute.js

### **❌ Broken Flags**
- `startedTrip` - Referenced in LocalUniversalRouter but doesn't exist
- Flag system mismatch between backend journey stages and frontend navigation

## 🔧 **RECOMMENDED FIXES**

1. **Fix LocalUniversalRouter** - Use existing `tripStartedByOriginator/Participant` flags
2. **Separate Concerns** - Keep journey stages for backend, use flags for frontend routing
3. **Document Flag Purposes** - Each flag should have clear business purpose
4. **Flag Planting Verification** - Ensure all flags are properly set by backend routes
