const express = require("express");
const path = require("path");
const router = express.Router();

const TripBase = require(path.resolve(__dirname, "../../models/TripWell/TripBase"));
const User = require(path.resolve(__dirname, "../../models/GoFast/User"));

// POST /tripwell/validatejoincode
router.post("/tripwell/validatejoincode", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Join code is required" });
  }

  try {
    const joinCode = code.trim().toLowerCase();
    const trip = await TripBase.findOne({ joinCode });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const originator = await User.findOne({
      tripId: trip._id,
      role: "originator",
    });

    const creatorFirstName = originator?.name?.split(" ")[0] || "Trip lead";

    return res.json({
      tripId: trip._id,
      tripName: trip.tripName,
      city: trip.city,
      startDate: trip.startDate,
      endDate: trip.endDate,
      creatorFirstName,
    });
  } catch (err) {
    console.error("❌ Error validating join code:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
