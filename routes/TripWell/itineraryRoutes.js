const express = require("express");
const router = express.Router();
const { generateItineraryFromAnchorLogic } = require("../../services/TripWell/itineraryGPTService");
const { saveTripDaysFromAngela } = require("../../services/TripWell/itinerarySaveService");

router.post("/tripwell/itinerary/:tripId", async (req, res) => {
  const { tripId } = req.params;

  try {
    const itineraryText = await generateItineraryFromAnchorLogic(tripId);
    const savedCount = await saveTripDaysFromAngela(tripId, itineraryText);

    res.status(200).json({
      message: `Itinerary generated and saved.`,
      daysSaved: savedCount
    });
  } catch (err) {
    console.error("🛑 Full itinerary generation failed:", err);
    res.status(500).json({ error: "Itinerary generation and save failed." });
  }
});

module.exports = router;
