# TripWell Deletion System

## Overview
The TripWell deletion system has multiple layers for different use cases:

1. **Admin User Deletion** - Complete user removal (admin only)
2. **User Reset** - Reset user to new state (admin only)
3. **Cascade Deletion** - Delete trip and all related data

## Deletion Routes & Services

### 1. Admin User Deletion
**Route:** `DELETE /tripwell/admin/users/:id`
**Service:** `cascadeDeletionService.js`
**Purpose:** Completely delete a user and all their data

**What it deletes:**
- ✅ User's trip and all related data (TripPersona, TripItinerary, etc.)
- ✅ User record from TripWellUser collection
- ✅ All orphaned data cleanup

**Usage:**
```javascript
// Admin dashboard delete button
DELETE /tripwell/admin/users/68cf37e18c9b8d3d99b2f2e6
```

### 2. User Reset
**Route:** `POST /tripwell/usertrip/reset`
**Service:** `userResetService.js`
**Purpose:** Reset user to new user state (keep user, delete trip data)

**What it does:**
- ✅ Deletes user's trip and related data
- ✅ Resets user fields to new user state
- ✅ Keeps user record but clears tripId

**Usage:**
```javascript
// Admin dashboard reset button
POST /tripwell/usertrip/reset
{
  "userId": "68cf37e18c9b8d3d99b2f2e6",
  "resetType": "new_user"
}
```

### 3. Cascade Deletion Service
**File:** `services/TripWell/cascadeDeletionService.js`
**Purpose:** Core deletion logic for trips and users

**Functions:**
- `deleteTripCascade(tripId, session)` - Delete trip and all related data
- `deleteUserTripsCascade(userId, session)` - Delete user's trip and data
- `deleteOrphanedDataCascade()` - Clean up orphaned data
- `cascadeDelete(userId, tripId, session)` - Unified deletion interface

## Data Models Deleted

### Trip-Related Data:
- ✅ **TripBase** - Main trip record
- ✅ **TripPersona** - User's trip preferences
- ✅ **TripItinerary** - Generated itinerary
- ✅ **TripDay** - Individual day plans
- ✅ **AnchorLogic** - Trip anchors/attractions
- ✅ **TripReflection** - Post-trip reflections
- ✅ **JoinCode** - Trip join codes

### User-Related Data:
- ✅ **TripWellUser** - User profile (only in complete deletion)
- ✅ **UserSelections** - User's sample selections
- ✅ **CityStuffToDo** - Generated city samples
- ✅ **SampleSelects** - User sample selections

## Usage Examples

### Admin Dashboard - Delete User Completely
```javascript
// Completely remove user from system
DELETE /tripwell/admin/users/:userId
```

### Admin Dashboard - Reset User to New
```javascript
// Reset user to new user state
POST /tripwell/usertrip/reset
{
  "userId": "userId",
  "resetType": "new_user"
}
```

### Reset User to Specific Stage
```javascript
// Reset user to specific journey stage
POST /tripwell/usertrip/reset
{
  "userId": "userId", 
  "resetType": "stage",
  "stage": "signup"
}
```

## Error Handling

### Common Issues:
1. **Missing Models** - Ensure all imported models exist
2. **Transaction Failures** - Cascade deletion uses MongoDB transactions
3. **Orphaned Data** - Clean up data that references deleted records

### Debug Commands:
```javascript
// Check user's trip data
db.tripwellusers.findOne({_id: ObjectId("userId")}, {tripId: 1})

// Check trip data
db.tripbases.findOne({_id: ObjectId("tripId")})

// Check related data
db.trippersonas.find({tripId: ObjectId("tripId")})
db.tripitineraries.find({tripId: ObjectId("tripId")})
```

## Recent Fixes

### Fixed Issues:
1. ✅ **ObjectId Serialization** - Fixed `tripPersonaId` serialization in hydrate route
2. ✅ **Missing TripIntent Model** - Replaced with TripPersona in cascade deletion
3. ✅ **Wrong Query Logic** - Fixed user trip lookup in deleteUserTripsCascade
4. ✅ **Profile Completion Logic** - Fixed LocalUniversalRouter profile checks

### Current Status:
- ✅ Admin user deletion works
- ✅ User reset service works  
- ✅ Cascade deletion works
- ✅ ObjectId serialization fixed
- ✅ Profile completion logic fixed

## Best Practices

1. **Use Admin Deletion** for complete user removal
2. **Use User Reset** for testing/development
3. **Always use transactions** for cascade deletion
4. **Clean up orphaned data** regularly
5. **Test deletion** in development before production

## Future Improvements

1. **Soft Delete** - Mark records as deleted instead of removing
2. **Audit Trail** - Track what was deleted and when
3. **Bulk Operations** - Delete multiple users at once
4. **Recovery** - Restore deleted users (if needed)
