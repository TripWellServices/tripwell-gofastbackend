const express = require("express");
const router = express.Router();

const { generateItineraryFromMetaLogic } = require("../../services/TripWell/itineraryGPTService");
const { parseAngelaItinerary } = require("../../services/TripWell/gptItineraryparserService");
const ItineraryDays = require("../../models/TripWell/ItineraryDays");
const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

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

    // 💾 Step 3: Save to ItineraryDays (source of truth)
    const itineraryDays = new ItineraryDays({
      tripId,
      userId,
      rawItineraryText: itineraryText,
      parsedDays: parsedDays.map(day => ({
        dayIndex: day.dayIndex,
        summary: day.summary,
        blocks: day.blocks
      })),
      aiPrompt: "Generated from meta logic",
      aiModel: "gpt-4"
    });

    await itineraryDays.save();

    // 🚀 Step 4: Create TripCurrentDays for live trip (copies from ItineraryDays)
    const tripCurrentDays = new TripCurrentDays({
      tripId,
      userId,
      currentDay: 1,
      totalDays: parsedDays.length,
      days: parsedDays.map(day => ({
        dayIndex: day.dayIndex,
        summary: day.summary,
        blocks: day.blocks,
        isComplete: false,
        userModifications: []
      }))
    });

    await tripCurrentDays.save();

    return res.status(200).json({ 
      message: "Itinerary built successfully with bifurcated models!",
      itineraryDaysId: itineraryDays._id,
      tripCurrentDaysId: tripCurrentDays._id,
      totalDays: parsedDays.length,
      selectedMetas: selectedMetas.length,
      selectedSamples: selectedSamples.length
    });
  } catch (err) {
    console.error("Itinerary build failure:", err);
    return res.status(500).json({ error: "Failed to build itinerary" });
  }
});

module.exports = router;