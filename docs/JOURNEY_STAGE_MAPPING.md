# Journey Stage Mapping - Backend Implementation

## 🎯 **CURRENT JOURNEY STAGE SYSTEM**

### **Python-Managed Journey Stages** (from tripwell-ai)
- **new_user** - Pre profile complete
- **profile_complete** - Profile done, no trip yet  
- **trip_set_done** - Trip created, itinerary not complete
- **itinerary_complete** - Itinerary done, trip not started
- **trip_active** - Trip is happening now
- **trip_complete** - Trip finished

### **User States** (from tripwell-ai)
- **demo_only** - User only uses demos, no profile/trip
- **active** - User has profile and/or trip, engaged
- **abandoned** - User signed up but never completed profile (>15 days)
- **inactive** - User completed profile but no trip activity

## 🚀 **BACKEND ROUTING LOGIC**

### **User Hydration Route** (`hydrateRoute.js`)
```javascript
// Check user journey stage and return appropriate route
const getUserRoute = (user) => {
  switch (user.journeyStage) {
    case 'new_user':
      return '/profile-setup';
    case 'profile_complete':
      return '/trip-setup';
    case 'trip_set_done':
      return '/trip-extra'; // or wherever trip planning starts
    case 'itinerary_complete':
      return '/trip-ready';
    case 'trip_active':
      return '/trip-live';
    case 'trip_complete':
      return '/trip-reflection';
    default:
      return '/access'; // fallback
  }
};

// In hydrate route response
res.json({
  user: userData,
  route: getUserRoute(userData),
  journeyStage: userData.journeyStage,
  userState: userData.userState
});
```

### **Profile Setup Route** (`profileSetupRoute.js`)
```javascript
// After profile completion, update journey stage
await TripWellUser.findByIdAndUpdate(user._id, {
  $set: {
    journeyStage: 'profile_complete',
    userState: 'active'
  }
});
```

### **Trip Setup Route** (`tripSetupRoute.js`)
```javascript
// After trip creation, update journey stage
await TripWellUser.findByIdAndUpdate(user._id, {
  $set: {
    journeyStage: 'trip_set_done',
    userState: 'active'
  }
});
```

## 📊 **ADMIN DASHBOARD JOURNEY TRACKING**

### **Admin User Fetch Route** (`adminUserFetchRoute.js`)
```javascript
// Include journey stage data in admin user list
const users = await TripWellUser.find({}, {
  userId: '$_id',
  email: 1,
  firstName: 1,
  lastName: 1,
  createdAt: 1,
  lastActiveAt: '$updatedAt',
  tripId: 1,
  tripCreatedAt: 1,
  role: 1,
  profileComplete: 1,
  funnelStage: 1,
  journeyStage: 1,  // ✅ ADD THIS
  userState: 1      // ✅ ADD THIS
}).sort({ createdAt: -1 });
```

### **Admin User Management Route** (`adminUserManagementRoute.js`)
```javascript
// Journey stage reset endpoint
router.post('/user/:userId/reset-journey', async (req, res) => {
  const { journeyStage, userState } = req.body;
  
  const user = await TripWellUser.findByIdAndUpdate(
    userId, 
    { 
      $set: { 
        journeyStage: journeyStage,
        userState: userState 
      } 
    },
    { new: true }
  );
  
  res.json({
    message: 'User journey reset successfully',
    user: {
      id: user._id,
      email: user.email,
      journeyStage: user.journeyStage,
      userState: user.userState
    }
  });
});
```

## 🔄 **JOURNEY STAGE TRANSITIONS**

### **Automatic Transitions** (Backend handles these)
1. **new_user** → **profile_complete**: When user completes profile setup
2. **profile_complete** → **trip_set_done**: When user creates their first trip
3. **trip_set_done** → **itinerary_complete**: When itinerary is built
4. **itinerary_complete** → **trip_active**: When trip start date arrives
5. **trip_active** → **trip_complete**: When trip end date passes

### **Manual Transitions** (Admin can reset these)
- Admin can reset any user to any journey stage
- Useful for fixing stuck users or testing flows
- Updates both `journeyStage` and `userState` fields

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: User Stuck in Trip Setup**
**Symptoms**: User has multiple trips, can't proceed
**Solution**: 
1. Use admin dashboard to see all user trips
2. Clean up duplicate trips using `/user/:userId/cleanup-duplicates`
3. Reset journey stage to `trip_set_done`
4. Test the flow

