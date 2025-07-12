const express = require("express");
const router = express.Router();
const axios = require("axios");

const { generateItineraryFromAnchorLogic } = require("../../services/TripWell/itineraryGPTService");
const { parseAngelaItinerary } = require("../../services/TripWell/gptItineraryParserService");
const { saveTripDaysGpt } = require("../../services/TripWell/itinerarySaveService");

async function verifyUserTrip(req, res, next) {
  try {
    const whoami = await axios.get("http://localhost:3000/tripwell/whoami", { headers: req.headers });
    const tripStatusResp = await axios.get("http://localhost:3000/tripwell/tripstatus", { headers: req.headers });

    const user = whoami.data.user;
    const tripStatus = tripStatusResp.data.tripStatus;

    if (!user || !tripStatus?.tripId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (user.role !== "originator") {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.tripId = tripStatus.tripId;
    next();
  } catch (err) {
    console.error("Auth verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

router.post("/tripwell/itinerary/build", verifyUserTrip, async (req, res) => {
  const tripId = req.tripId;

  try {
    const itineraryText = await generateItineraryFromAnchorLogic(tripId);
    const tripDays = parseAngelaItinerary(itineraryText);

    if (!tripDays || tripDays.length === 0) {
      return res.status(500).json({ error: "Parsed itinerary is empty" });
    }

    const daysSaved = await saveTripDaysGpt(tripId, itineraryText);

    return res.status(200).json({ daysSaved });
  } catch (err) {
    console.error("Itinerary build failure:", err);
    return res.status(500).json({ error: "Failed to build itinerary" });
  }
});

module.exports = router;
