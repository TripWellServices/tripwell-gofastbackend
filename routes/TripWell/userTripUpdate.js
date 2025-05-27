// routes/TripWell/userTripUpdate.js

const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const { setUserTrip } = require("../../services/TripWell/userTripService");

// POST /api/usertrip/set
router.post("/set", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.body;
  const firebaseId = req.user.uid;

  try {
    const updatedUser = await setUserTrip(firebaseId, tripId);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("User trip update failed:", err);
    res.status(500).json({ error: "Failed to update user trip" });
  }
});

module.exports = router;
