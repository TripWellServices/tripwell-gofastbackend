const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const User = require("../../models/User");
const Trip = require("../../models/TripWell/TripBase");

// 🔥 GET /tripwell/whoami — canonical hydration route
router.get("/whoami", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUID = req.user.uid;

    // 🔍 Use your canonical userId (mirrored from Firebase UID)
    let user = await User.findOne({ userId: firebaseUID });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🩹 Backfill firebaseId if missing (optional)
    if (!user.firebaseId) {
      user.firebaseId = firebaseUID;
      await user.save();
    }

    // 🧳 Hydrate trip
    let trip = null;
    if (user.tripId) {
      trip = await Trip.findById(user.tripId);
      if (!trip) {
        console.warn(`⚠️ No trip found for tripId: ${user.tripId}`);
      }
    }

    // ✅ Final response
    res.json({ user, trip });
  } catch (err) {
    console.error("❌ whoami error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🧪 Sanity ping for route validation
router.get("/", (req, res) => {
  res.send("✅ TripWell whoami route is mounted and ready.");
});

module.exports = router;
