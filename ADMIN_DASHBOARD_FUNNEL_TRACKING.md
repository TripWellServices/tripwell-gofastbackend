# Admin Dashboard Funnel & User Journey Tracking

## 🚨 **FREEZE FRAME - ADMIN DASHBOARD TRACKING**

Here's exactly what the admin dashboard is tracking for user journey and funnel stages.

## 📊 **ADMIN DASHBOARD DATA STRUCTURE**

### **User Data Fields (from adminUserFetchRoute.js)**
```javascript
{
  userId: ObjectId,           // User's MongoDB ID
  email: String,              // User's email
  firstName: String,          // User's first name
  lastName: String,           // User's last name
  createdAt: Date,            // When user account was created
  lastActiveAt: Date,         // Last activity (using updatedAt as proxy)
  tripId: ObjectId,           // Current trip assignment (null if no trip)
  tripCreatedAt: Date,        // When trip was created (if they have one)
  tripCompletedAt: null,      // Trip completion date (not implemented yet)
  role: String,               // "noroleset" | "originator" | "participant"
  profileComplete: Boolean,   // Has user completed profile setup?
  funnelStage: String         // User's funnel stage (see below)
}
```

## 🎯 **FUNNEL STAGES BREAKDOWN**

### **Funnel Stage Values**
- **"none"** - Brand new user (default state)
- **"itinerary_demo"** - User tried itinerary demo
- **"spots_demo"** - User tried best things demo  
- **"updates_only"** - User wants updates only
- **"full_app"** - User is using full app

### **Admin Dashboard Categorization**

#### **FunnelTracker.jsx** - Tracks Demo Users
```javascript
// Filters users to show ONLY demo users (not full app users)
const funnelUsers = userData.filter(user => 
  user.funnelStage && 
  user.funnelStage !== 'full_app' && 
  user.funnelStage !== 'none'
);

// Tracks these funnel stages:
- itinerary_demo
- spots_demo  
- updates_only
```

#### **UserJourney.jsx** - Tracks Full App Users
```javascript
// Filters users to show ONLY full app users
const fullAppUsers = userData.filter(user => 
  !user.funnelStage || 
  user.funnelStage === 'full_app' || 
  user.funnelStage === 'none'
);

// Tracks these user states:
- full_app (active full app users)
- none (brand new users who haven't tried demos)
```

## 📈 **FUNNEL TRACKING METRICS**

### **FunnelTracker Dashboard Metrics**
```javascript
const stats = {
  total: userData.length,           // Total demo users
  itinerary_demo: 0,               // Count of itinerary demo users
  spots_demo: 0,                   // Count of best things demo users
  updates_only: 0,                 // Count of update-only users
  conversionRates: {}              // Conversion rates between stages
};
```

### **UserJourney Dashboard Metrics**
```javascript
const metrics = {
  totalUsers: users.length,         // Total full app users
  newUsers: users.filter(user => {
    const days = getDaysSinceCreation(user.createdAt);
    return days <= 15;              // Users created in last 15 days
  }).length,
  activeUsers: users.filter(user => user.tripId).length,  // Users with trips
  profileComplete: users.filter(user => user.profileComplete).length
};
```

## 🎯 **USER JOURNEY STATES**

### **User Status Categories (from DEV_GUIDE.md)**
- **Active User** - Has active trip (do not delete)
- **New User** - Account <15 days old with profile (give them time)
- **Incomplete Profile** - New account (give them time to complete profile)
- **Abandoned Account** - Account >15 days old with no profile (safe to delete)
- **Inactive User** - Account >15 days old with profile but no trip

### **User Journey Progression**
```
1. New User Signup
   ↓
2. funnelStage: "none" (brand new)
   ↓
3. Try Demo OR Go Full App
   ↓
4a. Demo Path: funnelStage: "spots_demo" | "itinerary_demo"
   ↓
4b. Full App Path: funnelStage: "full_app"
   ↓
5. Profile Setup: profileComplete: true
   ↓
6. Trip Creation: role: "originator", tripId: assigned
   ↓
7. Trip Completion: tripCompletedAt: date (future)
```

## 🔍 **ADMIN DASHBOARD FILTERING LOGIC**

### **FunnelTracker (Demo Users)**
- **Shows**: `itinerary_demo`, `spots_demo`, `updates_only`
- **Hides**: `full_app`, `none`
- **Purpose**: Track demo user conversion and engagement

### **UserJourney (Full App Users)**  
- **Shows**: `full_app`, `none` (legacy users)
- **Hides**: `itinerary_demo`, `spots_demo`, `updates_only`
- **Purpose**: Track full app user progression and trip creation

