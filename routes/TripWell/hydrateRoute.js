const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripIntent = require("../../models/TripWell/TripIntent");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const TripDay = require("../../models/TripWell/TripDay");

// 🔐 GET /tripwell/hydrate
// Description: Returns all localStorage data for the authenticated user
// Simple, direct database queries - no TripExtra complexity
router.get("/hydrate", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("🔄 GET /tripwell/hydrate - Simple data flush");
    const firebaseId = req.user.uid;
    
    // Get user data
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build userData
    const userData = {
      firebaseId: user.firebaseId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hometownCity: user.hometownCity,
      state: user.state,
      profileComplete: user.profileComplete || false,
      role: user.role || "noroleset"
    };

    console.log("🔍 User data:", { 
      firebaseId: user.firebaseId, 
      role: user.role, 
      tripId: user.tripId 
    });

    // If no trip, return just user data
    if (!user.tripId) {
      console.log("✅ No trip found, returning user data only");
      return res.json({
        userData,
        tripData: null,
        tripIntentData: null,
        anchorSelectData: null,
        itineraryData: null
      });
    }

    // Get trip data
    const trip = await TripBase.findById(user.tripId);
    if (!trip) {
      console.log("⚠️ Trip not found, returning user data only");
      return res.json({
        userData,
        tripData: null,
        tripIntentData: null,
        anchorSelectData: null,
        itineraryData: null
      });
    }

    // Build tripData with computed values
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

    console.log("🔍 Trip data:", { 
      tripId: trip._id, 
      season: trip.season, 
      daysTotal: trip.daysTotal 
    });

    // Get related data in parallel
    console.log("🔍 Querying for tripId:", trip._id.toString(), "userId:", firebaseId);
    const [tripIntent, anchorLogic, tripDays] = await Promise.all([
      TripIntent.findOne({ tripId: trip._id, userId: firebaseId }).catch(() => null),
      AnchorLogic.findOne({ tripId: trip._id }).catch(() => null),
      TripDay.find({ tripId: trip._id }).sort({ dayIndex: 1 }).catch(() => [])
    ]);
    
    console.log("🔍 TripIntent found:", !!tripIntent);
    if (tripIntent) {
      console.log("🔍 TripIntent data:", {
        tripId: tripIntent.tripId,
        priorities: tripIntent.priorities,
        mobility: tripIntent.mobility,
        travelPace: tripIntent.travelPace
      });
    }

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
        itineraryId: trip._id.toString(), // Use real tripId as itineraryId
        tripId: trip._id.toString(),
        tripName: trip.tripName,
        city: trip.city,
        daysTotal: trip.daysTotal,
        days: tripDays.map(day => ({
          dayIndex: day.dayIndex,
          summary: day.summary,
          blocks: day.blocks || {}
        }))
      };
    }

    const response = {
      userData,
      tripData,
      tripIntentData,
      anchorSelectData,
      itineraryData
    };

    console.log("✅ Hydration complete:", {
      hasUserData: !!userData,
      hasTripData: !!tripData,
      tripSeason: tripData.season,
      tripDaysTotal: tripData.daysTotal,
      userRole: userData.role
    });

    res.set("Cache-Control", "no-store");
    return res.json(response);

  } catch (err) {
    console.error("❌ Hydration failed:", err);
    return res.status(500).json({ error: "Failed to hydrate data" });
  }
});

module.exports = router;
