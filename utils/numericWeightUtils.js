/**
 * NumericWeightUtils - Updated utils that work with our numeric weight system
 * Bridges numeric weights to OpenAI prompt instructions
 */

/**
 * Convert numeric budgetLevel to budget category for prompts
 * @param {number} budgetLevel - Numeric budget level (0.3, 0.5, 0.7, 1.0)
 * @returns {Object} Budget weight instructions
 */
function getBudgetWeightFromLevel(budgetLevel) {
  if (budgetLevel <= 0.3) {
    return {
      weight: 0.3,
      promptInstructions: [
        "Focus on free and low-cost activities and experiences",
        "Include public parks, free museums, and budget-friendly dining",
        "Prioritize walking tours, free attractions, and local markets",
        "Consider student discounts, free events, and community activities"
      ],
      avoidInstructions: [
        "Avoid expensive restaurants, luxury venues, and high-cost activities",
        "Skip premium experiences and exclusive access"
      ],
      priceRange: "$0-100 per day",
      diningFocus: "Street food, local cafes, and budget-friendly restaurants",
      activityFocus: "Free attractions, walking tours, and public spaces"
    };
  } else if (budgetLevel <= 0.5) {
    return {
      weight: 0.5,
      promptInstructions: [
        "Focus on moderate-cost activities with good value",
        "Include mid-range restaurants, paid attractions, and guided tours",
        "Prioritize quality experiences that balance cost and value",
        "Consider museum passes, activity bundles, and group discounts"
      ],
      avoidInstructions: [
        "Avoid both very expensive and very cheap options",
        "Skip luxury experiences and free-only activities"
      ],
      priceRange: "$100-200 per day",
      diningFocus: "Mid-range restaurants, local favorites, and quality cafes",
      activityFocus: "Paid attractions, guided tours, and quality experiences"
    };
  } else if (budgetLevel <= 0.7) {
    return {
      weight: 0.7,
      promptInstructions: [
        "Focus on high-value, quality experiences",
        "Include upscale restaurants, premium attractions, and curated experiences",
        "Prioritize memorable experiences worth the investment",
        "Consider private tours, special access, and unique venues"
      ],
      avoidInstructions: [
        "Avoid budget-only options and mass-market experiences",
        "Skip overly expensive luxury options"
      ],
      priceRange: "$200-300 per day",
      diningFocus: "Upscale restaurants, fine dining, and quality establishments",
      activityFocus: "Premium attractions, private tours, and unique experiences"
    };
  } else {
    return {
      weight: 1.0,
      promptInstructions: [
        "Focus on high-end, premium experiences and venues",
        "Include fine dining, luxury hotels, and exclusive activities",
        "Prioritize quality over cost, premium over budget options",
        "Consider private tours, VIP experiences, and luxury services"
      ],
      avoidInstructions: [
        "Avoid budget, casual, or low-cost options",
        "Skip mass-market or tourist-trap experiences"
      ],
      priceRange: "$300+ per day",
      diningFocus: "Fine dining, Michelin-starred restaurants, and luxury venues",
      activityFocus: "Exclusive experiences, private tours, and premium attractions"
    };
  }
}

/**
 * Convert numeric whoWith weights to prompt instructions
 * @param {number} romanceLevel - Numeric romance level (0.0 to 1.0)
 * @param {number} caretakerRole - Numeric caretaker role (0.0 to 1.0)
 * @param {number} flexibility - Numeric flexibility level (0.0 to 1.0)
 * @param {string} actualWhoWith - The actual whoWith string from user
 * @returns {Object} WhoWith weight instructions
 */
