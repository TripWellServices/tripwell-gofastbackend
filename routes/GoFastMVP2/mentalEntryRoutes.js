const express = require("express");
const router = express.Router();
const {
  saveMentalEntry,
  getMentalEntriesForUser,
  hasMoodDropoff
} = require("../../services/Archive/MentalEntryService");

// Save a new mental entry
router.post("/entry", async (req, res) => {
  try {
    const { userId, mood, text } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const saved = await saveMentalEntry({ userId, mood, text });
    res.json(saved);
  } catch (err) {
    console.error("Error saving mental entry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get recent mental entries
router.get("/entries", async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const entries = await getMentalEntriesForUser(userId, parseInt(limit));
    res.json(entries);
  } catch (err) {
    console.error("Error fetching mental entries:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mood dropoff check
router.get("/mood-check", async (req, res) => {
  try {
    const { userId, days = 5 } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const dropoff = await hasMoodDropoff(userId, parseInt(days));
    res.json({ dropoff });
  } catch (err) {
    console.error("Error in mood dropoff check:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
