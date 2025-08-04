// routes/TripWell/JoinCodeCheckRoute.js

const express = require("express");
const router = express.Router();
const TripRegistryService = require("../../services/TripWell/TripRegistryService"); // ✅ Correct path to service

// POST /tripwell/joincodecheck
router.post("/joincodecheck", async (req, res) => {
  try {
    const { joinCode } = req.body;

    // 🔐 Basic input validation
    if (!joinCode || typeof joinCode !== "string") {
      return res.status(400).json({ error: "Join code is required and must be a string." });
    }

    // 🔍 Check if join code is already taken
    const isTaken = await TripRegistryService.isJoinCodeTaken(joinCode);

    return res.status(200).json({ available: !isTaken });
  } catch (err) {
    console.error("❌ Join code check failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
