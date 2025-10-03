// services/budgetCalculationService.js
const TripPersona = require("../../models/TripWell/TripPersona");
const { convertBudgetToWords } = require("../TripWell/tripPersonaConverterService");

/*
  BudgetCalculation Service
  
  ✅ Calculates budget level from dollar amount
  ✅ Determines budget category (Budget/Moderate/Upscale/Luxury)
  ✅ Calls converter service with budget level
  ✅ Handles budget-specific analysis
*/

const calculateBudgetWeights = (budgetAmount) => {
  // Initialize all budget weights to 0.0 (points system)
  const budgetWeights = {
    Budget: 0.0,      // $0-$200
    Moderate: 0.0,    // $200-$400  
    Luxury: 0.0       // $400+
  };
  
  // Set chosen budget category to 0.5 (standard points)
  if (budgetAmount <= 200) {
    budgetWeights.Budget = 0.5;
  } else if (budgetAmount <= 400) {
    budgetWeights.Moderate = 0.5;
  } else {
    budgetWeights.Luxury = 0.5;
  }
  
  return budgetWeights;
};

const calculateBudgetPercentages = (budgetWeights) => {
  // Calculate total points
  const totalPoints = Object.values(budgetWeights).reduce((sum, weight) => sum + weight, 0);
  
  // Convert to percentages
  const percentages = {};
  for (const [budget, weight] of Object.entries(budgetWeights)) {
    percentages[budget] = totalPoints > 0 ? (weight / totalPoints) * 100 : 0;
  }
  
  return { percentages, totalPoints };
};

const findDominantBudget = (percentages) => {
  // Find budget category with highest percentage
  let dominantBudget = null;
  let highestPercentage = 0;
  
  for (const [budget, percentage] of Object.entries(percentages)) {
    if (percentage > highestPercentage) {
      highestPercentage = percentage;
      dominantBudget = budget;
    }
  }
  
  return { dominantBudget, confidence: highestPercentage };
};

const analyzeAndConvertBudget = async (tripId, userId, budgetAmount) => {
  try {
    console.log(`💰 Analyzing budget for trip ${tripId}: $${budgetAmount}`);
    
    // Calculate budget weights from amount
    const budgetWeights = calculateBudgetWeights(budgetAmount);
    
    // Calculate percentages from weights
    const { percentages, totalPoints } = calculateBudgetPercentages(budgetWeights);
    
    // Find dominant budget category
    const { dominantBudget, confidence } = findDominantBudget(percentages);
    
    console.log(`🎯 Budget analysis:`, {
      budgetAmount: `$${budgetAmount}`,
      budgetWeights,
      percentages,
      dominantBudget,
      confidence: `${confidence.toFixed(1)}%`
    });
    
    // Update TripPersona with budget analysis
    const tripPersona = await TripPersona.findOneAndUpdate(
      { tripId, userId },
      {
        budgetAmount,
        budgetWeights,
        budgetPercentages: percentages,
        dominantBudget,
        budgetConfidence: confidence,
        budgetAnalyzedAt: new Date()
      },
      { new: true }
    );
    
    // 🚀 CALL THE CONVERTER SERVICE: "Hey, this dude's budget is Luxury!"
    console.log(`🔄 Calling converter service: "Convert ${dominantBudget} budget"`);
    const budgetWords = await convertBudgetToWords(dominantBudget);
    
    console.log(`✅ Budget analysis complete:`, {
      dominantBudget,
      confidence: `${confidence.toFixed(1)}%`,
      budgetWords
    });
    
    return {
      dominantBudget,
      confidence,
      percentages,
      budgetWords,
      tripPersona
    };
    
  } catch (error) {
    console.error(`❌ Error analyzing budget for trip ${tripId}:`, error);
    throw error;
  }
};

// Query helpers for budget analysis
const findBudgetTrips = async (category) => {
  return await TripPersona.find({ budgetCategory: category });
};

const findLuxuryTrips = async () => {
  return await TripPersona.find({ budgetLevel: 1.0 });
};

const findBudgetDistribution = async () => {
  return await TripPersona.aggregate([
    { 
      $group: { 
        _id: '$budgetCategory', 
        count: { $sum: 1 },
        avgBudget: { $avg: '$budget' }
      } 
    },
    { $sort: { count: -1 } }
  ]);
};

const findBudgetVsPersona = async () => {
  return await TripPersona.aggregate([
    { $match: { status: 'analyzed' } },
    { 
      $group: { 
        _id: { 
          budgetCategory: '$budgetCategory', 
          dominantPersona: '$dominantPersona' 
        }, 
        count: { $sum: 1 }
      } 
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = {
  calculateBudgetWeights,
  calculateBudgetPercentages,
  findDominantBudget,
  analyzeAndConvertBudget,
  findBudgetTrips,
  findLuxuryTrips,
  findBudgetDistribution,
  findBudgetVsPersona
};
