const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");

// GET all TripDays for a given tripId
router.get("/tripwell/modifydays/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const tripDays = await TripDay.find({ tripId }).sort({ dayIndex: 1 });

    res.json(tripDays);
  } catch (err) {
    console.error("Error fetching TripDay outlook:", err);
    res.status(500).json({ error: "Failed to fetch trip day outlook" });
  }
});

module.exports = router;
