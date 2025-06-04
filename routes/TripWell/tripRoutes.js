const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip, archiveTrip } = require("../../services/TripWell/userTripService");

// === CHECK FOR DUPLICATE JOIN CODE ===
router.post("/check-code", async (req, res) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode) {
      return res.status(400).json({ message: "Missing joinCode" });
    }

    const existing = await TripBase.findOne({ joinCode });
    const isAvailable = !existing;

    return res.status(200).json({ isAvailable });
  } catch (err) {
    console.error("🔥 Join code check failed:", err);
    return res.status(500).json({ message: "Failed to check join code", error: err.message });
  }
});

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
      userId // ✅ Mongo _id, not firebaseId
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

    // ✅ Link trip to user by Mongo _id
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
    const { userId, tripId } = req.body;

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
