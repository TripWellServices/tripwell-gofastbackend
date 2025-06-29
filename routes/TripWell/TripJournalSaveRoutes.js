// routes/TripWell/TripJournalSaveRoutes.js

const express = require("express");
const router = express.Router();
const TripJournal = require("../../models/TripWell/TripJournal");

router.post("/tripwell/journal/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.uid;
    const { entry, dayIndex } = req.body;

    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (!entry || entry.length < 1) return res.status(400).json({ error: "Entry cannot be empty" });

    const journal = await TripJournal.create({
      tripId,
      userId,
      entry,
      dayIndex: typeof dayIndex === "number" ? dayIndex : null,
    });

    res.status(200).json({ message: "Journal entry saved", journal });
  } catch (err) {
    console.error("📓 Error saving journal entry:", err);
    res.status(500).json({ error: "Failed to save journal entry" });
  }
});

module.exports = router;
