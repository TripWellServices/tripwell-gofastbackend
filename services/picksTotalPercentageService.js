// services/picksTotalPercentageService.js
const TripPersona = require("../../models/TripWell/TripPersona");
const { convertPersonaToWords } = require("./TripWell/tripPersonaConverterService");

/*
  PicksTotalPercentage Service
  
  ✅ Calculates weights/total = percentage
  ✅ Finds dominant persona from percentages
  ✅ Calls converter service with dominant persona
  ✅ Handles complex analysis (future: Python integration)
*/

const calculatePersonaPercentages = (personaWeights) => {
  // Calculate total points
  const totalPoints = Object.values(personaWeights).reduce((sum, weight) => sum + weight, 0);
  
  // Convert to percentages
  const percentages = {};
  for (const [persona, weight] of Object.entries(personaWeights)) {
    percentages[persona] = totalPoints > 0 ? (weight / totalPoints) * 100 : 0;
  }
  
  return { percentages, totalPoints };
};

const findDominantPersona = (percentages) => {
  // Find persona with highest percentage
  let dominantPersona = null;
  let highestPercentage = 0;
  
  for (const [persona, percentage] of Object.entries(percentages)) {
    if (percentage > highestPercentage) {
      highestPercentage = percentage;
      dominantPersona = persona;
    }
  }
  
  return { dominantPersona, confidence: highestPercentage };
};

const analyzeAndConvertPersona = async (tripId, userId) => {
  try {
    console.log(`📊 Analyzing persona percentages for trip ${tripId}`);
    
    // Get the trip persona with weights
    const tripPersona = await TripPersona.findOne({ tripId, userId });
    if (!tripPersona) {
      throw new Error(`No trip persona found for trip ${tripId}`);
    }
    
    // Calculate percentages from weights
    const { percentages, totalPoints } = calculatePersonaPercentages(tripPersona.personaWeights);
    
    // Find dominant persona
    const { dominantPersona, confidence } = findDominantPersona(percentages);
    
    console.log(`🎯 Dominant persona analysis:`, {
      percentages,
      dominantPersona,
      confidence: `${confidence.toFixed(1)}%`,
      totalPoints
    });
    
    // Update TripPersona with analysis results
    await TripPersona.findOneAndUpdate(
      { tripId, userId },
      {
        dominantPersona,
        personaPercentages: percentages,
        confidence,
        totalPoints,
        status: 'analyzed',
        analyzedAt: new Date()
      }
    );
    
    // 🚀 CALL THE CONVERTER SERVICE: "Hey, this dude is History!"
    console.log(`🔄 Calling converter service: "Convert ${dominantPersona} persona"`);
    const personaWords = await convertPersonaToWords(
      dominantPersona, 
      tripPersona.budgetLevel, 
      tripPersona.dailySpacing
    );
    
    console.log(`✅ Persona analysis complete:`, {
      dominantPersona,
      confidence: `${confidence.toFixed(1)}%`,
      personaWords
    });
    
    return {
      dominantPersona,
      confidence,
      percentages,
      personaWords,
      tripPersona
    };
    
  } catch (error) {
    console.error(`❌ Error analyzing persona percentages for trip ${tripId}:`, error);
    throw error;
  }
};

// Query helpers for analysis
const findHighConfidencePersonas = async (minConfidence = 70) => {
  return await TripPersona.find({ 
    confidence: { $gte: minConfidence },
    status: 'analyzed'
  });
};

const findArtDominantTrips = async () => {
  return await TripPersona.find({ 
    dominantPersona: 'art',
    status: 'analyzed'
  });
};

const findPersonaDistribution = async () => {
  return await TripPersona.aggregate([
    { $match: { status: 'analyzed' } },
    { 
      $group: { 
        _id: '$dominantPersona', 
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' }
      } 
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = {
  calculatePersonaPercentages,
  findDominantPersona,
  analyzeAndConvertPersona,
  findHighConfidencePersonas,
  findArtDominantTrips,
  findPersonaDistribution
};
