# GPT Itinerary Generation - Complete Flow Documentation

## 🎯 **OVERVIEW**

The itinerary generation system uses Angela (GPT-4) to create structured, tagged itineraries with clean JSON output for both user display and backend analysis.

## 🏗️ **ARCHITECTURE**

### **Service Flow:**
1. **Feed In** → LLM-ready data + selected metas + selected samples
2. **Angela Generates** → Structured JSON with persona/budget/type tags
3. **Parse & Save** → Store in ItineraryDays model with full tags
4. **Hydrate Frontend** → Frontend gets clean display data (activity names only)

### **Key Models:**
- **`ItineraryDays.js`** → Source of truth with full structured data (tags)
- **`TripCurrentDays.js`** → Live trip data (frontend display only)
- **`TripLLMReady.js`** → LLM-ready data for Angela prompts

## 🤖 **ANGELA PROMPT STRUCTURE**

### **System Prompt:**
```
You are Angela, a highly intuitive AI travel planner.

**TRIP OVERVIEW:**
${daysTotal}-day trip to ${city}, ${country} during ${season}
Purpose: ${purpose}
Traveling with: ${whoWith}

**USER PROFILE:**
${tripPersonaLLM}

**BUDGET & STYLE:**
${tripBudgetLLM}
${tripSpacingLLM}

**MUST INCLUDE:**
${selectedMetas.length > 0 ? selectedMetas.map(meta => `• ${meta.name}: ${meta.description}`).join('\n') : '• No specific meta attractions selected'}

**USER PREFERENCES (from sample selections):**
${selectedSamples.length > 0 ? selectedSamples.map(sample => `• ${sample.name} (${sample.type}): ${sample.why_recommended}`).join('\n') : '• No sample preferences selected'}
```

### **Instructions:**
```
**INSTRUCTIONS:**
Create a ${daysTotal}-day itinerary following this structure:
• **Meta Attractions**: Include 1 meta attraction per day (spread across days)
• **Day Structure**: Once meta attraction is placed, fill with restaurants and neat things to do
• **Spacing**: Respect their spacing preferences (relaxed/balanced/packed)
• **Persona Matching**: Use their persona profile (described above) to select similar activities
• **Budget Matching**: Use their budget level (described above) for activity selection

**Day Structure Rules:**
- **1 meta attraction per day** (can be morning, afternoon, or evening)
- **Fill remaining blocks** with restaurants and neat things to do
- **Mix up the order** - be creative with timing
- **Balance**: Mix of attractions, restaurants, and neat things to do
```

### **JSON Output Format:**
```json
{
  "days": [
    {
      "dayIndex": 1,
      "summary": "Brief day overview",
      "blocks": {
        "morning": {
          "activity": "Activity name",
          "type": "attraction|restaurant|activity|transport|free_time",
          "persona": "art|foodie|history|adventure",
          "budget": "budget|moderate|luxury"
        },
        "afternoon": {
          "activity": "Activity name",
          "type": "attraction|restaurant|activity|transport|free_time",
          "persona": "art|foodie|history|adventure",
          "budget": "budget|moderate|luxury"
        },
        "evening": {
          "activity": "Activity name",
          "type": "attraction|restaurant|activity|transport|free_time",
          "persona": "art|foodie|history|adventure",
          "budget": "budget|moderate|luxury"
        }
      }
    }
  ]
}
```

## 📊 **DATA FLOW**

### **1. Input Data (LLM-Ready):**
- **`tripPersonaLLM`** → Rich persona description ("Someone who is fascinated by the past...")
- **`tripBudgetLLM`** → Rich budget description ("mid-range traveler, looking for quality...")
- **`tripSpacingLLM`** → Rich spacing description ("likes a balanced itinerary...")
- **`selectedMetas`** → Array of meta attractions to include
- **`selectedSamples`** → Array of sample preferences for guidance

### **2. Angela Processing:**
- Uses persona profile to match activities
- Uses budget level to select appropriate options
- Uses spacing preferences to balance daily density
- Places 1 meta attraction per day
- Fills remaining blocks with restaurants and neat things
- Tags each activity with type, persona, and budget

