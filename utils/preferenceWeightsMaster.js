/**
 * PreferenceWeightsMaster - Combines all preference weights into comprehensive prompt instructions
 * This is the main utility that builds the complete prompt based on user preferences
 */

const { generateWhoWithPrompt } = require('./whoWithWeights');
const { generatePrioritiesPrompt, getContentTypesForPriorities } = require('./prioritiesWeights');
const { generateVibesPrompt, getActivityLevelFromVibes } = require('./vibesWeights');
const { generateBudgetPrompt, getPriceRange } = require('./budgetWeights');
const { generateTravelPacePrompt, getActivitiesPerDay } = require('./travelPaceWeights');

/**
 * Generate comprehensive prompt instructions from user preferences
 * @param {Object} inputVariables - User preference object
 * @returns {Object} Complete prompt instructions and metadata
 */
function generatePreferencePrompt(inputVariables) {
  const {
    city,
    season,
    whoWith,
    priorities = [],
    vibes = [],
    mobility = [],
    travelPace = [],
    budget = ""
  } = inputVariables;

  // Generate individual weight prompts
  const whoWithPrompt = generateWhoWithPrompt(whoWith);
  const prioritiesPrompt = generatePrioritiesPrompt(priorities);
  const vibesPrompt = generateVibesPrompt(vibes);
  const budgetPrompt = generateBudgetPrompt(budget);
  const travelPacePrompt = generateTravelPacePrompt(travelPace);

  // Get metadata for additional context
  const contentTypes = getContentTypesForPriorities(priorities);
  const activityLevel = getActivityLevelFromVibes(vibes);
  const priceRange = getPriceRange(budget);
  const activitiesPerDay = getActivitiesPerDay(travelPace);

  // Build comprehensive prompt
  const fullPrompt = `
**Trip Context:**
- Destination: ${city}
- Season: ${season}
- Travel Companion: ${whoWith}
- Budget Level: ${priceRange}
- Activity Level: ${activityLevel}
- Daily Activities: ${activitiesPerDay}

${whoWithPrompt}

${prioritiesPrompt}

${vibesPrompt}

${budgetPrompt}

${travelPacePrompt}

**Mobility Considerations:**
${mobility.map(m => `- ${m}`).join('\n')}

**Content Focus Areas:**
${contentTypes.map(type => `- ${type}`).join('\n')}
`.trim();

  return {
    fullPrompt,
    metadata: {
      city,
      season,
      whoWith,
      priorities,
      vibes,
      mobility,
      travelPace,
      budget,
      contentTypes,
      activityLevel,
      priceRange,
      activitiesPerDay
    }
  };
}

/**
 * Generate a focused prompt for specific content types
 * @param {Object} inputVariables - User preference object
 * @param {string} contentType - Specific content type (attractions, restaurants, mustSee, mustDo)
 * @returns {string} Focused prompt for the content type
 */
function generateFocusedPrompt(inputVariables, contentType) {
  const { fullPrompt, metadata } = generatePreferencePrompt(inputVariables);
  
  const contentTypeInstructions = {
    attractions: "Focus on attractions, landmarks, and points of interest that match the user's preferences",
    restaurants: "Focus on dining experiences, restaurants, and food-related venues that match the user's preferences",
    mustSee: "Focus on must-see experiences, hidden gems, and unique local spots that match the user's preferences",
    mustDo: "Focus on activities, experiences, and things to do that match the user's preferences"
  };

  const focusInstruction = contentTypeInstructions[contentType] || "Focus on experiences that match the user's preferences";

  return `${fullPrompt}

**Content Type Focus:**
${focusInstruction}

**Important:** Each recommendation should include:
- Name and description
- Location/address
- Cost/price range
- Why this matches the user's specific preferences (whoWith, priorities, vibes, budget, travel pace)
- Any special considerations for the user's mobility preferences
`.trim();
}

/**
 * Generate meta attractions avoidance prompt
 * @param {Object} inputVariables - User preference object
 * @param {Array} metaAttractions - Array of meta attractions to avoid
 * @returns {string} Prompt for avoiding meta attractions
 */
function generateMetaAvoidancePrompt(inputVariables, metaAttractions) {
  const { fullPrompt } = generatePreferencePrompt(inputVariables);
  
  const metaList = metaAttractions.map(attraction => 
    `- ${attraction.name} (${attraction.type}): ${attraction.reason}`
  ).join('\n');

  return `${fullPrompt}

**CRITICAL: Avoid These Generic Tourist Attractions:**
${metaList}

**Instead, focus on:**
- Unique, local, and authentic experiences
- Hidden gems and off-the-beaten-path locations
- Personalized recommendations that match the user's specific preferences
- Local favorites and insider spots
- Experiences that create lasting memories

**Each recommendation must:**
- Be different from the generic attractions listed above
- Match the user's specific preferences and travel style
- Include a compelling "why choose this" explanation
- Be personalized to their whoWith, priorities, vibes, budget, and travel pace
`.trim();
}

module.exports = {
  generatePreferencePrompt,
  generateFocusedPrompt,
  generateMetaAvoidancePrompt
};
