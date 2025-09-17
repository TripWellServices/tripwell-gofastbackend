/**
 * PrioritiesWeights - Converts priority preferences into prompt instructions
 * Each priority provides specific guidance for content generation
 */

const prioritiesWeights = {
  "Culture & History": {
    weight: 1.0,
    promptInstructions: [
      "Focus on museums, historical sites, and cultural landmarks",
      "Include guided tours and educational experiences",
      "Prioritize UNESCO World Heritage sites and significant monuments",
      "Consider local cultural events, festivals, and traditions"
    ],
    avoidInstructions: [
      "Avoid purely recreational or entertainment-focused activities",
      "Skip modern commercial attractions without cultural significance"
    ],
    contentTypes: ["museums", "historical_sites", "cultural_landmarks", "guided_tours"],
    timeAllocation: "Allocate 60-70% of time to cultural and historical experiences"
  },

  "Food & Dining": {
    weight: 1.0,
    promptInstructions: [
      "Focus on local cuisine, food markets, and culinary experiences",
      "Include cooking classes, food tours, and authentic restaurants",
      "Prioritize local specialties and traditional dishes",
      "Consider food festivals, wine tastings, and culinary workshops"
    ],
    avoidInstructions: [
      "Avoid chain restaurants and tourist trap dining",
      "Skip generic international cuisine over local specialties"
    ],
    contentTypes: ["restaurants", "food_markets", "cooking_classes", "food_tours"],
    timeAllocation: "Allocate 40-50% of time to food and dining experiences"
  },

  "Adventure & Outdoor": {
    weight: 1.0,
    promptInstructions: [
      "Focus on outdoor activities, hiking, and adventure sports",
      "Include nature reserves, parks, and outdoor recreation",
      "Prioritize active experiences and physical challenges",
      "Consider seasonal outdoor activities and adventure tours"
    ],
    avoidInstructions: [
      "Avoid indoor-only or sedentary activities",
      "Skip activities that don't involve physical engagement"
    ],
    contentTypes: ["hiking", "outdoor_activities", "adventure_sports", "nature_reserves"],
    timeAllocation: "Allocate 50-60% of time to outdoor and adventure activities"
  },

  "Relaxation & Wellness": {
    weight: 1.0,
    promptInstructions: [
      "Focus on spas, wellness centers, and relaxation activities",
      "Include meditation spots, yoga classes, and peaceful locations",
      "Prioritize stress-free environments and calming experiences",
      "Consider wellness retreats and therapeutic activities"
    ],
    avoidInstructions: [
      "Avoid crowded, noisy, or high-stress environments",
      "Skip activities that require high energy or physical exertion"
    ],
    contentTypes: ["spas", "wellness_centers", "meditation_spots", "peaceful_locations"],
    timeAllocation: "Allocate 40-50% of time to relaxation and wellness activities"
  },

  "Shopping & Markets": {
    weight: 1.0,
    promptInstructions: [
      "Focus on local markets, artisan shops, and unique shopping experiences",
      "Include vintage stores, local crafts, and authentic souvenirs",
      "Prioritize local artisans and traditional crafts",
      "Consider market tours and shopping districts"
    ],
    avoidInstructions: [
      "Avoid generic shopping malls and tourist souvenir shops",
      "Skip chain stores and commercial shopping centers"
    ],
    contentTypes: ["local_markets", "artisan_shops", "vintage_stores", "craft_workshops"],
    timeAllocation: "Allocate 30-40% of time to shopping and market experiences"
  },

  "Nightlife & Fun": {
    weight: 1.0,
    promptInstructions: [
      "Focus on bars, clubs, and evening entertainment venues",
      "Include live music, cultural performances, and night markets",
      "Prioritize local nightlife and entertainment districts",
      "Consider evening tours and nighttime activities"
    ],
    avoidInstructions: [
      "Avoid early morning or daytime-only activities",
      "Skip venues that close early or don't have evening programs"
    ],
    contentTypes: ["bars", "clubs", "live_music", "night_markets"],
    timeAllocation: "Allocate 30-40% of time to nightlife and evening entertainment"
  }
};

/**
 * Get weight instructions for priority preferences
 * @param {Array} priorities - Array of priority preferences
 * @returns {Array} Weight instructions for each priority
 */
function getPrioritiesWeights(priorities) {
  if (!priorities || !Array.isArray(priorities)) return [];
  
  return priorities.map(priority => 
    prioritiesWeights[priority] || { weight: 0.5, promptInstructions: [] }
  );
}

/**
 * Generate prompt instructions for priority preferences
 * @param {Array} priorities - Array of priority preferences
 * @returns {string} Formatted prompt instructions
 */
function generatePrioritiesPrompt(priorities) {
  if (!priorities || priorities.length === 0) {
    return "**Priorities:** General exploration and discovery";
  }
  
  const weights = getPrioritiesWeights(priorities);
  
  let prompt = `**Priority Focus Areas:**\n`;
  
  weights.forEach((weight, index) => {
    if (weight.promptInstructions.length > 0) {
      prompt += `\n**${priorities[index]}:**\n`;
      prompt += weight.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
      if (weight.timeAllocation) {
        prompt += `\n- ${weight.timeAllocation}`;
      }
    }
  });
  
  return prompt;
}

/**
 * Get content types to prioritize based on priorities
 * @param {Array} priorities - Array of priority preferences
 * @returns {Array} Content types to focus on
 */
function getContentTypesForPriorities(priorities) {
  const weights = getPrioritiesWeights(priorities);
  const contentTypes = new Set();
  
  weights.forEach(weight => {
    if (weight.contentTypes) {
      weight.contentTypes.forEach(type => contentTypes.add(type));
    }
  });
  
  return Array.from(contentTypes);
}

module.exports = {
  prioritiesWeights,
  getPrioritiesWeights,
  generatePrioritiesPrompt,
  getContentTypesForPriorities
};
