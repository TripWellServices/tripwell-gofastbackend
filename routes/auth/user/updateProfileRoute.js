
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

router.post("/update-profile", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });

    if (!user) return res.status(404).json({ error: "User not found" });

    user.preferredName = req.body.preferredName || user.preferredName;
    user.pace = req.body.pace || user.pace;
    user.bio = req.body.bio || user.bio;
    user.goal = req.body.goal || user.goal;

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
