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

    // ✅ Return full user model fields for hydration
    return res.json({
      user: {
        _id: user._id,
        firebaseId: user.firebaseId,
        email: user.email,
        name: user.name,             // legacy placeholder
        firstName: user.firstName,   // profile field
        lastName: user.lastName,     // profile field
        hometownCity: user.hometownCity, // profile field
        state: user.state,           // profile field
        travelStyle: user.travelStyle, // array
        tripVibe: user.tripVibe,     // array
        tripId: user.tripId,
        role: user.role,
      }
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
