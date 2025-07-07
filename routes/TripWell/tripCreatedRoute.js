// routes/TripWell/tripCreatedRoute.js

const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// GET /tripwell/tripcreated/:tripId
router.get("/tripcreated/:tripId", async (req, res) => {
  try {
    const tripId = req.params.tripId;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await TripBase.findById(tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    return res.status(200).json({ trip });
  } catch (err) {
    console.error("❌ TripCreated route failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
