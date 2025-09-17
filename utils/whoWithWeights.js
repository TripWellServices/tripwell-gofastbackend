/**
 * WhoWithWeights - Converts whoWith preferences into prompt instructions
 * Each weight provides specific guidance for content generation
 */

const whoWithWeights = {
  solo: {
    weight: 1.0,
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
  },

  spouse: {
    weight: 1.0,
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
  },

  "spouse-kids": {
    weight: 1.0,
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
  },

  "son-daughter": {
    weight: 1.0,
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
  },

  friends: {
    weight: 1.0,
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
  },

  other: {
    weight: 1.0,
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
  }
};

/**
 * Get weight instructions for a specific whoWith preference
 * @param {string} whoWith - The whoWith preference
 * @returns {Object} Weight instructions for the preference
 */
function getWhoWithWeight(whoWith) {
  return whoWithWeights[whoWith] || whoWithWeights.other;
}

/**
 * Generate prompt instructions for whoWith preference
 * @param {string} whoWith - The whoWith preference
 * @returns {string} Formatted prompt instructions
 */
function generateWhoWithPrompt(whoWith) {
  const weight = getWhoWithWeight(whoWith);
  
  let prompt = `**Travel Companion Context (${whoWith}):**\n`;
  prompt += weight.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
  
  if (weight.avoidInstructions.length > 0) {
    prompt += `\n\n**Avoid:**\n`;
    prompt += weight.avoidInstructions.map(instruction => `- ${instruction}`).join('\n');
  }
  
  prompt += `\n\n**Mobility Focus:** ${weight.mobilityConsiderations}`;
  prompt += `\n**Budget Focus:** ${weight.budgetConsiderations}`;
  
  return prompt;
}

module.exports = {
  whoWithWeights,
  getWhoWithWeight,
  generateWhoWithPrompt
};
