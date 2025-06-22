const express = require("express");
const router = express.Router();
const { generateItineraryFromAnchorLogic } = require("../../services/TripWell/itineraryGPTService");

router.get("/itinerarygpt/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const itineraryText = await generateItineraryFromAnchorLogic(tripId);
    res.send(itineraryText); // plain text string, as expected by MVP 1
  } catch (err) {
    console.error("Error generating itinerary:", err);
    res.status(500).json({ error: "Itinerary generation failed." });
  }
});

module.exports = router;
