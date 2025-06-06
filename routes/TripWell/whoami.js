const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../../models/User");

router.get("/whoami", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await admin.auth().verifyIdToken(token);
    const firebaseUID = decoded.uid;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user); // ✅ Send full user model to TripWell
  } catch (err) {
    console.error("🔥 TripWell /whoami error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
