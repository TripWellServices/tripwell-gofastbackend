const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripIntent = require("../../models/TripWell/TripIntent");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const TripDay = require("../../models/TripWell/TripDay");
const TripParse = require("../../models/TripWell/TripParse");

class TripParseService {
  // 🔍 Validate what data is missing for a user and store in TripParse model
  async validateUserData(firebaseId) {
    try {
      // 1. Check if user exists
      const user = await TripWellUser.findOne({ firebaseId });
      if (!user) {
        return this.createOrUpdateTripParse(firebaseId, null, {
          isValid: false,
          missingData: ["user"],
          validationResults: {
            user: { exists: false, message: "User not found" }
          }
        });
      }

      // 2. Check if user has tripId (backend flow)
      if (user.tripId) {
        return this.validateBackendFlow(firebaseId, user);
      } else {
        // 3. No tripId - this could be frontend-only flow
        return this.createOrUpdateTripParse(firebaseId, null, {
          isValid: false,
          missingData: ["trip"],
          validationResults: {
            user: { 
              exists: true, 
              profileComplete: user.profileComplete || false,
              hasName: !!(user.firstName && user.lastName),
              hasHometown: !!user.hometownCity
            },
            trip: { exists: false, message: "No trip associated with user (frontend-only flow possible)" }
          }
        });
      }

    } catch (error) {
      console.error("❌ TripParse validation error:", error);
      return this.createOrUpdateTripParse(firebaseId, null, {
        isValid: false,
        missingData: ["validation_error"],
        validationResults: { error: { message: error.message } }
      });
    }
  }

  // 🔄 Validate backend flow (trip exists in database)
  async validateBackendFlow(firebaseId, user) {
    const trip = await TripBase.findById(user.tripId);
    if (!trip) {
      return this.createOrUpdateTripParse(firebaseId, user.tripId, {
        isValid: false,
        missingData: ["trip"],
        validationResults: {
          user: { 
            exists: true, 
            profileComplete: user.profileComplete || false,
            hasName: !!(user.firstName && user.lastName),
            hasHometown: !!user.hometownCity
          },
          trip: { exists: false, message: "Trip not found" }
        }
      });
    }

    // Get all related data in parallel
    const [tripIntent, anchorLogic, tripDays] = await Promise.all([
      TripIntent.findOne({ tripId: trip._id }).catch(() => null),
      AnchorLogic.findOne({ tripId: trip._id }).catch(() => null),
      TripDay.find({ tripId: trip._id }).sort({ dayIndex: 1 }).catch(() => [])
    ]);

    // Build validation results
    const validationResults = {
      user: { 
        exists: true, 
        profileComplete: user.profileComplete || false,
        hasName: !!(user.firstName && user.lastName),
        hasHometown: !!user.hometownCity
      },
      trip: {
        exists: true,
        hasName: !!trip.tripName,
        hasCity: !!trip.city,
        hasDates: !!(trip.startDate && trip.endDate),
        hasPurpose: !!trip.purpose,
        hasWhoWith: Array.isArray(trip.whoWith) && trip.whoWith.length > 0,
        hasSeason: !!trip.season,
        hasDaysTotal: !!trip.daysTotal
      },
      tripIntent: {
        exists: !!tripIntent,
        hasPriorities: Array.isArray(tripIntent?.priorities) && tripIntent.priorities.length > 0,
        hasVibes: Array.isArray(tripIntent?.vibes) && tripIntent.vibes.length > 0,
        hasMobility: Array.isArray(tripIntent?.mobility) && tripIntent.mobility.length > 0,
        hasTravelPace: Array.isArray(tripIntent?.travelPace) && tripIntent.travelPace.length > 0,
        hasBudget: !!tripIntent?.budget
      },
      anchorLogic: {
        exists: !!anchorLogic,
        hasAnchors: Array.isArray(anchorLogic?.anchorTitles) && anchorLogic.anchorTitles.length > 0
      },
      tripDays: {
        exists: tripDays && tripDays.length > 0,
        count: tripDays?.length || 0,
        hasSummaries: tripDays?.every(day => !!day.summary) || false,
        expectedCount: trip.daysTotal || 0
      }
    };

    // Determine what's missing
    const missingData = [];
    if (!validationResults.tripIntent.exists) missingData.push("tripIntent");
    if (!validationResults.anchorLogic.exists) missingData.push("anchorLogic");
    if (!validationResults.tripDays.exists) missingData.push("tripDays");

    const isValid = missingData.length === 0;

    // Store in TripParse model
    return this.createOrUpdateTripParse(firebaseId, trip._id, {
      isValid,
      missingData,
      validationResults
    });
  }

