const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const User = require("../../models/User");
const Trip = require("../../models/TripWell/TripBase"); // ✅ Real trip model

// ✅ /tripwell/whoami
router.get("/whoami", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUID = req.firebaseUser.uid;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ error: "User not found" });

    let trip = null;
    if (user.tripId) {
      trip = await Trip.findById(user.tripId);
      if (!trip) {
        console.warn(`⚠️ Trip not found for tripId: ${user.tripId}`);
      }
    }

    res.json({ user, trip });
  } catch (err) {
    console.error("❌ whoami error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
