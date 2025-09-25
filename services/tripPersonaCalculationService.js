// services/tripPersonaCalculationService.js
const TripPersona = require("../models/TripWell/TripPersona");

/*
  TripPersonaCalculation Service
  
  ✅ Calculates trip-specific persona weights based on selections
  ✅ Linked by tripId (trip-level weights vs user-level weights)
  ✅ Individual fields for easy querying and mutation
  ✅ Never hardcoded - all logic in service
*/

const calculatePersonaWeights = (primaryPersona) => {
  // Initialize all persona weights to 0.1 (not primary)
  const personaWeights = {
    art: 0.1,
    foodie: 0.1,
    adventure: 0.1,
    history: 0.1
  };
  
  // Set primary persona to 0.6
  if (primaryPersona && personaWeights.hasOwnProperty(primaryPersona)) {
    personaWeights[primaryPersona] = 0.6;
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

const saveTripPersonaCalculations = async (tripId, userId, tripPersonaData) => {
  try {
    console.log(`🧮 Calculating trip persona weights for trip ${tripId}`);
    
    const { primaryPersona, budget, dailySpacing } = tripPersonaData;
    
    const personaWeights = calculatePersonaWeights(primaryPersona);
    const budgetLevel = calculateBudgetLevel(budget);
    const spacingWeights = calculateSpacingWeights(dailySpacing);
    
    // Create or update TripPersona with calculated weights
    const tripPersona = await TripPersona.findOneAndUpdate(
      { tripId, userId },
      {
        tripId,
        userId,
        primaryPersona,
        budget,
        dailySpacing,
        // Calculated weights
        personaWeights,
        budgetLevel,
        spacingWeights,
        status: 'calculated',
        calculatedAt: new Date(),
        calculationVersion: "1.0"
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Trip persona calculations saved:`, {
      tripId,
      userId,
      personaWeights,
      budgetLevel,
      spacingWeights
    });
    
    return tripPersona;
    
  } catch (error) {
    console.error(`❌ Error saving trip persona calculations for trip ${tripId}:`, error);
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
  saveTripPersonaCalculations,
  getTripPersonaCalculations,
  findArtTrips,
  findFoodieTrips,
  findBudgetTrips,
  findRelaxedTrips
};