function getWhoWithWeightFromLevels(romanceLevel, caretakerRole, flexibility, actualWhoWith) {
  // Use actual whoWith if available, otherwise infer from weights
  const whoWithType = actualWhoWith || inferWhoWithType(romanceLevel, caretakerRole);
  
  const baseInstructions = {
    weight: 1.0,
    promptInstructions: [],
    avoidInstructions: [],
    mobilityConsiderations: "",
    budgetConsiderations: ""
  };

  switch (whoWithType) {
    case "spouse":
      return {
        ...baseInstructions,
        promptInstructions: [
          "Perfect for romantic couples seeking intimate experiences",
          "Include romantic dining spots and couple-friendly activities",
          "Consider sunset views, wine tastings, and romantic walks",
          "Balance cultural experiences with romantic moments"
        ],
        avoidInstructions: [
          "Avoid overly crowded tourist traps during peak hours",
          "Skip activities better suited for larger groups"
        ],
        mobilityConsiderations: "Focus on walkable romantic areas and scenic routes",
        budgetConsiderations: "Include both budget and splurge options for special moments"
      };

    case "spouse-kids":
      return {
        ...baseInstructions,
        promptInstructions: [
          "Perfect for families with children - kid-friendly and educational",
          "Include activities that engage both parents and children",
          "Consider playgrounds, interactive museums, and family dining",
          "Balance educational content with fun, engaging experiences"
        ],
        avoidInstructions: [
          "Avoid adult-only venues or activities inappropriate for children",
          "Skip activities with age restrictions or safety concerns"
        ],
        mobilityConsiderations: "Plan for stroller accessibility and frequent breaks",
        budgetConsiderations: "Focus on family value and activities that don't break the bank"
      };

    case "son-daughter":
      return {
        ...baseInstructions,
        promptInstructions: [
          "Perfect for parent-child bonding experiences",
          "Include educational and meaningful activities for both generations",
          "Consider activities that create lasting memories together",
          "Balance learning opportunities with shared enjoyment"
        ],
        avoidInstructions: [
          "Avoid activities that might be too mature or too childish",
          "Skip venues with age restrictions that don't suit both"
        ],
        mobilityConsiderations: "Plan for comfortable pacing and accessibility for all ages",
        budgetConsiderations: "Include meaningful experiences that justify the investment"
      };

    case "friends":
      return {
        ...baseInstructions,
        promptInstructions: [
          "Perfect for friend groups seeking fun and social experiences",
          "Include group activities and social dining spots",
          "Consider nightlife, group tours, and shared experiences",
          "Balance cultural exploration with social bonding"
        ],
        avoidInstructions: [
          "Avoid overly quiet or intimate venues better suited for couples",
          "Skip activities that don't work well with groups"
        ],
        mobilityConsiderations: "Plan for group transportation and meeting points",
        budgetConsiderations: "Include options that work for different budget levels in the group"
      };

    case "solo":
      return {
        ...baseInstructions,
        promptInstructions: [
          "Perfect for solo travelers who enjoy independence and flexibility",
          "Safe, well-lit areas with good solo dining options",
          "Activities that work well alone or with easy social interaction",
          "Consider solo-friendly venues like cafes, museums, and walking tours"
        ],
        avoidInstructions: [
          "Avoid group-only activities or couple-focused experiences",
          "Skip activities requiring a minimum group size"
        ],
        mobilityConsiderations: "Prioritize safe walking routes and well-populated areas",
        budgetConsiderations: "Include budget-friendly solo options and single-portion dining"
      };

    default:
      return {
        ...baseInstructions,
        promptInstructions: [
          "Perfect for diverse group dynamics and flexible experiences",
          "Include activities that work for various group sizes and dynamics",
          "Consider versatile venues and adaptable experiences",
          "Balance different interests and preferences within the group"
        ],
        avoidInstructions: [
          "Avoid activities too specific to one group type",
          "Skip venues with strict group requirements"
        ],
        mobilityConsiderations: "Plan for flexible transportation and meeting arrangements",
        budgetConsiderations: "Include a range of options to accommodate different budgets"
      };
  }
}

/**
 * Infer whoWith type from numeric weights
 * @param {number} romanceLevel - Numeric romance level
 * @param {number} caretakerRole - Numeric caretaker role
 * @returns {string} Inferred whoWith type
 */
function inferWhoWithType(romanceLevel, caretakerRole) {
  if (caretakerRole > 0.7) return "spouse-kids";
  if (romanceLevel > 0.7) return "spouse";
  if (caretakerRole > 0.3) return "son-daughter";
  return "solo";
}

/**
 * Convert persona weights to vibe instructions
 * @param {Object} personaWeights - Persona weights object
 * @returns {Array} Array of vibe instruction objects
 */
