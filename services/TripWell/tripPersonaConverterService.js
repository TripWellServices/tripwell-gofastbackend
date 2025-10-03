// services/tripPersonaConverterService.js
const TripPersona = require("../../models/TripWell/TripPersona");
const TripLLMReady = require("../../models/TripWell/TripLLMReady");
const TripBase = require("../../models/TripWell/TripBase");

/*
  TripPersonaConverter Service
  
  ✅ Gets TOLD what persona to convert (doesn't figure it out itself!)
  ✅ Converts specific persona to descriptive words
  ✅ Converts budget level to words
  ✅ Clean data for OpenAI calls
  ✅ Simple and focused - just converts what it's told
*/

// Hardcoded persona definitions (mad libs style)
const personaMadLibs = {
  art: "Someone who appreciates visual beauty, creativity, and cultural expression. They prefer selections that showcase local art, galleries, museums, and creative spaces.",
  foodie: "Someone who loves culinary experiences, local flavors, and food culture. They prefer selections that highlight local cuisine, food markets, cooking experiences, and dining culture.",
  history: "Someone who is fascinated by the past, heritage, and historical significance. They prefer selections that explore historical sites, museums, heritage locations, and cultural history.",
  adventure: "Someone who seeks excitement, outdoor activities, and adrenaline experiences. They prefer selections that offer outdoor adventures, physical activities, and thrilling experiences."
};

// Convert specific persona to words (gets TOLD what to convert)
const convertPersonaToWords = (persona, budgetLevel, dailySpacing) => {
  console.log(`🔄 Converting persona "${persona}" to words`);
  
  const personaDescription = personaMadLibs[persona] || "Someone with diverse interests and preferences.";
  const budgetDescription = convertBudgetLevelToWords(budgetLevel);
  const spacingDescription = convertSpacingToWords(dailySpacing);
  
  return {
    persona: personaDescription,
    budget: budgetDescription,
    spacing: spacingDescription,
    dominantPersona: persona
  };
};

const convertBudgetLevelToWords = (budgetLevel) => {
  if (budgetLevel >= 0.8) return "luxury traveler, seeking premium experiences and fine dining";
  if (budgetLevel >= 0.6) return "mid-range traveler, looking for quality experiences without excessive spending";
  if (budgetLevel >= 0.4) return "budget-conscious traveler, seeking value and affordable options";
  return "very budget-focused traveler, prioritizing cost-effective choices";
};

// Convert budget category to words (gets TOLD what to convert)
const convertBudgetCategoryToWords = (budgetCategory) => {
  console.log(`🔄 Converting budget category "${budgetCategory}" to words`);
  
  const budgetDescriptions = {
    Budget: "budget-conscious traveler, seeking value and affordable options",
    Moderate: "mid-range traveler, looking for quality experiences without excessive spending", 
    Luxury: "luxury traveler, seeking premium experiences and fine dining"
  };
  
  return budgetDescriptions[budgetCategory] || "traveler with flexible budget preferences";
};

const convertSpacingToWords = (dailySpacing) => {
  if (dailySpacing >= 0.7) return "prefers a packed itinerary with lots of activities";
  if (dailySpacing >= 0.5) return "likes a balanced itinerary with a good mix of activities and relaxation";
  if (dailySpacing >= 0.3) return "prefers a relaxed pace with plenty of downtime";
  return "enjoys a very slow pace with minimal planned activities";
};

// Convert budget to words (gets TOLD what to convert)
const convertBudgetToWords = (budgetLevel) => {
  console.log(`🔄 Converting budget level ${budgetLevel} to words`);
  return convertBudgetLevelToWords(budgetLevel);
};

const convertTripPersonaToWords = async (tripId, userId) => {
  try {
    console.log(`🔄 Converting trip persona weights to words for trip ${tripId}`);
    
    const tripPersona = await TripPersona.findOne({ tripId, userId });
    if (!tripPersona) {
      throw new Error(`TripPersona not found for trip ${tripId}`);
    }
    
    const personaDescriptions = convertPersonaWeightsToWords(tripPersona.personaWeights);
    const budgetDescription = convertBudgetLevelToWords(tripPersona.budgetLevel);
    const spacingDescription = convertSpacingWeightsToWords(tripPersona.spacingWeights);
    
    const wordedPersona = {
      persona: personaDescriptions,
      budget: budgetDescription,
      spacing: spacingDescription,
      primaryPersona: tripPersona.primaryPersona,
      budget: tripPersona.budget,
      dailySpacing: tripPersona.dailySpacing
    };
    
    console.log(`✅ Converted trip persona to words:`, wordedPersona);
    
    return wordedPersona;
    
  } catch (error) {
    console.error(`❌ Error converting trip persona to words for trip ${tripId}:`, error);
    throw error;
  }
};

const buildOpenAIPrompt = async (tripId, userId, city, season, purpose) => {
  try {
    console.log(`🤖 Building OpenAI prompt for trip ${tripId} in ${city}`);
    
    const wordedPersona = await convertTripPersonaToWords(tripId, userId);
    const tripPersona = await TripPersona.findOne({ tripId, userId });
    
    const prompt = `**Trip Context:**
- Destination: ${city}
- Season: ${season}
- Purpose: ${purpose}
- Budget: $${tripPersona.budget}/day (${wordedPersona.budget})

**User Persona:**
${wordedPersona.persona.art}
${wordedPersona.persona.foodie}
${wordedPersona.persona.adventure}
${wordedPersona.persona.history}

**Travel Style:**
${wordedPersona.spacing}

**Instructions:**
Generate exactly 6 curated samples for ${city} based on the user's persona:

1. 2 Attractions (tagged by persona)
2. 2 Restaurants (tagged by persona) 
3. 2 Neat Things (not meta attractions, tagged by persona)

Return a JSON object with this exact structure:
{
  "attractions": [
    {
      "id": "attr_1",
      "name": "Attraction Name",
      "description": "Brief description"
    }
  ],
  "restaurants": [
    {
      "id": "rest_1", 
      "name": "Restaurant Name",
      "description": "Brief description"
    }
  ],
  "neatThings": [
    {
      "id": "neat_1",
      "name": "Neat Thing Name", 
      "description": "Brief description"
    }
  ]
}

Rules:
- Focus on the user's persona preferences but don't include these tags in the response
- Consider budget level (${wordedPersona.budget}) but don't include budget tags in the response
- Avoid obvious tourist attractions (those are handled separately)
- Consider budget level, who they're traveling with, season, and trip purpose
- Make descriptions engaging but brief - focus on what makes each place special
- Ensure variety across the 6 samples
- Consider seasonal appropriateness (${season})
- Keep the response clean - only include name and description for the user

Return only the JSON object. No explanations, markdown, or extra commentary.`;

    console.log(`✅ OpenAI prompt built for trip ${tripId}`);
    
    return {
      prompt,
      wordedPersona,
      metadata: {
        tripId,
        userId,
        city,
        season,
        purpose,
        budget: tripPersona.budget,
        primaryPersona: tripPersona.primaryPersona
      }
    };
    
  } catch (error) {
    console.error(`❌ Error building OpenAI prompt for trip ${tripId}:`, error);
    throw error;
  }
};

module.exports = {
  convertPersonaToWords,
  convertBudgetToWords,
  convertBudgetLevelToWords,
  convertSpacingToWords,
  convertTripPersonaToWords,
  buildOpenAIPrompt
};
