# User Data Architecture - CANON

## 🎯 **Core Principle: NO FLAGS, NO BOOLEANS - JUST USER DATA**

We refactored the entire app to eliminate arbitrary flags and boolean checks. The system now works on **actual user data existence**.

## 🗄️ **Single Source of Truth: TripWellUser**

- ✅ **TripWellUser** = The ONLY user collection
- ❌ **No TripWellFirebaseOnly** = Deleted (was causing confusion)
- ❌ **No profileComplete flags** = Deleted (was arbitrary)
- ❌ **No userStatus flags** = Deleted (was confusing)

## 🔍 **User Existence Checks**

### **User Exists?**
```javascript
// OLD (Jacked):
if (user.profileComplete === true) { ... }

// NEW (Canon):
if (user.firebaseId) { ... }
```

### **Profile Complete?**
```javascript
// OLD (Jacked):
if (user.profileComplete === true) { ... }

// NEW (Canon):
if (user.firstName && user.lastName) { ... }
```

## 🚀 **User Journey Flow**

### **1. Firebase Auth (User Exists)**
- **Check**: `user.firebaseId` exists
- **Action**: User can access app
- **Data**: Basic Firebase data only

### **2. Profile Setup (Profile Complete)**
- **Check**: `user.firstName && user.lastName` exist
- **Action**: User can proceed to trip planning
- **Data**: Full profile data

### **3. Trip Setup (Trip Ready)**
- **Check**: `user.tripId` exists
- **Action**: User can access trip features
- **Data**: Trip data linked to user

## 🧹 **Clean Data Model**

### **TripWellUser Fields:**
```javascript
{
  firebaseId: String,        // User exists
  email: String,            // User exists
  firstName: String,        // Profile complete
  lastName: String,         // Profile complete
  hometownCity: String,     // Profile complete
  persona: String,          // Profile complete
  planningStyle: String,    // Profile complete
  dreamDestination: String, // Profile complete
  tripId: ObjectId,         // Trip ready
  role: String,             // Trip ready
  lastAnalyzedAt: Date      // Python tracking
}
```

### **Removed Fields:**
- ❌ `profileComplete: Boolean`
- ❌ `userStatus: String`
- ❌ `journeyStage: String`
- ❌ `funnelStage: String`
- ❌ `lastMarketingEmail: Object`
- ❌ `personaScore: Number`
- ❌ `planningFlex: Number`

## 🎯 **Benefits**

- ✅ **Simple Logic** - Check actual data, not flags
- ✅ **No Confusion** - Data exists = feature available
- ✅ **Clean Architecture** - One user model, one source of truth
- ✅ **Better Performance** - No complex flag checking
- ✅ **Easier Debugging** - Data is self-explanatory

## 🚨 **CANON RULES**

1. **NO FLAGS** - Never use boolean flags for user state
2. **NO ARBITRARY CHECKS** - Check actual data existence
3. **SINGLE SOURCE** - TripWellUser is the only user collection
4. **DATA DRIVEN** - If data exists, feature is available
5. **KEEP IT SIMPLE** - Complex state management is the enemy

## 📝 **Migration Notes**

- **Old users** with flags will be migrated to data-driven checks
- **Frontend** updated to check data existence instead of flags
- **Backend** simplified to use single user model
- **Marketing** moved to separate MarketingData model

---

**This is the new canon. Follow it religiously.**
