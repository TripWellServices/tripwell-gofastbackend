// /routes/TripWell/whoami.js
const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

// GET /tripwell/whoami
// Protected by verifyFirebaseToken in index.js
router.get("/", async (req, res) => {
  try {
    const firebaseId = req.user.uid; // Comes from verifyFirebaseToken middleware

    if (!firebaseId) {
      return res.status(401).json({ error: "No Firebase UID in request" });
    }

    // Find full TripWell user by firebaseId
    const user = await TripWellUser.findOne({ firebaseId });

    console.log("👤 WHOAMI User:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send back the *full* user object
    res.json(user);
  } catch (err) {
    console.error("❌ WHOAMI error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