  // 🔍 Validate frontend-only flow (trip data in localStorage but not in DB)
  async validateFrontendFlow(firebaseId, localStorageData) {
    try {
      const user = await TripWellUser.findOne({ firebaseId });
      if (!user) {
        return {
          isValid: false,
          missingData: ["user"],
          validationResults: { user: { exists: false, message: "User not found" } },
          summary: ["❌ User not found in database"]
        };
      }

      // Build validation results from localStorage data
      const validationResults = {
        user: { 
          exists: true, 
          profileComplete: user.profileComplete || false,
          hasName: !!(user.firstName && user.lastName),
          hasHometown: !!user.hometownCity
        },
        trip: {
          exists: !!localStorageData.tripData,
          hasName: !!localStorageData.tripData?.tripName,
          hasCity: !!localStorageData.tripData?.city,
          hasDates: !!(localStorageData.tripData?.startDate && localStorageData.tripData?.endDate),
          hasPurpose: !!localStorageData.tripData?.purpose,
          hasWhoWith: Array.isArray(localStorageData.tripData?.whoWith) && localStorageData.tripData.whoWith.length > 0,
          hasSeason: !!localStorageData.tripData?.season,
          hasDaysTotal: !!localStorageData.tripData?.daysTotal
        },
        tripIntent: {
          exists: !!localStorageData.tripIntentData,
          hasPriorities: Array.isArray(localStorageData.tripIntentData?.priorities) && localStorageData.tripIntentData.priorities.length > 0,
          hasVibes: Array.isArray(localStorageData.tripIntentData?.vibes) && localStorageData.tripIntentData.vibes.length > 0,
          hasMobility: Array.isArray(localStorageData.tripIntentData?.mobility) && localStorageData.tripIntentData.mobility.length > 0,
          hasTravelPace: Array.isArray(localStorageData.tripIntentData?.travelPace) && localStorageData.tripIntentData.travelPace.length > 0,
          hasBudget: !!localStorageData.tripIntentData?.budget
        },
        anchorLogic: {
          exists: !!localStorageData.anchorSelectData,
          hasAnchors: Array.isArray(localStorageData.anchorSelectData?.anchors) && localStorageData.anchorSelectData.anchors.length > 0
        },
        tripDays: {
          exists: localStorageData.itineraryData && localStorageData.itineraryData.days && localStorageData.itineraryData.days.length > 0,
          count: localStorageData.itineraryData?.days?.length || 0,
          hasSummaries: localStorageData.itineraryData?.days?.every(day => !!day.summary) || false,
          expectedCount: localStorageData.tripData?.daysTotal || 0
        }
      };

      // Determine what's missing
      const missingData = [];
      if (!validationResults.trip.exists) missingData.push("trip");
      if (!validationResults.tripIntent.exists) missingData.push("tripIntent");
      if (!validationResults.anchorLogic.exists) missingData.push("anchorLogic");
      if (!validationResults.tripDays.exists) missingData.push("tripDays");

      const isValid = missingData.length === 0;

      // For frontend-only flow, we don't save to TripParse model since trip doesn't exist in DB yet
      return {
        isValid,
        missingData,
        validationResults,
        summary: this.generateSummary(missingData),
        flow: "frontend-only"
      };

    } catch (error) {
      console.error("❌ TripParse frontend validation error:", error);
      return {
        isValid: false,
        missingData: ["validation_error"],
        validationResults: { error: { message: error.message } },
        summary: ["❌ Validation error occurred"]
      };
    }
  }

  // 📝 Generate human-readable summary
  generateSummary(missingData) {
    if (missingData.length === 0) {
      return ["✅ All data present and valid"];
    }
    
    const summary = [];
    if (missingData.includes("user")) summary.push("❌ User not found in database");
    if (missingData.includes("trip")) summary.push("❌ Trip data missing");
    if (missingData.includes("tripIntent")) summary.push("❌ Trip intent data missing (priorities, vibes, etc.)");
    if (missingData.includes("anchorLogic")) summary.push("❌ Anchor selection data missing");
    if (missingData.includes("tripDays")) summary.push("❌ Trip itinerary days missing");
    
    return summary;
  }

