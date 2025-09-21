# 🚨 CRITICAL HYDRATION RULES

## **ONLY LocalUniversalRouter Hydrates!**

### **Rule: NO HYDRATION ON INDIVIDUAL PAGES**

**❌ WRONG - Individual pages should NOT hydrate:**
- TripCreation page → NO hydration calls
- ProfileSetup page → NO hydration calls  
- TripPersonaForm page → NO hydration calls
- Any other individual page → NO hydration calls

**✅ CORRECT - Only LocalUniversalRouter hydrates:**
- LocalUniversalRouter → ONLY place that calls `/tripwell/hydrate`
- Individual pages → Use dual save (frontend + backend)

## **Individual Pages Should Use DUAL SAVE**

### **Pattern for Individual Pages:**
1. **User action** → Save to backend
2. **Backend success** → Save to localStorage  
3. **Navigate to next page** → Let LocalUniversalRouter handle hydration

### **Example - Trip Creation:**
```javascript
// ❌ WRONG - Don't do this on TripCreation page
await fetch('/tripwell/hydrate'); // NO!

// ✅ CORRECT - Do this on TripCreation page  
const response = await fetch('/tripwell/trip-setup', {
  method: 'POST',
  body: JSON.stringify(tripData)
});

if (response.ok) {
  const trip = await response.json();
  localStorage.setItem('tripData', JSON.stringify(trip)); // Dual save
  navigate('/tripcreated'); // Navigate, let LocalUniversalRouter hydrate later
}
```

## **Why This Matters**

### **Performance:**
- Individual pages load faster (no extra hydration calls)
- LocalUniversalRouter handles all data fetching centrally

### **Data Consistency:**
- Single source of truth for hydration
- No race conditions between multiple hydration calls

### **User Experience:**
- Pages load immediately after user actions
- Hydration happens in background when needed

## **The Error We Fixed**

**Problem:** TripCreation page was calling hydration, causing:
- Backend error: `ReferenceError: Cannot access 'isNewUser' before initialization`
- Frontend error: `ReferenceError: trip is not defined`

**Root Cause:** Individual page was doing hydration instead of dual save.

**Solution:** Remove hydration from individual pages, use dual save pattern.

## **Enforcement Rule**

**🚨 NEVER add hydration calls to individual pages!**

- If you need fresh data → Use dual save pattern
- If you need to refresh all data → Navigate to LocalUniversalRouter
- If you need to check user state → Use existing localStorage data

**LocalUniversalRouter is the ONLY hydration authority!**
