// services/tripPersonaConverterService.js
const TripPersona = require("../models/TripWell/TripPersona");

/*
  TripPersonaConverter Service
  
  ✅ Converts weights back to descriptive words based on ranges
  ✅ Bridges the gap between raw weights (numbers) and human descriptions (words)
  ✅ Future self: art 0.7 = "artsy dude, loves to shop"
  ✅ Clean data for Python or direct OpenAI calls
*/

const convertPersonaWeightsToWords = (personaWeights) => {
  const descriptions = {};
  
  // Art weight ranges
  if (personaWeights.art >= 0.7) {
    descriptions.art = "artsy dude, loves to shop";
  } else if (personaWeights.art >= 0.5) {
    descriptions.art = "appreciates art and culture";
  } else if (personaWeights.art >= 0.3) {
    descriptions.art = "enjoys some cultural activities";
  } else {
    descriptions.art = "not particularly artsy";
  }
  
  // Food weight ranges
  if (personaWeights.foodie >= 0.7) {
    descriptions.foodie = "food obsessed, will travel for meals";
  } else if (personaWeights.foodie >= 0.5) {
    descriptions.foodie = "loves trying new restaurants";
  } else if (personaWeights.foodie >= 0.3) {
    descriptions.foodie = "enjoys good food";
  } else {
    descriptions.foodie = "not particularly foodie";
  }
  
  // Adventure weight ranges
  if (personaWeights.adventure >= 0.7) {
    descriptions.adventure = "thrill seeker, loves extreme activities";
  } else if (personaWeights.adventure >= 0.5) {
    descriptions.adventure = "enjoys outdoor adventures";
  } else if (personaWeights.adventure >= 0.3) {
    descriptions.adventure = "likes some adventure";
  } else {
    descriptions.adventure = "not particularly adventurous";
  }
  
  // History weight ranges
  if (personaWeights.history >= 0.7) {
    descriptions.history = "history buff, loves museums and historical sites";
  } else if (personaWeights.history >= 0.5) {
    descriptions.history = "appreciates history and culture";
  } else if (personaWeights.history >= 0.3) {
    descriptions.history = "enjoys some historical activities";
  } else {
    descriptions.history = "not particularly interested in history";
  }
  
  return descriptions;
};

const convertBudgetLevelToWords = (budgetLevel) => {
  if (budgetLevel >= 0.8) return "luxury";
  if (budgetLevel >= 0.6) return "upscale";
  if (budgetLevel >= 0.4) return "moderate";
  return "budget";
};

const convertSpacingWeightsToWords = (spacingWeights) => {
  if (spacingWeights.relaxed >= 0.5) return "relaxed, takes it slow";
  if (spacingWeights.packed >= 0.5) return "packed schedule, wants to see everything";
  return "balanced, mix of activities and downtime";
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
  convertPersonaWeightsToWords,
  convertBudgetLevelToWords,
  convertSpacingWeightsToWords,
  convertTripPersonaToWords,
  buildOpenAIPrompt
};