### **3. Output Data:**
- **`rawText`** → Full JSON response from Angela
- **`structuredData`** → Parsed JSON with all tags
- **`parsedDays`** → Array of days with structured blocks

## 💾 **DATA STORAGE**

### **ItineraryDays Model (Source of Truth):**
```javascript
{
  tripId: ObjectId,
  userId: ObjectId,
  rawItineraryText: String, // Full Angela response
  parsedDays: [{
    dayIndex: Number,
    summary: String,
    blocks: {
      morning: {
        activity: String,    // "Visit the Louvre Museum"
        type: String,        // "attraction"
        persona: String,     // "art"
        budget: String       // "moderate"
      },
      afternoon: { /* same structure */ },
      evening: { /* same structure */ }
    }
  }]
}
```

### **TripCurrentDays Model (Live Trip):**
```javascript
{
  tripId: ObjectId,
  userId: ObjectId,
  currentDay: Number,
  days: [{
    dayIndex: Number,
    summary: String,
    blocks: {
      morning: String,    // Just activity name for frontend
      afternoon: String,  // Just activity name for frontend
      evening: String     // Just activity name for frontend
    },
    isComplete: Boolean,
    userModifications: [/* user changes */]
  }]
}
```

## 🎯 **KEY PRINCIPLES**

### **Clean Separation:**
- **Backend stores full tags** → For algorithms and analysis
- **Frontend gets clean data** → Just activity names for display
- **No word salad** → No "why" explanations cluttering the UI

### **Algorithm-Ready:**
- **Type tags** → Count restaurants vs attractions per day
- **Persona tags** → Track user preference patterns
- **Budget tags** → Analyze spending patterns
- **Meta tracking** → Ensure 1 meta per day rule

### **Structured Rules:**
- **1 meta attraction per day** → Hard rule
- **Mix up the order** → Flexible timing
- **Balance activities** → Restaurants, attractions, neat things
- **Respect spacing** → Relaxed/balanced/packed preferences

## 🔧 **SERVICE INTEGRATION**

### **itineraryGPTService.js:**
- Calls `getLLMReadyData()` for clean persona data
- Builds structured prompt with clear instructions
- Returns `{rawText, structuredData}`

### **itineraryRoutes.js:**
- Calls `generateItineraryFromMetaLogic()`
- Saves to `ItineraryDays` with full tags
- Creates `TripCurrentDays` with clean display data
- Uses `itinerarySaveService` for complex saving logic

### **itinerarySaveService.js:**
- Handles complex saving logic
- Manages both `ItineraryDays` and `TripCurrentDays`
- Ensures data consistency

## 🚀 **BENEFITS**

### **For Users:**
- Clean, readable itineraries
- No word salad or excessive explanations
- Day summaries provide context
- Flexible timing with structured rules

### **For Analysis:**
- Structured data for algorithms
- Persona preference tracking
- Budget pattern analysis
- Type distribution analysis

### **For Development:**
- Clean separation of concerns
- Algorithm-ready data structure
- Easy to extend with new tags
- Consistent data flow

## 📝 **EXAMPLE OUTPUT**

### **Angela Generates:**
```json
{
  "days": [
    {
      "dayIndex": 1,
      "summary": "Perfect for history lovers - explore Paris's rich cultural heritage",
      "blocks": {
        "morning": {
          "activity": "Visit the Louvre Museum",
          "type": "attraction",
          "persona": "art",
          "budget": "moderate"
        },
        "afternoon": {
          "activity": "Lunch at Le Comptoir du Relais",
          "type": "restaurant",
          "persona": "foodie",
          "budget": "moderate"
        },
        "evening": {
          "activity": "Seine River Cruise",
          "type": "activity",
          "persona": "history",
          "budget": "luxury"
        }
      }
    }
  ]
}
```

### **Frontend Displays:**
```
Day 1 – Monday, January 15
Summary: Perfect for history lovers - explore Paris's rich cultural heritage

Morning:
• Visit the Louvre Museum

Afternoon:
• Lunch at Le Comptoir du Relais

Evening:
• Seine River Cruise
```

### **Backend Stores:**
- Full structured data with all tags
- Ready for algorithm analysis
- Clean separation from frontend display

---

**This system provides clean user experience with powerful backend analysis capabilities!** 🎯