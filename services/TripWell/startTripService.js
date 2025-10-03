// services/startTripService.js
const ItineraryDays = require("../../models/TripWell/ItineraryDays");
const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

/*
  Start Trip Service
  
  When user clicks "Start My Trip":
  1. Find ItineraryDays (source of truth)
  2. Duplicate to TripCurrentDays (live editable version)
  3. Set tripStartedAt timestamp
  4. Mark as active
*/

const startTrip = async (tripId, userId) => {
  try {
    console.log(`🚀 Starting trip ${tripId} for user ${userId}`);
    
    // Check if TripCurrentDays already exists (trip already started)
    const existingTripCurrentDays = await TripCurrentDays.findOne({ 
      tripId, 
      userId 
    });
    
    if (existingTripCurrentDays) {
      console.log(`⚠️ Trip ${tripId} already started, updating timestamp`);
      existingTripCurrentDays.tripStartedAt = new Date();
      existingTripCurrentDays.isActive = true;
      await existingTripCurrentDays.save();
      return existingTripCurrentDays;
    }
    
    // Find the source of truth itinerary
    const itineraryDays = await ItineraryDays.findOne({ 
      tripId, 
      userId 
    });
    
    if (!itineraryDays) {
      throw new Error(`No itinerary found for trip ${tripId}`);
    }
    
    // Duplicate ItineraryDays → TripCurrentDays
    const tripCurrentDays = new TripCurrentDays({
      tripId: itineraryDays.tripId,
      userId: itineraryDays.userId,
      currentDay: 0, // Start at day 0
      totalDays: itineraryDays.parsedDays.length,
      days: itineraryDays.parsedDays.map(day => ({
        dayIndex: day.dayIndex,
        summary: day.summary,
        blocks: {
          morning: day.blocks.morning,
          afternoon: day.blocks.afternoon,
          evening: day.blocks.evening
        },
        isComplete: false, // No days completed yet
        userModifications: [] // No modifications yet
      })),
      tripStartedAt: new Date(),
      tripCompletedAt: null,
      isActive: true
    });
    
    await tripCurrentDays.save();
    console.log(`✅ Trip ${tripId} started - TripCurrentDays created: ${tripCurrentDays._id}`);
    
    return tripCurrentDays;
    
  } catch (error) {
    console.error(`❌ Error starting trip ${tripId}:`, error);
    throw error;
  }
};

module.exports = {
  startTrip
};
