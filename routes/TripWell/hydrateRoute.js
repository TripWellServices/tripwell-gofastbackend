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
        anchorLogicData: null,
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
        anchorLogicData: null,
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

    // Get related data in parallel using OG pattern
    console.log("🔍 Querying for tripId:", trip._id.toString());
    const [tripIntent, anchorLogic, tripDays] = await Promise.all([
      // ✅ FIX: Use OG pattern - just tripId
      TripIntent.findOne({ tripId: trip._id }).catch((err) => {
        console.log("❌ TripIntent query error:", err);
        return null;
      }),
      AnchorLogic.findOne({ tripId: trip._id }).catch(() => null),
      TripDay.find({ tripId: trip._id }).sort({ dayIndex: 1 }).catch(() => [])
    ]);
    
    // Use the found TripIntent (ObjectId pattern is now correct)
    let finalTripIntent = tripIntent;
    
    console.log("🔍 TripIntent found:", !!finalTripIntent);
    if (finalTripIntent) {
      console.log("🔍 TripIntent data:", {
        tripId: finalTripIntent.tripId,
        priorities: finalTripIntent.priorities,
        mobility: finalTripIntent.mobility,
        travelPace: finalTripIntent.travelPace
      });
    }

    // Build tripIntentData
    let tripIntentData = null;
    if (finalTripIntent) {
      console.log("🔍 Raw TripIntent from DB:", {
        _id: finalTripIntent._id,
        tripId: finalTripIntent.tripId,
        userId: finalTripIntent.userId,
        priorities: finalTripIntent.priorities,
        vibes: finalTripIntent.vibes,
        mobility: finalTripIntent.mobility,
        travelPace: finalTripIntent.travelPace,
        budget: finalTripIntent.budget
      });
      
      tripIntentData = {
        tripIntentId: finalTripIntent._id,
        priorities: Array.isArray(finalTripIntent.priorities) ? finalTripIntent.priorities : [],
        vibes: Array.isArray(finalTripIntent.vibes) ? finalTripIntent.vibes : [],
        mobility: Array.isArray(finalTripIntent.mobility) ? finalTripIntent.mobility : [],
        travelPace: Array.isArray(finalTripIntent.travelPace) ? finalTripIntent.travelPace : [],
        budget: finalTripIntent.budget || ""
      };
      
      console.log("🔍 Built tripIntentData:", tripIntentData);
    }

    // Build anchorLogicData from AnchorLogic (the REAL model)
    let anchorLogicData = null;
    if (anchorLogic && anchorLogic.enrichedAnchors && anchorLogic.enrichedAnchors.length > 0) {
      // ✅ FIX: Extract titles from enrichedAnchors[].title (the REAL data)
      const anchorTitles = anchorLogic.enrichedAnchors.map(anchor => anchor.title);
      anchorLogicData = {
        anchors: anchorTitles
      };
      console.log("🔍 Built anchorLogicData from AnchorLogic model:", anchorLogicData);
      console.log("🔍 Found", anchorTitles.length, "anchor titles:", anchorTitles);
    } else {
      console.log("🔍 No AnchorLogic data found or enrichedAnchors is empty");
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
    } else {
      // Even if no tripDays, still return basic itinerary data
      itineraryData = {
        itineraryId: trip._id.toString(),
        tripId: trip._id.toString(),
        tripName: trip.tripName,
        city: trip.city,
        daysTotal: trip.daysTotal,
        days: []
      };
    }

    const response = {
      userData,
      tripData,
      tripIntentData,
      anchorLogicData,
      itineraryData
    };

    console.log("✅ Hydration complete:", {
      hasUserData: !!userData,
      hasTripData: !!tripData,
      hasTripIntentData: !!tripIntentData,
      hasAnchorLogicData: !!anchorLogicData,
      hasItineraryData: !!itineraryData,
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
