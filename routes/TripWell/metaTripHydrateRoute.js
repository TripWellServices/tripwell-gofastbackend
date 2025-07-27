// routes/TripWell/metaTripHydrateRoute.js

const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// GET /tripwell/tripmeta/:tripId
router.get("/tripmeta/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({ error: "Trip ID is required" });
    }

    const trip = await TripBase.findById(tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const { tripName, city, startDate, endDate } = trip;

    return res.status(200).json({
      tripId: trip._id, // alias
      tripName,
      city,
      startDate,
      endDate
    });
  } catch (err) {
    console.error("❌ TripMeta hydrate failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