### **AdminUsers (All Users)**
- **Shows**: ALL users regardless of funnel stage
- **Purpose**: General user management and deletion

## 📊 **KEY INSIGHTS FROM ADMIN DASHBOARD**

### **Funnel Stage Distribution**
- **"none"** = Brand new users (potential for welcome emails)
- **"spots_demo"** = Best things demo users (no welcome emails)
- **"itinerary_demo"** = Itinerary demo users (no welcome emails)
- **"updates_only"** = Email subscribers (no welcome emails)
- **"full_app"** = Active app users (no welcome emails)

### **Email Strategy Based on Funnel Stage**
```javascript
// Send welcome emails to:
if (funnelStage === "none") {
  // Send welcome email - brand new user
}

// Don't send welcome emails to:
if (funnelStage === "spots_demo" || 
    funnelStage === "itinerary_demo" || 
    funnelStage === "updates_only" || 
    funnelStage === "full_app") {
  // Skip welcome email - they're already engaged
}
```

## 🎯 **ADMIN DASHBOARD PAGES**

### **1. FunnelTracker.jsx**
- **Purpose**: Monitor demo user conversion
- **Shows**: Demo users only (`spots_demo`, `itinerary_demo`, `updates_only`)
- **Metrics**: Conversion rates, demo engagement
- **Actions**: Bulk operations on demo users

### **2. UserJourney.jsx**  
- **Purpose**: Track full app user progression
- **Shows**: Full app users only (`full_app`, `none`)
- **Metrics**: Profile completion, trip creation, user activity
- **Actions**: User management for active users

#### **UserJourney Sorting/Filtering:**
- **Current Filtering**: Shows only full app users (`full_app`, `none` funnel stages)
- **User Status Categories**:
  1. **Active User** - Has trip (`user.tripId` exists)
  2. **New User** - Account <15 days old + has profile
  3. **Incomplete Profile** - Account <15 days old + no profile  
  4. **Abandoned Account** - Account >15 days old + no profile
  5. **Inactive User** - Account >15 days old + has profile but no trip
- **Display**: User list with status badges, journey funnel (4 stages), status breakdown
- **No sorting dropdowns** - just displays all full app users

### **3. AdminUsers.jsx**
- **Purpose**: General user management
- **Shows**: ALL users regardless of funnel stage
- **Metrics**: User status categories, deletion safety
- **Actions**: User deletion, status management

## 📧 **EMAIL-SPECIFIC FLAGS NEEDED**

### **Current User Status vs Email Strategy**

**User Status Categories** (from UserJourney) are for tracking **"are they using the app or not"**:
- Active User, New User, Incomplete Profile, Abandoned Account, Inactive User

**Email Strategy** needs **CRM/engagement flags** for **"how do we engage them"**:
- Welcome emails, follow-up emails, re-engagement emails, etc.

### **Proposed Email-Specific Flags**

```javascript
// Add to TripWellUser model for email engagement
{
  // === EMAIL ENGAGEMENT FLAGS ===
  welcomeEmailSent: Boolean,        // Has welcome email been sent?
  welcomeEmailSentAt: Date,         // When was welcome email sent?
  lastEmailSent: Date,              // Last email sent to user
  emailEngagementStage: String,     // "new", "engaged", "dormant", "unsubscribed"
  emailOptIn: Boolean,              // Has user opted into emails?
  emailBounceCount: Number,         // Email bounce tracking
  emailOpenCount: Number,           // Email open tracking
  emailClickCount: Number,          // Email click tracking
  
  // === EMAIL CAMPAIGN FLAGS ===
  profileReminderSent: Boolean,     // Profile completion reminder sent?
  tripReminderSent: Boolean,        // Trip creation reminder sent?
  reEngagementSent: Boolean,        // Re-engagement email sent?
}
```

### **Email Engagement Stages**
- **"new"** - Brand new user, send welcome email
- **"engaged"** - Active user, send relevant updates
- **"dormant"** - Inactive user, send re-engagement
- **"unsubscribed"** - User opted out, no emails

## 🚨 **THE BOTTOM LINE**

The admin dashboard is already tracking:
- **Funnel stages** for user engagement level
- **User journey** progression through the app
- **Profile completion** status
- **Trip creation** and role assignment
- **User activity** and account age

**For email service**: We need **separate email-specific flags** for CRM engagement strategy, while the existing user status is for app usage tracking.

**Recommendation**: Add email engagement flags to TripWellUser model for proper email campaign management! 📧
