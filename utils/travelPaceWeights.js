/**
 * TravelPaceWeights - Converts travel pace preferences into prompt instructions
 * Each pace provides specific guidance for content generation
 */

const travelPaceWeights = {
  "Fast Paced - Pack it all in": {
    weight: 1.0,
    promptInstructions: [
      "Focus on maximizing experiences and fitting in as much as possible",
      "Include efficient routes and time-optimized activities",
      "Prioritize must-see attractions and iconic experiences",
      "Consider early starts, late finishes, and packed schedules"
    ],
    avoidInstructions: [
      "Avoid slow, leisurely activities that take too much time",
      "Skip activities with long wait times or slow pacing"
    ],
    scheduleDensity: "High - 6-8 activities per day",
    timeAllocation: "Short visits (1-2 hours per activity)",
    transportation: "Efficient routes, minimal travel time between activities"
  },

  "Moderate - Balanced activities": {
    weight: 1.0,
    promptInstructions: [
      "Focus on a balanced mix of activities with reasonable pacing",
      "Include both active and relaxed experiences",
      "Prioritize quality over quantity, allowing time to enjoy each experience",
      "Consider morning and afternoon activities with breaks"
    ],
    avoidInstructions: [
      "Avoid overly packed schedules or too many activities",
      "Skip activities that require rushing or don't allow proper time"
    ],
    scheduleDensity: "Medium - 4-5 activities per day",
    timeAllocation: "Moderate visits (2-3 hours per activity)",
    transportation: "Balanced travel time, some walking, some transport"
  },

  "Slow & Relaxed - Take your time": {
    weight: 1.0,
    promptInstructions: [
      "Focus on leisurely, unhurried experiences",
      "Include plenty of time for relaxation and spontaneous discovery",
      "Prioritize quality over quantity, allowing deep exploration",
      "Consider flexible schedules with room for serendipity"
    ],
    avoidInstructions: [
      "Avoid packed schedules or time-pressured activities",
      "Skip activities that require rushing or strict timing"
    ],
    scheduleDensity: "Low - 2-3 activities per day",
    timeAllocation: "Long visits (3+ hours per activity)",
    transportation: "Leisurely walking, minimal rushing between locations"
  },

  "Flexible - Go with the flow": {
    weight: 1.0,
    promptInstructions: [
      "Focus on adaptable experiences that can be adjusted on the fly",
      "Include both planned and spontaneous activities",
      "Prioritize flexibility and the ability to change plans",
      "Consider a mix of structured and unstructured time"
    ],
    avoidInstructions: [
      "Avoid rigid schedules or non-refundable bookings",
      "Skip activities that can't be easily modified or cancelled"
    ],
    scheduleDensity: "Variable - 2-6 activities per day",
    timeAllocation: "Flexible visits (1-4 hours per activity)",
    transportation: "Adaptable transportation, easy to change plans"
  }
};

/**
 * Get weight instructions for travel pace preference
 * @param {Array} travelPace - Array of travel pace preferences
 * @returns {Array} Weight instructions for each pace
 */
function getTravelPaceWeights(travelPace) {
  if (!travelPace || !Array.isArray(travelPace) || travelPace.length === 0) {
    return [travelPaceWeights["Moderate - Balanced activities"]];
  }
  
  return travelPace.map(pace => 
    travelPaceWeights[pace] || travelPaceWeights["Moderate - Balanced activities"]
  );
}

/**
 * Generate prompt instructions for travel pace preferences
 * @param {Array} travelPace - Array of travel pace preferences
 * @returns {string} Formatted prompt instructions
 */
function generateTravelPacePrompt(travelPace) {
  const weights = getTravelPaceWeights(travelPace);
  
  let prompt = `**Travel Pace & Scheduling:**\n`;
  
  weights.forEach((weight, index) => {
    if (weight.promptInstructions.length > 0) {
      prompt += `\n**${travelPace[index] || 'Moderate Pace'}:**\n`;
      prompt += weight.promptInstructions.map(instruction => `- ${instruction}`).join('\n');
      
      if (weight.scheduleDensity) {
        prompt += `\n- Schedule Density: ${weight.scheduleDensity}`;
      }
      if (weight.timeAllocation) {
        prompt += `\n- Time Allocation: ${weight.timeAllocation}`;
      }
      if (weight.transportation) {
        prompt += `\n- Transportation: ${weight.transportation}`;
      }
    }
  });
  
  return prompt;
}

/**
 * Get overall schedule density based on travel pace
 * @param {Array} travelPace - Array of travel pace preferences
 * @returns {string} Overall schedule density
 */
function getScheduleDensity(travelPace) {
  const weights = getTravelPaceWeights(travelPace);
  
  if (weights.some(w => w.scheduleDensity?.includes("High"))) {
    return "High";
  } else if (weights.some(w => w.scheduleDensity?.includes("Low"))) {
    return "Low";
  } else {
    return "Medium";
  }
}

/**
 * Get recommended activities per day based on travel pace
 * @param {Array} travelPace - Array of travel pace preferences
 * @returns {number} Recommended activities per day
 */
function getActivitiesPerDay(travelPace) {
  const density = getScheduleDensity(travelPace);
  
  switch (density) {
    case "High": return 6;
    case "Low": return 2;
    default: return 4;
  }
}

module.exports = {
  travelPaceWeights,
  getTravelPaceWeights,
  generateTravelPacePrompt,
  getScheduleDensity,
  getActivitiesPerDay
};
