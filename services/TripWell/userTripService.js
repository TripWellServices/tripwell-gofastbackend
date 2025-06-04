const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// 🛠 FIXED IMPORT — matches actual path now:
const { setUserTrip, archiveTrip } = require("../../services/TripWell/userTripService");

// POST /api/trips/create — create new trip and link to user
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

    if (!joinCode || !tripName || !purpose || !startDate || !endDate || !firebaseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await TripBase.findOne({ joinCode });
    if (existing) {
      return res.status(409).json({ message: "Trip with this join code already exists" });
    }

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

    await setUserTrip(firebaseId, newTrip._id.toString());

    return res.status(200).json(newTrip);
  } catch (err) {
    console.error("🔥 Trip creation failed:", err);
    return res.status(500).json({ message: "Failed to create trip", error: err.message });
  }
});

// POST /api/trips/archive — archive active trip
router.post("/archive", async (req, res) => {
  try {
    const { firebaseId, tripId } = req.body;

    if (!firebaseId || !tripId) {
      return res.status(400).json({ message: "Missing firebaseId or tripId" });
    }

    const updatedUser = await archiveTrip(firebaseId, tripId);
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("🔥 Trip archive failed:", err);
    return res.status(500).json({ message: "Failed to archive trip", error: err.message });
  }
});

module.exports = router;
