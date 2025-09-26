// services/pickToWeightService.js
const TripPersona = require("../models/TripWell/TripPersona");

/*
  PickToWeight Service
  
  ✅ Basic pick → 0.5 weights calculation
  ✅ Just does the initial weight assignment
  ✅ For MVP 1: chosen item = 0.5, samples = 0.05 each
  ✅ Simple and clean - no complex analysis
*/

const calculatePersonaWeights = (primaryPersona) => {
  // Initialize all persona weights to 0.0 (points system)
  const personaWeights = {
    art: 0.0,
    foodie: 0.0,
    adventure: 0.0,
    history: 0.0
  };
  
  // Set primary persona to 0.5 (standard points)
  if (primaryPersona && personaWeights.hasOwnProperty(primaryPersona)) {
    personaWeights[primaryPersona] = 0.5;
  }
  
  return personaWeights;
};

const calculateBudgetLevel = (budget) => {
  // Convert budget amount to budget level (0.3, 0.5, 0.7, 1.0)
  if (budget <= 50) return 0.3;      // Budget
  if (budget <= 100) return 0.5;     // Moderate
  if (budget <= 200) return 0.7;     // Upscale
  return 1.0;                        // Luxury
};

const calculateSpacingWeights = (dailySpacing) => {
  // Convert daily spacing (0-1) to spacing categories
  const spacingWeights = {
    relaxed: 0.0,    // 0-0.3
    balanced: 0.0,   // 0.3-0.7
    packed: 0.0      // 0.7-1.0
  };
  
  if (dailySpacing <= 0.3) {
    spacingWeights.relaxed = 1.0;
  } else if (dailySpacing <= 0.7) {
    spacingWeights.balanced = 1.0;
  } else {
    spacingWeights.packed = 1.0;
  }
  
  return spacingWeights;
};

const savePickToWeights = async (tripId, userId, tripPersonaData) => {
  try {
    console.log(`🎯 Saving pick-to-weights for trip ${tripId}`);
    
    const { primaryPersona, budget, dailySpacing } = tripPersonaData;
    
    const personaWeights = calculatePersonaWeights(primaryPersona);
    const budgetLevel = calculateBudgetLevel(budget);
    const spacingWeights = calculateSpacingWeights(dailySpacing);
    
    // Create or update TripPersona with basic weights
    const tripPersona = await TripPersona.findOneAndUpdate(
      { tripId, userId },
      {
        tripId,
        userId,
        primaryPersona,
        budget,
        dailySpacing,
        // Basic weights (no analysis yet)
        personaWeights,
        budgetLevel,
        spacingWeights,
        status: 'weights_assigned',
        calculatedAt: new Date(),
        calculationVersion: "1.0"
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Pick-to-weights saved:`, {
      tripId,
      userId,
      personaWeights,
      budgetLevel,
      spacingWeights
    });
    
    return tripPersona;
    
  } catch (error) {
    console.error(`❌ Error saving pick-to-weights for trip ${tripId}:`, error);
    throw error;
  }
};

const getTripPersonaCalculations = async (tripId, userId) => {
  try {
    return await TripPersona.findOne({ tripId, userId });
  } catch (error) {
    console.error(`❌ Error getting trip persona calculations for trip ${tripId}:`, error);
    throw error;
  }
};

// Query helpers
const findArtTrips = async (minWeight = 0.5) => {
  return await TripPersona.find({ "personaWeights.art": { $gt: minWeight } });
};

const findFoodieTrips = async (minWeight = 0.5) => {
  return await TripPersona.find({ "personaWeights.foodie": { $gt: minWeight } });
};

const findBudgetTrips = async (budgetLevel) => {
  return await TripPersona.find({ budgetLevel });
};

const findRelaxedTrips = async () => {
  return await TripPersona.find({ "spacingWeights.relaxed": { $gt: 0.5 } });
};

module.exports = {
  calculatePersonaWeights,
  calculateBudgetLevel,
  calculateSpacingWeights,
  savePickToWeights,
  getTripPersonaCalculations,
  findArtTrips,
  findFoodieTrips,
  findBudgetTrips,
  findRelaxedTrips
};
