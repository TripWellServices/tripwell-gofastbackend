/**
 * WeightToPromptService - Bridges numeric weights to OpenAI prompt utilities
 * Converts our simple numeric system to rich prompt instructions for OpenAI
 */

const { 
  getBudgetWeightFromLevel, 
  getWhoWithWeightFromLevels, 
  getVibeWeightsFromPersonas,
  generatePromptFromWeights 
} = require('../../utils/numericWeightUtils');


/**
 * Generate comprehensive OpenAI prompt from user weights
 * @param {Object} userProfile - Complete user profile with weights
 * @returns {Object} Prompt data for OpenAI
 */
function generateOpenAIPrompt(userProfile) {
  const {
    // From ProfileSetup
    personaWeights = { art: 0.1, foodie: 0.1, adventure: 0.1, history: 0.1 },
    planningFlex = 0.5,
    
    // From TripSetup  
    whoWith = "solo",
    romanceLevel = 0.0,
    caretakerRole = 0.0,
    flexibility = 0.5,
    
    // From TripPersona
    primaryPersona = "art",
    budget = 150,
    budgetLevel = 0.5,
    dailySpacing = 0.5,
    
    // Trip context
    city = "Paris",
    season = "spring",
    purpose = "vacation"
  } = userProfile;

  // Use our numeric weight utils to generate the prompt
  const weights = {
    personaWeights,
    budgetLevel,
    romanceLevel,
    caretakerRole,
    flexibility,
    whoWith,
    dailySpacing
  };

  const promptSection = generatePromptFromWeights(weights);

  // Build comprehensive prompt
  const fullPrompt = `
**Trip Context:**
- Destination: ${city}
- Season: ${season}
- Purpose: ${purpose}
- Budget: $${budget}/day
- Daily Pace: ${dailySpacing <= 0.3 ? 'Light' : dailySpacing <= 0.7 ? 'Moderate' : 'Packed'}

**User Profile:**
- Primary Interest: ${primaryPersona} (${personaWeights[primaryPersona] || 0.1} weight)
- Planning Style: ${planningFlex <= 0.3 ? 'Rigid' : planningFlex <= 0.7 ? 'Flow' : 'Spontaneous'}

${promptSection}

**Instructions:**
Generate a personalized itinerary that balances all these preferences while avoiding obvious tourist traps. Focus on the primary persona (${primaryPersona}) but include variety based on the other weights.
`;

  return {
    fullPrompt,
    metadata: {
      budgetLevel,
      whoWith,
      primaryPersona,
      planningFlex,
      dailySpacing,
      personaWeights
    }
  };
}

/**
 * Generate user segmentation data for analytics/advertising
 * @param {Object} userProfile - Complete user profile with weights
 * @returns {Object} Segmentation data
 */
function generateUserSegmentation(userProfile) {
  const {
    personaWeights = {},
    budgetLevel = 0.5,
    romanceLevel = 0.0,
    caretakerRole = 0.0,
    planningFlex = 0.5,
    dailySpacing = 0.5
  } = userProfile;

  // Budget segmentation
  let budgetSegment = "budget";
  if (budgetLevel > 0.7) budgetSegment = "luxury";
  else if (budgetLevel > 0.5) budgetSegment = "mid-range";
  else if (budgetLevel > 0.3) budgetSegment = "moderate";

  // Persona segmentation
  const primaryPersona = Object.keys(personaWeights).reduce((a, b) => 
    personaWeights[a] > personaWeights[b] ? a : b
  );

  // Travel style segmentation
  let travelStyle = "balanced";
  if (romanceLevel > 0.7) travelStyle = "romantic";
  else if (caretakerRole > 0.7) travelStyle = "family";
  else if (planningFlex < 0.3) travelStyle = "structured";
  else if (planningFlex > 0.7) travelStyle = "spontaneous";

  // Activity level segmentation
  let activityLevel = "moderate";
  if (dailySpacing > 0.7) activityLevel = "high";
  else if (dailySpacing < 0.3) activityLevel = "low";

  return {
    budgetSegment,
    primaryPersona,
    travelStyle,
    activityLevel,
    isHighValue: budgetLevel > 0.7,
    isFamilyTraveler: caretakerRole > 0.5,
    isRomanticTraveler: romanceLevel > 0.5,
    isSpontaneousTraveler: planningFlex > 0.7,
    isStructuredTraveler: planningFlex < 0.3
  };
}

module.exports = {
  generateOpenAIPrompt,
  generateUserSegmentation
};
