const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const User = require("../../models/User");
const Trip = require("../../models/TripWell/TripBase"); // ✅ CORRECT TRIP MODEL

// 🔐 Verify Firebase token middleware
async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

// ✅ GET /tripwell/whoami → full TripContext hydration
router.get("/whoami", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUID = req.firebaseUser.uid;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ error: "User not found" });

    const trip = await Trip.findOne({ ownerId: user._id }).sort({ createdAt: -1 });

    res.json({ user, trip });
  } catch (err) {
    console.error("🔥 TripWell /whoami GET error:", err);
    res.status(500).json({ error: "Failed to hydrate user and trip" });
  }
});

// ✅ POST /tripwell/whoami → push display name
router.post("/whoami", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseUID = req.firebaseUser.uid;
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { displayName } = req.body;
    if (displayName) user.displayName = displayName;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("🔥 TripWell /whoami POST error:", err);
    res.status(400).json({ error: "Failed to update user" });
  }
});

module.exports = router;
