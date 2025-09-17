/**
 * VibesWeights - Converts vibe preferences into prompt instructions
 * Each vibe provides specific guidance for content generation
 */

const vibesWeights = {
  "Adventurous & Active": {
    weight: 1.0,
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
  },

  "Relaxed & Chill": {
    weight: 1.0,
    promptInstructions: [
      "Focus on peaceful, low-stress activities and environments",
      "Include leisurely walks, quiet cafes, and serene locations",
      "Prioritize comfortable, unhurried experiences",
      "Consider meditation spots, gardens, and tranquil settings"
    ],
    avoidInstructions: [
      "Avoid crowded, noisy, or high-stress environments",
      "Skip activities requiring high energy or quick decisions"
    ],
    activityLevel: "Low energy, peaceful and calm",
    timeOfDay: "Flexible timing, avoid rush hours"
  },

  "Romantic & Intimate": {
    weight: 1.0,
    promptInstructions: [
      "Focus on intimate, romantic settings and experiences",
      "Include sunset views, wine tastings, and couple activities",
      "Prioritize quiet, romantic dining and scenic locations",
      "Consider private tours, romantic walks, and intimate venues"
    ],
    avoidInstructions: [
      "Avoid crowded, group-focused, or family-oriented activities",
      "Skip loud, commercial, or non-romantic venues"
    ],
    activityLevel: "Moderate, focused on intimacy",
    timeOfDay: "Evening focus for romantic experiences"
  },

  "Social & Fun": {
    weight: 1.0,
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
  },

  "Luxurious & Upscale": {
    weight: 1.0,
    promptInstructions: [
      "Focus on high-end, premium experiences and venues",
      "Include luxury hotels, fine dining, and exclusive activities",
      "Prioritize quality over quantity, premium over budget options",
      "Consider private tours, VIP experiences, and luxury services"
    ],
    avoidInstructions: [
      "Avoid budget, casual, or low-cost options",
      "Skip mass-market or tourist-trap experiences"
    ],
    activityLevel: "Moderate, focused on quality and comfort",
    timeOfDay: "Flexible, but evening focus for luxury dining"
  },

  "Authentic & Local": {
    weight: 1.0,
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
  }
};

/**
 * Get weight instructions for vibe preferences
 * @param {Array} vibes - Array of vibe preferences
 * @returns {Array} Weight instructions for each vibe
 */
function getVibesWeights(vibes) {
  if (!vibes || !Array.isArray(vibes)) return [];
  
  return vibes.map(vibe => 
    vibesWeights[vibe] || { weight: 0.5, promptInstructions: [] }
  );
}

/**
 * Generate prompt instructions for vibe preferences
 * @param {Array} vibes - Array of vibe preferences
 * @returns {string} Formatted prompt instructions
 */
function generateVibesPrompt(vibes) {
  if (!vibes || vibes.length === 0) {
    return "**Vibe:** General exploration and discovery";
  }
  
  const weights = getVibesWeights(vibes);
  
  let prompt = `**Vibe & Atmosphere:**\n`;
  
  weights.forEach((weight, index) => {
    if (weight.promptInstructions.length > 0) {
      prompt += `\n**${vibes[index]}:**\n`;
      prompt += weight.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
      if (weight.activityLevel) {
        prompt += `\n- Activity Level: ${weight.activityLevel}`;
      }
      if (weight.timeOfDay) {
        prompt += `\n- Timing: ${weight.timeOfDay}`;
      }
    }
  });
  
  return prompt;
}

/**
 * Get activity level based on vibes
 * @param {Array} vibes - Array of vibe preferences
 * @returns {string} Overall activity level
 */
function getActivityLevelFromVibes(vibes) {
  const weights = getVibesWeights(vibes);
  
  if (weights.length === 0) return "Moderate";
  
  const activityLevels = weights.map(w => w.activityLevel).filter(Boolean);
  
  if (activityLevels.includes("High energy, physically demanding")) {
    return "High";
  } else if (activityLevels.includes("Low energy, peaceful and calm")) {
    return "Low";
  } else {
    return "Moderate";
  }
}

module.exports = {
  vibesWeights,
  getVibesWeights,
  generateVibesPrompt,
  getActivityLevelFromVibes
};
