const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

router.post("/createOrFind", async (req, res) => {
  try {
    const { firebaseId, email } = req.body;

    if (!firebaseId || !email) {
      return res.status(400).json({ error: "Missing firebaseId or email" });
    }

    let user = await TripWellUser.findOne({ firebaseId });

    if (!user) {
      user = new TripWellUser({
        firebaseId,
        email,
        name: null,
        city: null,
        travelStyle: [],
        tripVibe: [],
        tripId: null,
        role: "noroleset",
      });

      await user.save();
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error in createOrFind:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
