// services/tripCompletionService.js
const TripBase = require("../../models/TripWell/TripBase");
const TripComplete = require("../../models/TripWell/TripComplete");
const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

/*
  Trip Completion Service
  
  When a trip is completed:
  1. Copy all data from TripBase to TripComplete
  2. Add completion metadata
  3. Clear TripBase for next trip
  4. Archive TripCurrentDays
*/

const completeTrip = async (tripId, userId, completionReason = "completed") => {
  try {
    console.log(`🎉 Completing trip ${tripId} for user ${userId}`);
    
    // Get the current trip data
    const trip = await TripBase.findById(tripId);
    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }
    
    // Get trip current days data
    const tripCurrentDays = await TripCurrentDays.findOne({ tripId });
    
    // Create TripComplete record
    const tripComplete = new TripComplete({
      originalTripId: tripId,
      joinCode: trip.joinCode,
      tripName: trip.tripName,
      purpose: trip.purpose,
      startDate: trip.startDate,
      endDate: trip.endDate,
      arrivalTime: trip.arrivalTime,
      city: trip.city,
      country: trip.country,
      cityId: trip.cityId,
      partyCount: trip.partyCount,
      whoWith: trip.whoWith,
      season: trip.season,
      daysTotal: trip.daysTotal,
      tripStartedByOriginator: trip.tripStartedByOriginator,
      tripStartedByParticipant: trip.tripStartedByParticipant,
      tripStartedAt: tripCurrentDays?.tripStartedAt || null,
      tripCompletedAt: new Date(),
      originatorId: trip.originatorId,
      participantId: trip.participantId,
      completionReason
    });
    
    await tripComplete.save();
    console.log(`✅ Trip archived to TripComplete: ${tripComplete._id}`);
    
    // Clear TripBase for next trip (keep the record but reset for reuse)
    await TripBase.findByIdAndUpdate(tripId, {
      $set: {
        tripStartedByOriginator: false,
        tripStartedByParticipant: false
      }
    });
    
    // Archive TripCurrentDays (mark as inactive)
    if (tripCurrentDays) {
      await TripCurrentDays.findByIdAndUpdate(tripCurrentDays._id, {
        $set: {
          isActive: false,
          tripCompletedAt: new Date()
        }
      });
    }
    
    console.log(`🎉 Trip ${tripId} completed and archived successfully`);
    return tripComplete;
    
  } catch (error) {
    console.error(`❌ Error completing trip ${tripId}:`, error);
    throw error;
  }
};

module.exports = {
  completeTrip
};
