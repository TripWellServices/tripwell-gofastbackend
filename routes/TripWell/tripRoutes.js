const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// ✅ Correct service import
const { setUserTrip, archiveTrip } = require("../../services/TripWell/userTripService");

// === CREATE NEW TRIP ===
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
      userId // ✅ updated to use Mongo _id
    } = req.body;

    if (!joinCode || !tripName || !purpose || !startDate || !endDate || !userId) {
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

    // ✅ Pass MongoDB _id instead of firebaseId
    await setUserTrip(userId, newTrip._id.toString());

    return res.status(200).json(newTrip);
  } catch (err) {
    console.error("🔥 Trip creation failed:", err);
    return res.status(500).json({ message: "Failed to create trip", error: err.message });
  }
});

// === ARCHIVE TRIP ===
router.post("/archive", async (req, res) => {
  try {
    const { userId, tripId } = req.body; // ✅ use userId consistently here too

    if (!userId || !tripId) {
      return res.status(400).json({ message: "Missing userId or tripId" });
    }

    const updatedUser = await archiveTrip(userId, tripId);
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("🔥 Trip archive failed:", err);
    return res.status(500).json({ message: "Failed to archive trip", error: err.message });
  }
});

module.exports = router;
