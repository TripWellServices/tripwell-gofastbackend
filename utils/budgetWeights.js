/**
 * BudgetWeights - Converts budget preferences into prompt instructions
 * Each budget level provides specific guidance for content generation
 */

const budgetWeights = {
  "Budget": {
    weight: 1.0,
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
    priceRange: "$0-50 per day",
    diningFocus: "Street food, local cafes, and budget-friendly restaurants",
    activityFocus: "Free attractions, walking tours, and public spaces"
  },

  "Mid-range": {
    weight: 1.0,
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
    priceRange: "$50-150 per day",
    diningFocus: "Mid-range restaurants, local favorites, and quality cafes",
    activityFocus: "Paid attractions, guided tours, and quality experiences"
  },

  "Luxury": {
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
    priceRange: "$150+ per day",
    diningFocus: "Fine dining, Michelin-starred restaurants, and luxury venues",
    activityFocus: "Exclusive experiences, private tours, and premium attractions"
  },

  "Flexible": {
    weight: 1.0,
    promptInstructions: [
      "Focus on a mix of budget and premium options",
      "Include both free activities and splurge experiences",
      "Prioritize value and quality across different price points",
      "Consider a range of dining and activity options"
    ],
    avoidInstructions: [
      "Avoid being too restrictive on budget",
      "Skip only high-end or only budget-focused experiences"
    ],
    priceRange: "Variable, $0-200+ per day",
    diningFocus: "Mix of street food, local restaurants, and fine dining",
    activityFocus: "Combination of free attractions and premium experiences"
  }
};

/**
 * Parse budget string to extract budget level
 * @param {string} budgetString - Raw budget string from user input
 * @returns {string} Standardized budget level
 */
function parseBudgetLevel(budgetString) {
  if (!budgetString) return "Flexible";
  
  const budget = budgetString.toLowerCase();
  
  if (budget.includes("budget") || budget.includes("cheap") || budget.includes("$0") || budget.includes("$50")) {
    return "Budget";
  } else if (budget.includes("luxury") || budget.includes("high-end") || budget.includes("premium") || budget.includes("$200")) {
    return "Luxury";
  } else if (budget.includes("mid") || budget.includes("moderate") || budget.includes("$100") || budget.includes("$150")) {
    return "Mid-range";
  } else {
    return "Flexible";
  }
}

/**
 * Get weight instructions for budget preference
 * @param {string} budgetString - Raw budget string from user input
 * @returns {Object} Weight instructions for the budget level
 */
function getBudgetWeight(budgetString) {
  const budgetLevel = parseBudgetLevel(budgetString);
  return budgetWeights[budgetLevel] || budgetWeights.Flexible;
}

/**
 * Generate prompt instructions for budget preference
 * @param {string} budgetString - Raw budget string from user input
 * @returns {string} Formatted prompt instructions
 */
function generateBudgetPrompt(budgetString) {
  const weight = getBudgetWeight(budgetString);
  
  let prompt = `**Budget Level: ${weight.priceRange}**\n`;
  prompt += weight.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
  
  if (weight.avoidInstructions.length > 0) {
    prompt += `\n\n**Budget Avoidances:**\n`;
    prompt += weight.avoidInstructions.map(instruction => `- ${instruction}`).join('\n');
  }
  
  prompt += `\n\n**Dining Focus:** ${weight.diningFocus}`;
  prompt += `\n**Activity Focus:** ${weight.activityFocus}`;
  
  return prompt;
}

/**
 * Get price range for budget level
 * @param {string} budgetString - Raw budget string from user input
 * @returns {string} Price range string
 */
function getPriceRange(budgetString) {
  const weight = getBudgetWeight(budgetString);
  return weight.priceRange;
}

module.exports = {
  budgetWeights,
  parseBudgetLevel,
  getBudgetWeight,
  generateBudgetPrompt,
  getPriceRange
};