### **Issue 2: User Routed to Wrong Page**
**Symptoms**: User goes to profile setup when they should go to trip
**Solution**:
1. Check user's `journeyStage` in admin dashboard
2. Reset to correct stage using `/user/:userId/reset-journey`
3. Update frontend routing logic if needed

### **Issue 3: Journey Stage Shows "Unknown"**
**Symptoms**: Admin dashboard shows journey stage as unknown
**Solution**:
1. Check if backend is setting journey stage correctly
2. Ensure Python service is updating user data
3. Manually set journey stage using admin tools

## 📱 **FRONTEND INTEGRATION**

### **Access.jsx** - Use Backend Route
```javascript
const handleAuthenticatedUser = async (firebaseUser) => {
  try {
    // Get user data and route from backend
    const response = await axios.get(`${BACKEND_URL}/tripwell/hydrate`, {
      headers: authConfig.headers
    });
    
    const { route, journeyStage, userState } = response.data;
    
    // Route user to appropriate page
    navigate(route);
    
  } catch (error) {
    console.error('Error routing user:', error);
    navigate('/profile-setup'); // fallback
  }
};
```

### **Admin Dashboard** - Display Journey Stages
```javascript
// In AdminUsers.jsx
const getJourneyStageBadge = (journeyStage) => {
  const stages = {
    'new_user': { color: 'blue', label: 'New User' },
    'profile_complete': { color: 'green', label: 'Profile Complete' },
    'trip_set_done': { color: 'yellow', label: 'Trip Set Done' },
    'itinerary_complete': { color: 'purple', label: 'Itinerary Complete' },
    'trip_active': { color: 'orange', label: 'Trip Active' },
    'trip_complete': { color: 'gray', label: 'Trip Complete' }
  };
  
  const stage = stages[journeyStage] || { color: 'gray', label: 'Unknown' };
  return <span className={`badge badge-${stage.color}`}>{stage.label}</span>;
};
```

## 🔧 **IMPLEMENTATION CHECKLIST**

- [ ] Update `adminUserFetchRoute.js` to include journey stage data
- [ ] Update `profileSetupRoute.js` to set journey stage on profile completion
- [ ] Update `tripSetupRoute.js` to set journey stage on trip creation
- [ ] Update `hydrateRoute.js` to return user route based on journey stage
- [ ] Test all journey stage transitions
- [ ] Update admin dashboard to display journey stages
- [ ] Add journey stage filtering to admin dashboard
- [ ] Add journey stage analytics and reporting

## 📊 **ANALYTICS & REPORTING**

### **Journey Stage Conversion Rates**
```javascript
// In adminAnalyticsRoute.js
const calculateJourneyConversionRates = async () => {
  const totalUsers = await TripWellUser.countDocuments();
  
  const stages = await TripWellUser.aggregate([
    {
      $group: {
        _id: '$journeyStage',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const conversionRates = {
    profileCompletionRate: (stages.find(s => s._id !== 'new_user')?.count || 0) / totalUsers * 100,
    tripCreationRate: (stages.filter(s => ['trip_set_done', 'itinerary_complete', 'trip_active', 'trip_complete'].includes(s._id)).reduce((sum, s) => sum + s.count, 0)) / totalUsers * 100,
    itineraryCompletionRate: (stages.filter(s => ['itinerary_complete', 'trip_active', 'trip_complete'].includes(s._id)).reduce((sum, s) => sum + s.count, 0)) / totalUsers * 100,
    tripActivationRate: (stages.filter(s => ['trip_active', 'trip_complete'].includes(s._id)).reduce((sum, s) => sum + s.count, 0)) / totalUsers * 100
  };
  
  return conversionRates;
};
```

## 🚀 **QUICK FIXES NEEDED**

1. **Add journey stage to admin user fetch** - Include `journeyStage` and `userState` in admin user list
2. **Update profile setup route** - Set journey stage when profile is completed
3. **Update trip setup route** - Set journey stage when trip is created
4. **Update hydrate route** - Return user route based on journey stage
5. **Update admin dashboard** - Display journey stages and provide reset tools

**This replaces the deprecated funnel tracking with a proper backend-managed journey stage system!** 🚀
