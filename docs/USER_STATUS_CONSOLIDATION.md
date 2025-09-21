# User Status Consolidation - Breadcrumb

## Current State Fields (CONFUSING)
We have multiple overlapping state fields:
1. **`userStatus`** - Custom frontend routing field
2. **`userState`** - Python-managed engagement tracking  
3. **`journeyStage`** - Python-managed journey progression

## Proposed Consolidation
**Keep:**
- **`journeyStage`** - For journey progression (`"new_user"`, `"profile_complete"`, etc.)
- **`userStatus`** - For engagement state (consolidated from `userStatus` + `userState`)

**Remove:**
- **`userState`** - Eliminate this field

## Final `userStatus` Enum
```javascript
userStatus: { 
  type: String, 
  default: "demo_only", 
  enum: ["demo_only", "signup", "active", "abandoned", "inactive"] 
}
```

## Flow Logic
1. **Demo without auth** → Not a user (no database record)
2. **Demo with auth** → `userStatus: "demo_only"` (user but not on full app)
3. **Full app signup** → `userStatus: "signup"` (signed up, needs profile)
4. **Profile completion** → `userStatus: "active"` (full app user)

## Routing Logic
- `userStatus: "demo_only"` → Demo flows
- `userStatus: "signup"` → ProfileSetup  
- `userStatus: "active"` → LocalUniversalRouter

## Demo Flow (from ItineraryDemo.jsx)
1. User fills demo form (no auth)
2. Demo itinerary generated (no auth)
3. User sees "Continue with Google" 
4. Auth creates user with `funnelStage: "itinerary_demo"`
5. User gets `userStatus: "demo_only"`
6. Can upgrade to full app later

## TODO: Focus on Full App User Journey
- Remove `userState` field from model
- Update backend routes to use `userStatus` instead of `userState`
- Update Access.jsx routing logic
- Update LocalUniversalRouter routing logic
- Test the consolidated flow

## Key Insight
Demo users are tracked separately from full app users. Only full app users get the `"signup"` → `"active"` progression.
