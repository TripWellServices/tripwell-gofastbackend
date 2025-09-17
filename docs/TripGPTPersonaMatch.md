# TripGPT Persona Match System

## 🎯 **The Vision**
Build a hybrid AI + data-driven persona system that learns from user behavior and adapts recommendations in real-time.

## 🧠 **The Core Concept**
- **Frontend:** Simple radio buttons (user-friendly)
- **Backend:** Secret persona weights (0.6 for primary, 0.1 for others)
- **OpenAI Service:** Updates weights based on user sample selections
- **Data Collection:** Python analysis to refine weights over time

## 🚀 **The Roadmap**

### **1. Frontend Refactor**
**File:** `TripIntentForm.jsx`
- **Slim down** to 4 categories (Art, Foodie, Adventure, History)
- **Remove:** Vibes, complex mobility options
- **Add:** Simple radio buttons for persona selection
- **Add:** Budget selection (Low, Moderate, High)
- **Add:** Who With selection (Solo, Couple, Family, Friends)
- **Add:** Romance Level slider (0.0 to 1.0)
- **Add:** Caretaker Role slider (0.0 to 1.0)
- **Add:** Flexibility slider (0.7 free/spontaneous, 0.2 locked/rigid)

### **2. Backend Model Refactor**
**File:** `TripIntent.js` → `TripPersona.js`
- **Rename** TripIntent model to TripPersona
- **Add persona weights:** `{art: 0.6, foodie: 0.1, adventure: 0.1, history: 0.1}`
- **Add budget weight:** `0.3` (low), `0.5` (moderate), `1.0` (high)
- **Add romance level:** `0.0` to `1.0`
- **Add caretaker role:** `0.0` to `1.0`
- **Add flexibility:** `0.7` (free/spontaneous), `0.2` (locked/rigid)
- **Add who with:** `solo`, `couple`, `family`, `friends`

### **3. Meta Layer (New)**
**File:** `TripMetaSelects.js` (replaces TripAnchors)
- **Generate meta attractions** for each city (obvious tourist traps)
- **Store in library** by city_id
- **Avoid in recommendations** (anti-recommendations)

### **4. Sample Layer (New)**
**File:** `TripPersonaSample.jsx`
- **Algo-based selection:** 2 attractions + 2 restaurants + 2 neat things
- **Tag each sample** based on trip persona
- **Present to user** for selection
- **Track selections** for weight updates

### **5. Weight Update Service (New)**
**File:** `TripPersonaSampleService.js`
- **OpenAI call:** "User picked these samples, update weights"
- **Analyze behavior:** What they actually chose vs what we predicted
- **Update weights:** Adjust persona weights based on real behavior
- **Return new weights:** Updated persona profile

### **6. Itinerary Build Integration**
**File:** `ItineraryBuild.js`
- **Include persona weights** in itinerary generation
- **Include meta avoidance** (don't recommend obvious tourist traps)
- **Include sample integration** (use selected samples in itinerary)
- **Include "why" explanations** (why this recommendation based on persona)

## 🎭 **The 4 Personas**

### **Art & Culture**
- Museums, galleries, cultural experiences
- Street art, public installations
- Cultural events, festivals

### **Food & Dining**
- Restaurants, food tours, culinary experiences
- Food markets, cooking classes
- Wine tastings, food festivals

### **Adventure & Outdoor**
- Hiking, outdoor activities, adventure sports
- Nature reserves, parks
- Adventure tours, extreme sports

### **History & Heritage**
- Historical sites, cultural heritage
- Heritage tours, monuments
- Cultural landmarks, ancient sites

## 🧮 **The Weight System**

### **Default Weights (User Picks Primary)**
```javascript
const defaultWeights = {
  art: 0.1,      // Default
  foodie: 0.1,   // Default
  adventure: 0.1, // Default
  history: 0.1   // Default
};

// User picks "Art" → Update to:
const updatedWeights = {
  art: 0.6,      // What they picked
  foodie: 0.1,   // Others stay 0.1
  adventure: 0.1, // Others stay 0.1
  history: 0.1   // Others stay 0.1
};
```

### **Budget Weights**
```javascript
const budgetWeights = {
  low: 0.3,      // $50-100/day
  moderate: 0.5, // $100-200/day
  high: 1.0      // $200+/day
};
```

### **Other Weights**
```javascript
const otherWeights = {
  romanceLevel: 0.0,    // 0.0 to 1.0
  caretakerRole: 0.0,   // 0.0 to 1.0
  flexibility: 0.7      // 0.7 free/spontaneous, 0.2 locked/rigid
};
```

## 🤖 **The OpenAI Weight Update Service**

### **Prompt Template**
```
User originally picked: {primaryPersona} (0.6), others (0.1)
User then selected these samples: {selectedSamples}

Based on their actual choices, what should the new weights be?
Consider:
- Did they choose more diverse options than expected?
- Did they avoid their primary persona?
- Did they show interest in other areas?

Return JSON: {art: X, foodie: Y, adventure: Z, history: W}
```

### **Service Function**
```javascript
const updatePersonaWeights = async (userPicks, currentWeights) => {
  const prompt = buildWeightUpdatePrompt(userPicks, currentWeights);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });
  
  return JSON.parse(response.choices[0].message.content);
};
```

## 📊 **The Data Collection**

### **What We Track**
- User persona selections
- Sample selections
- Weight updates
- Recommendation accuracy
- User satisfaction

### **Python Analysis (Future)**
- Analyze user behavior patterns
- Refine weight update algorithms
- Build data-driven persona profiles
- Replace OpenAI with ML models

## 🎯 **The Flow**

1. **User fills form** → **Simple radio buttons**
2. **Backend creates persona** → **Default weights (0.6, 0.1, 0.1, 0.1)**
3. **System generates meta attractions** → **Obvious tourist traps to avoid**
4. **System generates samples** → **2 attractions + 2 restaurants + 2 neat things**
5. **User selects samples** → **OpenAI updates weights**
6. **System builds itinerary** → **Based on updated weights + meta avoidance**
7. **Collect data** → **For future Python analysis**

## 🚀 **The End Goal**

Build the **Amazon of Travel Recommendations** - a system that learns from user behavior and gets better over time, providing hyper-personalized travel experiences that evolve with each interaction.

---

**Next Steps:**
1. Refactor `TripIntentForm.jsx` (slim down, radio buttons)
2. Create `TripPersona.js` model (weighted system)
3. Build `TripMetaSelects.js` (meta attractions library)
4. Create `TripPersonaSample.jsx` (sample selection)
5. Build `TripPersonaSampleService.js` (OpenAI weight updates)
6. Integrate with itinerary build
