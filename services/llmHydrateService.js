// services/llmHydrateService.js
const TripLLMReady = require("../models/TripWell/TripLLMReady");
const TripBase = require("../models/TripWell/TripBase");
const TripPersona = require("../models/TripWell/TripPersona");
const ItineraryDays = require("../models/TripWell/ItineraryDays");
const { convertPersonaToWords, convertBudgetCategoryToWords } = require("./TripWell/tripPersonaConverterService");

/*
  LLM Hydrate Service
  
  ✅ Ensures everything gets pushed to TripLLMReady
  ✅ One-stop shop for building LLM-ready data
  ✅ Consolidates from TripBase, TripPersona, ItineraryDays, etc.
  ✅ Updates TripLLMReady with all consolidated data
  ✅ SmartPrompt service draws from this ONE source of truth
*/

const hydrateTripForLLM = async (tripId, userId) => {
  try {
    console.log(`🔄 Hydrating trip ${tripId} for LLM...`);
    
    // Get all trip data from various models
    const [tripBase, tripPersona, itineraryDays] = await Promise.all([
      TripBase.findById(tripId),
      TripPersona.findOne({ tripId, userId }),
      ItineraryDays.findOne({ tripId, userId })
    ]);
    
    if (!tripBase) {
      throw new Error(`TripBase not found for trip ${tripId}`);
    }
    
    if (!tripPersona) {
      throw new Error(`TripPersona not found for trip ${tripId}`);
    }
    
    console.log(`✅ Found trip data:`, {
      tripBase: !!tripBase,
      tripPersona: !!tripPersona,
      itineraryDays: !!itineraryDays
    });
    
    // Convert persona to LLM-ready string
    const personaWords = await convertPersonaToWords(
      tripPersona.dominantPersona || tripPersona.primaryPersona,
      tripPersona.budgetLevel,
      tripPersona.dailySpacing
    );
    
    // Convert budget to LLM-ready string
    const budgetWords = await convertBudgetCategoryToWords(
      tripPersona.dominantBudget || getBudgetCategory(tripPersona.budgetLevel)
    );
    
    // Build TripLLMReady data
    const llmReadyData = {
      tripId,
      userId,
      
      // Trip context (from TripBase)
      season: tripBase.season,
      whoWith: tripBase.whoWith || "friends", // Use literal string from TripBase
      purpose: tripBase.purpose,
      city: tripBase.city,
      country: tripBase.country,
      startDate: tripBase.startDate,
      endDate: tripBase.endDate,
      daysTotal: tripBase.daysTotal,
      
      // Trip days (from ItineraryDays if available)
      tripDays: itineraryDays ? itineraryDays.parsedDays.map(day => ({
        dayIndex: day.dayIndex,
        summary: day.summary,
        blocks: day.blocks
      })) : [],
      
      // LLM-ready strings (from converter service)
      tripPersonaLLM: personaWords.persona,
      tripBudgetLLM: budgetWords,
      tripSpacingLLM: personaWords.spacing,
      
      // Analysis results - just for tracking
      personaConfidence: tripPersona.confidence || 100,
      budgetConfidence: tripPersona.budgetConfidence || 100,
      
      // Status
      status: itineraryDays ? 'ready' : 'building'
    };
    
    // Update or create TripLLMReady
    const tripLLMReady = await TripLLMReady.findOneAndUpdate(
      { tripId },
      llmReadyData,
      { upsert: true, new: true }
    );
    
    console.log(`✅ Trip hydrated for LLM:`, {
      tripId,
      status: tripLLMReady.status,
      personaLLM: tripLLMReady.tripPersonaLLM.substring(0, 50) + "...",
      budgetLLM: tripLLMReady.tripBudgetLLM.substring(0, 50) + "...",
      daysCount: tripLLMReady.tripDays.length
    });
    
    return tripLLMReady;
    
  } catch (error) {
    console.error(`❌ Error hydrating trip ${tripId} for LLM:`, error);
    throw error;
  }
};

// Helper function to determine budget category
const getBudgetCategory = (budgetLevel) => {
  if (budgetLevel >= 0.8) return "Luxury";
  if (budgetLevel >= 0.6) return "Moderate";
  if (budgetLevel >= 0.4) return "Budget";
  return "Budget";
};

// Hydrate when itinerary is built
const hydrateAfterItineraryBuild = async (tripId, userId) => {
  try {
    console.log(`🚀 Hydrating after itinerary build for trip ${tripId}`);
    
    const tripLLMReady = await hydrateTripForLLM(tripId, userId);
    
    // Mark as ready if we have itinerary days
    if (tripLLMReady.tripDays.length > 0) {
      await TripLLMReady.findOneAndUpdate(
        { tripId },
        { 
          status: 'ready',
          readyAt: new Date()
        }
      );
      
      console.log(`✅ Trip marked as ready for LLM`);
    }
    
    return tripLLMReady;
    
  } catch (error) {
    console.error(`❌ Error hydrating after itinerary build:`, error);
    throw error;
  }
};

// Hydrate when samples are selected
const hydrateAfterSampleSelect = async (tripId, userId, sampleSelects) => {
  try {
    console.log(`🎯 Hydrating after sample select for trip ${tripId}`);
    
    // Update sample selects in TripLLMReady
    await TripLLMReady.findOneAndUpdate(
      { tripId },
      { 
        sampleSelects: sampleSelects,
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ Sample selects updated in TripLLMReady`);
    
    return await TripLLMReady.findOne({ tripId });
    
  } catch (error) {
    console.error(`❌ Error hydrating after sample select:`, error);
    throw error;
  }
};

// Get LLM-ready data (for SmartPrompt service)
const getLLMReadyData = async (tripId) => {
  try {
    const tripLLMReady = await TripLLMReady.findOne({ tripId })
      .populate('metaPickIds');
    
    if (!tripLLMReady) {
      throw new Error(`TripLLMReady not found for trip ${tripId}`);
    }
    
    return tripLLMReady;
    
  } catch (error) {
    console.error(`❌ Error getting LLM-ready data for trip ${tripId}:`, error);
    throw error;
  }
};

module.exports = {
  hydrateTripForLLM,
  hydrateAfterItineraryBuild,
  hydrateAfterSampleSelect,
  getLLMReadyData
};
