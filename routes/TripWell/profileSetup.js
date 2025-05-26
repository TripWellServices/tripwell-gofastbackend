const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

router.post("/profile/setup", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const {
      name,
      email,
      location,
      familySituation,
      travelStyle,
      tripVibePreference
    } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { firebaseId: uid },
      {
        name,
        email,
        location,
        familySituation,
        travelStyle,
        tripVibePreference
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("TripWell profile setup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
