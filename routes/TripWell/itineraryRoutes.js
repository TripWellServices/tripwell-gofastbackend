const express = require("express");
const router = express.Router();

const { generateItineraryFromAnchorLogic } = require("../../services/TripWell/itineraryGPTService");
const { parseAngelaItinerary } = require("../../services/TripWell/gptitineraryparserService");
const { saveTripDaysGpt } = require("../../services/TripWell/itinerarySaveService");
const TripWellUser = require("../../models/TripWellUser");
const TripDay = require("../../models/TripWell/TripDay");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// Canonical route: POST /tripwell/itinerary/build (temporarily without auth for testing)
router.post("/itinerary/build", async (req, res) => {
  const { tripId } = req.body;

  if (!tripId) {
    return res.status(400).json({ error: "Missing tripId" });
  }

  try {
    // 🧠 Step 1: Generate raw itinerary from Angela
    const itineraryText = await generateItineraryFromAnchorLogic(tripId);

    // 🪄 Step 2: Parse into structured TripDays via Marlo
    const parsedDays = parseAngelaItinerary(itineraryText);

    if (!parsedDays || parsedDays.length === 0) {
      return res.status(500).json({ error: "Parsed itinerary is empty" });
    }

    // 💾 Step 3: Save to TripDay model (skipping Day 0)
    const daysSaved = await saveTripDaysGpt(tripId, itineraryText);

    return res.status(200).json({ daysSaved });
  } catch (err) {
    console.error("Itinerary build failure:", err);
    return res.status(500).json({ error: "Failed to build itinerary" });
  }
});

// GET /tripwell/itinerary/status/:tripId - Check if user has completed itinerary generation
router.get("/itinerary/status/:tripId", async (req, res) => {
  const { tripId } = req.params;
  
  if (!tripId) {
    return res.status(400).json({ error: "Missing tripId" });
  }

  try {
    console.log("🔍 Checking itinerary status for trip:", tripId);
    
    // Check if itinerary has been generated (TripDay records exist)
    const tripDays = await TripDay.find({ tripId: tripId }).sort({ dayIndex: 1 });
    
    if (!tripDays || tripDays.length === 0) {
      return res.status(200).json({ 
        hasCompletedItinerary: false,
        tripDays: null,
        message: "Itinerary has not been generated yet"
      });
    }
    
    // Return the saved itinerary data
    return res.status(200).json({ 
      hasCompletedItinerary: true,
      tripDays: tripDays,
      totalDays: tripDays.length,
      message: "Itinerary has been generated"
    });
    
  } catch (err) {
    console.error("🔥 Error checking itinerary status:", err);
    return res.status(500).json({ error: "Failed to check itinerary status" });
  }
});

module.exports = router;