  // 💾 Create or update TripParse model
  async createOrUpdateTripParse(firebaseId, tripId, validationData) {
    try {
      let tripParse = await TripParse.findOne({ userId: firebaseId, tripId });
      
      if (!tripParse) {
        tripParse = new TripParse({
          userId: firebaseId,
          tripId: tripId,
          ...validationData,
          lastValidated: new Date()
        });
      } else {
        // Update existing record
        tripParse.isValid = validationData.isValid;
        tripParse.missingData = validationData.missingData;
        tripParse.validationResults = validationData.validationResults;
        tripParse.lastValidated = new Date();
      }

      await tripParse.save();

      return {
        isValid: tripParse.isValid,
        missingData: tripParse.missingData,
        validationResults: tripParse.validationResults,
        summary: tripParse.getSummary(),
        flow: "backend"
      };

    } catch (error) {
      console.error("❌ TripParse save error:", error);
      return {
        isValid: false,
        missingData: ["validation_error"],
        validationResults: { error: { message: error.message } },
        summary: ["❌ Validation error occurred"]
      };
    }
  }

  // 🔍 Quick check - just get stored validation from TripParse model
  async getStoredValidation(firebaseId, tripId) {
    try {
      const tripParse = await TripParse.findOne({ userId: firebaseId, tripId });
      
      if (!tripParse) {
        return null; // No stored validation
      }

      return {
        isValid: tripParse.isValid,
        missingData: tripParse.missingData,
        validationResults: tripParse.validationResults,
        summary: tripParse.getSummary(),
        lastValidated: tripParse.lastValidated,
        flow: "backend"
      };

    } catch (error) {
      console.error("❌ TripParse getStoredValidation error:", error);
      return null;
    }
  }

  // 🔄 Get complete localStorage data (original hydrate logic)
  async getLocalStorageData(firebaseId) {
    try {
      const user = await TripWellUser.findOne({ firebaseId });
      if (!user) {
        return { error: "User not found" };
      }

      // Build userData
      const userData = {
        firebaseId: user.firebaseId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hometownCity: user.hometownCity,
        state: user.state,
        profileComplete: user.profileComplete || false
      };

      if (!user.tripId) {
        return {
          userData,
          tripData: null,
          tripIntentData: null,
          anchorSelectData: null,
          itineraryData: null
        };
      }

      const trip = await TripBase.findById(user.tripId);
      if (!trip) {
        return {
          userData,
          tripData: null,
          tripIntentData: null,
          anchorSelectData: null,
          itineraryData: null
        };
      }

      // Build tripData
      const tripData = {
        tripId: trip._id,
        tripName: trip.tripName,
        purpose: trip.purpose,
        startDate: trip.startDate,
        endDate: trip.endDate,
        city: trip.city,
        joinCode: trip.joinCode,
        whoWith: trip.whoWith || [],
        partyCount: trip.partyCount,
        season: trip.season,
        daysTotal: trip.daysTotal,
        startedTrip: trip.startedTrip || false,
        tripComplete: trip.tripComplete || false
      };

      // Get related data
      const [tripIntent, anchorLogic, tripDays] = await Promise.all([
        TripIntent.findOne({ tripId: trip._id }).catch(() => null),
        AnchorLogic.findOne({ tripId: trip._id }).catch(() => null),
        TripDay.find({ tripId: trip._id }).sort({ dayIndex: 1 }).catch(() => [])
      ]);

      // Build tripIntentData
      let tripIntentData = null;
      if (tripIntent) {
        tripIntentData = {
          tripIntentId: tripIntent._id,
          priorities: Array.isArray(tripIntent.priorities) ? tripIntent.priorities : [],
          vibes: Array.isArray(tripIntent.vibes) ? tripIntent.vibes : [],
          mobility: Array.isArray(tripIntent.mobility) ? tripIntent.mobility : [],
          travelPace: Array.isArray(tripIntent.travelPace) ? tripIntent.travelPace : [],
          budget: tripIntent.budget || ""
        };
      }

      // Build anchorSelectData
      let anchorSelectData = null;
      if (anchorLogic) {
        anchorSelectData = {
          anchors: anchorLogic.anchorTitles || []
        };
      }

      // Build itineraryData
      let itineraryData = null;
      if (tripDays && tripDays.length > 0) {
        itineraryData = {
          itineraryId: "generated-from-backend",
          days: tripDays.map(day => ({
            dayIndex: day.dayIndex,
            summary: day.summary
          }))
        };
      }

      return {
        userData,
        tripData,
        tripIntentData,
        anchorSelectData,
        itineraryData
      };

    } catch (error) {
      console.error("❌ TripParse getLocalStorageData error:", error);
      return { error: "Failed to get localStorage data" };
    }
  }
}

module.exports = new TripParseService();
