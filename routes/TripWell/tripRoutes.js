const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/userTripService");

// POST /api/trips/create
router.post("/create", async (req, res) => {
  try {
    const {
      joinCode,
      tripName,
      purpose,
      startDate,
      endDate,
      isMultiCity,
      destinations,
      firebaseId
    } = req.body;

    // Basic validation
    if (!joinCode || !tripName || !purpose || !startDate || !endDate || !firebaseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Prevent duplicate joinCode
    const existing = await TripBase.findOne({ joinCode });
    if (existing) {
      return res.status(409).json({ message: "Trip with this join code already exists" });
    }

    // Create new trip
    const newTrip = new TripBase({
      joinCode,
      tripName,
      purpose,
      startDate,
      endDate,
      isMultiCity: isMultiCity || false,
      destinations: destinations || []
    });

    await newTrip.save();

    // Link trip to user using the _id as tripId
    await setUserTrip(firebaseId, newTrip._id.toString());

    return res.status(200).json(newTrip);
  } catch (err) {
    console.error("🔥 Trip creation failed:", err);
    return res.status(500).json({ message: "Failed to create trip", error: err.message });
  }
});

module.exports = router;
