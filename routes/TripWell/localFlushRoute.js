const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripIntent = require("../../models/TripWell/TripIntent");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const TripDay = require("../../models/TripWell/TripDay");

// 🔐 GET /tripwell/localflush
// Description: Returns all localStorage data for the authenticated user
// This is a one-stop shop for frontend localStorage hydration
router.get("/localflush", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("🔄 GET /tripwell/localflush - Flushing all data for localStorage");
    const firebaseId = req.user.uid;
    
    // Get user data
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build userData object
    const userData = {
      firebaseId: user.firebaseId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hometownCity: user.hometownCity,
      state: user.state,
      profileComplete: user.profileComplete || false
    };

    // Check if user has a trip
    if (!user.tripId) {
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
      return res.json({
        userData,
        tripData: null,
        tripIntentData: null,
        anchorSelectData: null,
        itineraryData: null
      });
    }

    // Build tripData object
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
      startedTrip: trip.startedTrip || false,
      tripComplete: trip.tripComplete || false
    };

    // Get all related data in parallel
    const [tripIntent, anchorLogic, tripDays] = await Promise.all([
      TripIntent.findOne({ tripId: trip._id }),
      AnchorLogic.findOne({ tripId: trip._id }),
      TripDay.find({ tripId: trip._id }).sort({ dayIndex: 1 })
    ]);

    // Build tripIntentData object
    let tripIntentData = null;
    if (tripIntent) {
      tripIntentData = {
        tripIntentId: tripIntent._id,
        priorities: tripIntent.priorities ? tripIntent.priorities.split(',') : [],
        vibes: tripIntent.vibes ? tripIntent.vibes.split(',') : [],
        budget: tripIntent.budget || ""
      };
    }

    // Build anchorSelectData object
    let anchorSelectData = null;
    if (anchorLogic) {
      anchorSelectData = {
        anchors: anchorLogic.anchorTitles || []
      };
    }

    // Build itineraryData object
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

    // Return all data in localStorage format
    const localStorageData = {
      userData,
      tripData,
      tripIntentData,
      anchorSelectData,
      itineraryData
    };

    console.log("✅ LocalStorage flush complete:", {
      hasUserData: !!userData,
      hasTripData: !!tripData,
      hasTripIntentData: !!tripIntentData,
      hasAnchorSelectData: !!anchorSelectData,
      hasItineraryData: !!itineraryData
    });

    res.set("Cache-Control", "no-store");
    return res.json(localStorageData);

  } catch (err) {
    console.error("❌ LocalStorage flush failed:", err);
    return res.status(500).json({ error: "Failed to flush localStorage data" });
  }
});

module.exports = router;
