const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// POST /tripwell/validatejoincode
router.post("/tripwell/validatejoincode", async (req, res) => {
  try {
    const rawCode = req.body.code;

    if (!rawCode) {
      return res.status(400).json({ error: "Join code is required." });
    }

    const joinCode = rawCode.trim().toLowerCase();

    const trip = await TripBase.findOne({ joinCode });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // Optional: Replace with user lookup later if needed
    const creatorName = "Trip Owner";

    return res.status(200).json({
      tripId: trip._id,
      tripName: trip.tripName,
      creatorName,
    });

  } catch (error) {
    console.error("Error validating join code:", error);
    return res.status(500).json({ error: "Server error validating join code." });
  }
});

module.exports = router;
