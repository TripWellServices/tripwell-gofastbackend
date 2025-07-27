const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// GET /tripwell/tripbase/:tripId
router.get("/tripbase/:tripId", async (req, res) => {
  const { tripId } = req.params;

  if (!tripId) {
    return res.status(400).json({ error: "Trip ID is required" });
  }

  try {
    const trip = await TripBase.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json({ trip });
  } catch (err) {
    console.error("❌ Error loading trip:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
