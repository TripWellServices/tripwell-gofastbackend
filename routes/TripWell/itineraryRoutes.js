const express = require("express");
const router = express.Router();

const { generateItineraryFromAnchorLogic } = require("../../services/TripWell/itineraryGPTService"); // Angela
const { parseAngelaItinerary } = require("../../services/TripWell/gptItineraryParserService");      // Marlo
const TripDay = require("../../models/TripWell/TripDay");                                            // Model save

router.post("/tripwell/itinerary/:tripId", async (req, res) => {
  const { tripId } = req.params;

  try {
    // 🧠 Step 1: Angela builds the raw itinerary string
    const itineraryText = await generateItineraryFromAnchorLogic(tripId);

    // 🪄 Step 2: Marlo parses it into structured TripDays
    const tripDays = parseAngelaItinerary(itineraryText, tripId);

    if (!tripDays || tripDays.length === 0) {
      throw new Error("Parsed TripDays array is empty.");
    }

    // 💾 Step 3: Clean slate + insert new TripDays
    await TripDay.deleteMany({ tripId });
    const created = await TripDay.insertMany(tripDays);

    res.status(200).json({
      message: `Itinerary generated, parsed, and saved successfully.`,
      daysSaved: created.length
    });

  } catch (err) {
    console.error("🛑 Itinerary full stack failure:", err);
    res.status(500).json({ error: "Itinerary generation and save failed." });
  }
});

module.exports = router;
