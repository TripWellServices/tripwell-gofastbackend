const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const { v4: uuidv4 } = require("uuid");

router.post("/firebase-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    console.log("🔥 Firebase login route hit for:", email);

    // ✅ Prevent duplicate email/uid issues
    let user = await User.findOne({
      $or: [{ firebaseId: uid }, { email }],
    });

    if (!user) {
      console.log("🆕 Creating user:", email);
      user = await User.create({
        firebaseId: uid,
        userId: uuidv4(),
        email,
        name,
        preferredName: name,
      });
    } else {
      console.log("✅ User found:", email);
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