function getVibeWeightsFromPersonas(personaWeights) {
  const vibes = [];
  
  if (personaWeights.art > 0.5) {
    vibes.push({
      name: "Authentic & Local",
      weight: personaWeights.art,
      promptInstructions: [
        "Focus on local, authentic experiences and hidden gems",
        "Include local neighborhoods, family-run businesses, and cultural immersion",
        "Prioritize off-the-beaten-path locations and local traditions",
        "Consider local festivals, community events, and authentic cuisine"
      ],
      avoidInstructions: [
        "Avoid tourist traps and commercialized experiences",
        "Skip chain restaurants, tourist shops, and generic attractions"
      ],
      activityLevel: "Moderate, focused on cultural immersion",
      timeOfDay: "Flexible, but morning focus for local markets"
    });
  }
  
  if (personaWeights.foodie > 0.5) {
    vibes.push({
      name: "Social & Fun",
      weight: personaWeights.foodie,
      promptInstructions: [
        "Focus on social, interactive, and group-friendly activities",
        "Include bars, social dining, and community events",
        "Prioritize experiences that encourage interaction and connection",
        "Consider group tours, social venues, and community gatherings"
      ],
      avoidInstructions: [
        "Avoid solitary or intimate activities",
        "Skip quiet, private, or non-social experiences"
      ],
      activityLevel: "Moderate to high, socially engaging",
      timeOfDay: "Evening and night focus for social activities"
    });
  }
  
  if (personaWeights.adventure > 0.5) {
    vibes.push({
      name: "Adventurous & Active",
      weight: personaWeights.adventure,
      promptInstructions: [
        "Focus on high-energy, physically engaging activities",
        "Include adventure sports, hiking, and challenging experiences",
        "Prioritize outdoor activities and physical challenges",
        "Consider adrenaline-pumping experiences and active exploration"
      ],
      avoidInstructions: [
        "Avoid sedentary or passive activities",
        "Skip overly relaxed or low-energy experiences"
      ],
      activityLevel: "High energy, physically demanding",
      timeOfDay: "Morning and afternoon focus for active activities"
    });
  }
  
  if (personaWeights.history > 0.5) {
    vibes.push({
      name: "Authentic & Local",
      weight: personaWeights.history,
      promptInstructions: [
        "Focus on historical sites and cultural heritage",
        "Include museums, monuments, and educational experiences",
        "Prioritize learning about local history and traditions",
        "Consider guided historical tours and cultural sites"
      ],
      avoidInstructions: [
        "Avoid modern, commercial attractions",
        "Skip activities without historical or cultural significance"
      ],
      activityLevel: "Moderate, focused on learning and discovery",
      timeOfDay: "Morning focus for museum visits and tours"
    });
  }
  
  // Default if no clear preferences
  if (vibes.length === 0) {
    vibes.push({
      name: "Authentic & Local",
      weight: 0.5,
      promptInstructions: [
        "Focus on general exploration and discovery",
        "Include a mix of cultural and recreational activities",
        "Prioritize authentic local experiences",
        "Consider a balanced approach to sightseeing"
      ],
      avoidInstructions: [
        "Avoid overly touristy or commercial experiences"
      ],
      activityLevel: "Moderate, balanced exploration",
      timeOfDay: "Flexible timing"
    });
  }
  
  return vibes;
}

/**
 * Generate comprehensive prompt from numeric weights
 * @param {Object} weights - All numeric weights
 * @returns {string} Formatted prompt for OpenAI
 */
function generatePromptFromWeights(weights) {
  const budgetWeight = getBudgetWeightFromLevel(weights.budgetLevel);
  const whoWithWeight = getWhoWithWeightFromLevels(
    weights.romanceLevel, 
    weights.caretakerRole, 
    weights.flexibility,
    weights.whoWith
  );
  const vibeWeights = getVibeWeightsFromPersonas(weights.personaWeights);
  
  let prompt = `**Budget Level: ${budgetWeight.priceRange}**\n`;
  prompt += budgetWeight.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
  if (budgetWeight.avoidInstructions.length > 0) {
    prompt += `\n\n**Budget Avoidances:**\n`;
    prompt += budgetWeight.avoidInstructions.map(instruction => `- ${instruction}`).join('\n');
  }
  prompt += `\n\n**Dining Focus:** ${budgetWeight.diningFocus}`;
  prompt += `\n**Activity Focus:** ${budgetWeight.activityFocus}`;
  
  prompt += `\n\n**Travel Companion Context:**\n`;
  prompt += whoWithWeight.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
  if (whoWithWeight.avoidInstructions.length > 0) {
    prompt += `\n\n**Avoid:**\n`;
    prompt += whoWithWeight.avoidInstructions.map(instruction => `- ${instruction}`).join('\n');
  }
  prompt += `\n\n**Mobility Focus:** ${whoWithWeight.mobilityConsiderations}`;
  prompt += `\n**Budget Focus:** ${whoWithWeight.budgetConsiderations}`;
  
  prompt += `\n\n**Vibe & Atmosphere:**\n`;
  vibeWeights.forEach(vibe => {
    prompt += `\n**${vibe.name}:**\n`;
    prompt += vibe.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
    if (vibe.activityLevel) {
      prompt += `\n- Activity Level: ${vibe.activityLevel}`;
    }
    if (vibe.timeOfDay) {
      prompt += `\n- Timing: ${vibe.timeOfDay}`;
    }
  });
  
  return prompt;
}

module.exports = {
  getBudgetWeightFromLevel,
  getWhoWithWeightFromLevels,
  getVibeWeightsFromPersonas,
  generatePromptFromWeights,
  inferWhoWithType
};
