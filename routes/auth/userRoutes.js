const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const UserModel = require("../../models/User"); // adjust path if needed

// Middleware to verify Firebase token
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
}

// === /auth/me ===
router.get("/me", verifyFirebaseToken, async (req, res) => {
  const firebaseUid = req.firebaseUser.uid;

  try {
    const user = await UserModel.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "User fetch failed" });
  }
});

module.exports = router;
