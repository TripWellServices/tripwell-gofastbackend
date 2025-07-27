const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser"); // renamed canonical model

// 🔥 POST /tripwell/user/createOrFind — Firebase identity + Mongo user init
router.post("/createOrFind", async (req, res) => {
  try {
    const { firebaseUID, email } = req.body;

    if (!firebaseUID || !email) {
      return res.status(400).json({ error: "Missing firebaseUID or email" });
    }

    let user = await TripWellUser.findOne({ firebaseUID });

    if (!user) {
      user = new TripWellUser({
        firebaseUID,
        email,
        name: "",
        city: "",
        travelStyle: [],
        tripVibe: [],
        tripId: null,
        role: "noroleset",
      });

      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error("❌ createOrFind error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
