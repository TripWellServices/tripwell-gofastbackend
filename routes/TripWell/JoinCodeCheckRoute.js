const express = require("express");
const router = express.Router();
const { isJoinCodeTaken } = require("../services/TripRegistryService");

// GET /tripwell/joincode/:code
router.get("/tripwell/joincode/:code", async (req, res) => {
  try {
    const joinCode = req.params.code.trim().toLowerCase();
    const taken = await isJoinCodeTaken(joinCode);
    res.json({ taken });
  } catch (err) {
    console.error("❌ Error checking join code:", err);
    res.status(500).json({ error: "Server error while checking join code" });
  }
});

module.exports = router;