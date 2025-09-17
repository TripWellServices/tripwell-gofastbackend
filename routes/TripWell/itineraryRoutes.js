const express = require("express");
const router = express.Router();

const { generateItineraryFromMetaLogic } = require("../../services/TripWell/itineraryGPTService");
const { parseAngelaItinerary } = require("../../services/TripWell/gptItineraryparserService");
const { saveTripDaysGpt } = require("../../services/TripWell/itinerarySaveService");

// Canonical route: POST /tripwell/itinerary/build
router.post("/tripwell/itinerary/build", async (req, res) => {
  const { tripId, userId, selectedMetas = [], selectedSamples = [] } = req.body;

  if (!tripId || !userId) {
    return res.status(400).json({ error: "Missing tripId or userId" });
  }

  try {
    // 🧠 Step 1: Generate raw itinerary from Angela with persona weights and meta integration
    const itineraryText = await generateItineraryFromMetaLogic(tripId, userId, selectedMetas, selectedSamples);

    // 🪄 Step 2: Parse into structured TripDays via Marlo (for validation)
    const parsedDays = parseAngelaItinerary(itineraryText);

    if (!parsedDays || parsedDays.length === 0) {
      return res.status(500).json({ error: "Parsed itinerary is empty" });
    }

    // 💾 Step 3: Save to TripDay model (passing raw text - service will parse again)
    const daysSaved = await saveTripDaysGpt(tripId, itineraryText);

    return res.status(200).json({ 
      daysSaved,
      message: "Itinerary built with persona weights and meta integration",
      selectedMetas: selectedMetas.length,
      selectedSamples: selectedSamples.length
    });
  } catch (err) {
    console.error("Itinerary build failure:", err);
    return res.status(500).json({ error: "Failed to build itinerary" });
  }
});

module.exports = router;