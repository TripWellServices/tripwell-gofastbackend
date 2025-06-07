const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

const User = require("../../models/User");
const Trip = require("../../models/TripWell/TripBase");

// 🔍 GET /tripwell/whoami/
router.get("/whoami", verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.firebaseUser?.uid) {
      console.warn("⚠️ No Firebase user found in request");
      return res.status(401).json({ error: "Unauthorized – Firebase user missing" });
    }

    const firebaseUID = req.firebaseUser.uid;
    console.log("👤 Firebase UID received:", firebaseUID);

    let user = await User.findOne({ firebaseUID });

    if (!user) {
      console.log("🆕 No user found — creating new Mongo user.");
      user = new User({
        firebaseUID,
        email: req.firebaseUser.email || "",
        displayName: req.firebaseUser.name || "Anonymous",
      });
      await user.save();
    }

    const trip = await Trip.findOne({ ownerId: user._id }).sort({ createdAt: -1 });

    console.log("📦 whoami payload ready → user + trip");
    res.json({ user, trip });
  } catch (err) {
    console.error("❌ whoami internal error:", err);
    res.status(500).json({ error: "Server error in whoami" });
  }
});

module.exports = router;
