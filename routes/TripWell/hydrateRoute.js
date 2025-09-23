const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripPersona = require("../../models/TripWell/TripPersona");
const TripItinerary = require("../../models/TripWell/TripItinerary");
const UserSelections = require("../../models/TripWell/UserSelections");
const SampleSelects = require("../../models/TripWell/SampleSelects");

// 🔐 GET /tripwell/hydrate
// Description: Load all data for the authenticated user
router.get("/hydrate", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("🔄 GET /tripwell/hydrate - Loading all data");
    const firebaseId = req.user.uid;
    
    // Get user data
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) {
      console.log("🔍 No user found for firebaseId:", firebaseId);
      return res.status(200).json({ 
        message: "No users to load - please sign up first!",
        isNewUser: true,
        userData: null,
        tripData: null,
        tripPersonaData: null,
        itineraryData: null
      });
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

    // If no trip, return just user data
    if (!user.tripId) {
      console.log("✅ No trip found, returning user data only");
      return res.json({
        userData,
        tripData: null,
        tripPersonaData: null,
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
        tripPersonaData: null,
        itineraryData: null
      });
    }

    // Build tripData
    const tripData = {
      tripId: trip._id.toString(),
      tripName: trip.tripName,
      city: trip.city,
      startDate: trip.startDate,
      endDate: trip.endDate,
      daysTotal: trip.daysTotal,
      season: trip.season,
      purpose: trip.purpose,
      whoWith: trip.whoWith,
      tripComplete: trip.tripComplete || false,
      startedTrip: trip.startedTrip || false
    };

    // Get trip persona data
    const tripPersona = await TripPersona.findOne({ tripId: user.tripId, userId: user._id.toString() });
    const tripPersonaData = tripPersona || null;

    // Get itinerary data
    const itinerary = await TripItinerary.findOne({ tripId: user.tripId });
    const itineraryData = itinerary || null;

    // Get meta selections (UserSelections)
    const metaSelections = await UserSelections.findOne({ tripId: user.tripId, userId: user._id.toString() });
    const selectedMetas = metaSelections?.selectedMetas || [];

    // Get sample selections (SampleSelects)
    const sampleSelections = await SampleSelects.findOne({ tripId: user.tripId, userId: user._id.toString() });
    const selectedSamples = sampleSelections?.selectedSamples || [];

    console.log("✅ Hydration complete:", {
      hasUserData: !!userData,
      hasTripData: !!tripData,
      hasTripPersonaData: !!tripPersonaData,
      hasItineraryData: !!itineraryData,
      hasSelectedMetas: selectedMetas.length > 0,
      hasSelectedSamples: selectedSamples.length > 0
    });

    res.json({
      userData,
      tripData,
      tripPersonaData,
      itineraryData,
      selectedMetas,
      selectedSamples
    });

  } catch (error) {
    console.error("❌ Hydration error:", error);
    res.status(500).json({ error: "Failed to load data" });
  }
});

module.exports = router;