# 🚨 CRITICAL RULE: ACCESS.JSX PROTECTION

## NEVER MODIFY ACCESS.JSX WITHOUT EXPLICIT USER APPROVAL

This is a **CRITICAL RULE** that must be followed at all times.

### Why This Rule Exists
- Access.jsx has been debugged and fixed multiple times
- It handles the most critical authentication and routing logic
- Any unauthorized changes can break the entire user flow
- The user has explicitly stated this rule after multiple debugging sessions

### What This Means
- **NEVER** modify Access.jsx without explicit user permission
- **NEVER** assume changes are needed in Access.jsx
- **ALWAYS** ask before touching Access.jsx
- **ALWAYS** document why Access.jsx changes are needed

### Current Access.jsx Status
- Handles Firebase authentication
- Routes new users to `/profilesetup`
- Routes existing users to `/localrouter`
- Sets basic hydration in localStorage
- Has been extensively debugged and is working correctly

### If Access.jsx Issues Arise
1. **DO NOT** immediately modify Access.jsx
2. **DO** investigate other components first
3. **DO** ask the user for explicit approval
4. **DO** document the exact issue and proposed fix

## BACKEND IS SOURCE OF TRUTH

### User Status Management
- Backend sets `userStatus: "new"` for new users in database
- Backend sets `profileComplete: false` for new users in database
- Frontend reads these values from backend via `hydrateRoute`
- No need for complex localStorage merging - backend is authoritative

### Flow
1. **Backend creates user** → sets `userStatus: "new"` and `profileComplete: false` in database
2. **Access.jsx** → gets backend response, saves to localStorage  
3. **LocalUniversalRouter** → calls `hydrateRoute` → gets same values from backend → no overwrite needed!

---
**Remember: Backend is source of truth. Access.jsx is protected.**
