
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const { v4: uuidv4 } = require("uuid");

router.post("/firebase-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    let user = await User.findOne({ firebaseId: uid });

    if (!user) {
      user = await User.create({
        firebaseId: uid,
        userId: uuidv4(),
        email,
        name,
        preferredName: name
      });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
