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
    // 🧠 Step 1: Generate itinerary from Angela service
    const itineraryResult = await generateItineraryFromMetaLogic(tripId, userId, selectedMetas, selectedSamples);
    
    let parsedDays;
    
    // Try JSON first (new structured format)
    if (itineraryResult.structuredData) {
      parsedDays = itineraryResult.structuredData.days;
      console.log("✅ Using structured JSON from Angela");
    } else {
      // Fall back to text parser (legacy format)
      parsedDays = parseAngelaItinerary(itineraryResult);
      console.log("✅ Using text parser fallback");
    }

    if (!parsedDays || parsedDays.length === 0) {
      return res.status(500).json({ error: "Angela returned empty itinerary" });
    }

    // 💾 Step 3: Save to ItineraryDays (source of truth)
    const itineraryDays = new ItineraryDays({
      tripId,
      userId,
      rawItineraryText: rawText,
      parsedDays: parsedDays.map(day => ({
        dayIndex: day.dayIndex,
        summary: day.summary,
        blocks: {
          morning: {
            activity: day.blocks.morning.activity,
            type: day.blocks.morning.type,
            persona: day.blocks.morning.persona,
            budget: day.blocks.morning.budget
          },
          afternoon: {
            activity: day.blocks.afternoon.activity,
            type: day.blocks.afternoon.type,
            persona: day.blocks.afternoon.persona,
            budget: day.blocks.afternoon.budget
          },
          evening: {
            activity: day.blocks.evening.activity,
            type: day.blocks.evening.type,
            persona: day.blocks.evening.persona,
            budget: day.blocks.evening.budget
          }
        }
      })),
      aiPrompt: "Generated from meta logic with structured JSON",
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