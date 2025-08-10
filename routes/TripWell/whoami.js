// routes/TripWell/whoami.js

const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

// 🔒 GET /tripwell/whoami
// Protected — requires verifyFirebaseToken middleware at mount
router.get("/whoami", async (req, res) => {
  try {
    const firebaseId = req.user?.uid; // set by verifyFirebaseToken

    if (!firebaseId) {
      return res.status(401).json({ error: "Missing or invalid Firebase ID" });
    }

    const user = await TripWellUser.findOne({ firebaseId });

    if (!user) {
      // ✅ Return null for frontend to handle (instead of 404 loop)
      return res.json({ user: null });
    }

    // ✅ Return complete TripWellUser model for hydration
    return res.json({
      user: user.toObject()
    });
  } catch (err) {
    console.error("❌ whoami error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Optional mount check
router.get("/", (req, res) => {
  res.send("✅ TripWell whoami route is mounted and returning full user.");
});

module.exports = router;
