# TripWell Itinerary Generation Routes

This folder contains all TripWell itinerary generation API routes. Each route file handles specific functionality for generating personalized trip itineraries.

## Itinerary Generation Routes (Modular Architecture)

### itineraryGPTRoute.js
- **Endpoint**: `POST /Tripwell/itinerary-gpt`
- **Purpose**: Calls GPT to generate personalized itinerary based on user preferences
- **Input**: `{ 
    city: "Paris", 
    season: "Spring",
    daysTotal: 5,
    priorities: ["Culture & History", "Food & Dining"],
    vibes: ["Romantic & Intimate"],
    mobility: ["Love walking everywhere"],
    travelPace: ["Slow & Relaxed"],
    budget: "$200-300/day",
    whoWith: "spouse",
    purpose: "Anniversary trip"
  }`
- **Action**: Calls GPT with Angela prompt for itinerary generation
- **Response**: `{ status: "ok", city: "Paris", rawItinerary: "..." }`

### itineraryParserRoute.js
- **Endpoint**: `POST /Tripwell/itinerary-parser`
- **Purpose**: Parses and validates GPT itinerary response
- **Input**: `{ rawItinerary: "..." }`
- **Action**: 
  - Parses structured itinerary (Day 1, Day 2, etc.)
  - Validates required sections (Morning, Afternoon, Evening)
  - Extracts activities, locations, and timing
  - Returns clean itinerary data
- **Response**: `{ status: "ok", itineraryData: {...} }`

### itinerarySaveRoute.js
- **Endpoint**: `POST /Tripwell/itinerary-save`
- **Purpose**: Saves parsed itinerary to user's trip data
- **Input**: `{ 
    tripId: "ObjectId",
    userId: "ObjectId", 
    itineraryData: {...}
  }`
- **Action**: 
  - Saves to main `GoFastFamily` database
  - Updates `TripItinerary` collection
  - Links to user's trip and intent data
- **Response**: `{ status: "ok", tripId: "ObjectId", itineraryId: "ObjectId" }`

## Services

### itineraryGPTService.js
- **Location**: `services/TripWell/`
- **Purpose**: Handles GPT prompt building and API calls
- **Functions**: `buildItineraryPrompt()`, `generateItinerary()`

### itineraryParserService.js
- **Location**: `services/TripWell/`
- **Purpose**: Handles parsing and validation logic
- **Functions**: `parseItinerary()`, `validateItinerary()`, `extractActivities()`

## Database Structure

### GoFastFamily Database
Collections:
- `TripItinerary` - Generated itineraries with tripId, userId, createdAt
- `TripIntent` - User preferences (existing)
- `TripBase` - Trip details (existing)

Itinerary documents include:
- `tripId`: Reference to TripBase
- `userId`: Reference to TripWellUser
- `itineraryData`: Structured daily activities
- `generatedAt`: Timestamp
- `angelaVersion`: GPT model version used

## Usage Notes

- Routes use existing mongoose connection to main database
- OpenAI integration via existing config
- Error handling returns `{ status: "error", message }` format
- Itinerary generation is personalized based on user's TripIntent data
- Supports different trip lengths, seasons, and user preferences

## Integration Points

- **TripIntent Form**: Provides user preferences (priorities, vibes, mobility, budget)
- **TripBase Data**: Provides trip details (city, season, duration, companions)
- **Angela AI**: Uses both data sources to generate personalized itineraries
- **Content Library**: Can reference city-specific POIs, restaurants, transportation

## 🧠 **BIG VISION: Building Our Own Brain**

### **Two-Tier Content Strategy:**

#### **1. City Data Call (Ancillary):**
- **Generic city data** - POIs, restaurants, transportation
- **Good for website/SEO** - General city information
- **Agnostic content** - Not tied to any user profile
- **Foundation layer** - Base content for any city

#### **2. Profile-Driven Content (Primary):**
- **Personalized content** - Based on user preferences
- **Tests Angela's algorithm** - How she selects for different profiles
- **User-specific** - Budget, family, mobility, etc.

### **The Evolution Path:**
1. **Now**: GPT generates profile-specific content
2. **Learn**: See what Angela selects for different profiles
3. **Tag**: Tag POIs with profile attributes (family, budget, mobility)
4. **Build**: Python brain with "if this then this" logic
5. **Replace**: GPT calls with smart tag matching

### **Future Reverse Engineering:**
- **Tag POIs with profile attributes** - Family-friendly, Budget, Mobility
- **Create hybrid system** - Generic POIs + profile tags
- **Standard approach** - Any POI can be tagged with user preferences
- **Scalable** - One POI can serve multiple profile types

### **Python Brain Logic:**
```python
# "If This Then This" Logic
if user_profile.budget == "budget" and user_profile.mobility == "walking":
    then recommend: free_attractions + walking_distance_restaurants

if user_profile.whoWith == "family" and user_profile.priorities == "culture":
    then recommend: kid_friendly_museums + family_restaurants

if user_profile.vibes == "romantic" and user_profile.budget == "luxury":
    then recommend: upscale_restaurants + romantic_attractions
```

### **The Goal:**
- **Learn from Angela** - See what she selects for different profiles
- **Build our own intelligence** - Python brain with tag matching
- **Faster, cheaper, more predictable** - No more GPT calls for content selection
- **Hybrid system** - Both generic city data and personalized content
