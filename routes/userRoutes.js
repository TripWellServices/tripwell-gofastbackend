const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");

// GET /api/users/me
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;