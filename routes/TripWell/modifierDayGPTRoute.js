  const express = require("express");
  const router = express.Router();

  const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");
  const tripDayGPTModifier = require("../../services/TripWell/tripDayGPTModifier");
  const parseSingleDayModify = require("../../services/TripWell/parseSingleDayModify");
  const saveParsedDayModification = require("../../services/TripWell/singleDayModifyfromParseSaver");

  router.post("/tripwell/modifygpt/day", async (req, res) => {
    const { tripId, dayIndex, feedback, summary, blocks, save } = req.body;

    if (!tripId || typeof dayIndex !== "number") {
      return res.status(400).json({ error: "Missing tripId or dayIndex" });
    }

    try {
      // ✅ SAVE MODE
      if (save === true) {
        if (!summary || !blocks) {
          return res.status(400).json({ error: "Missing summary or blocks to save" });
        }

        const parsed = parseSingleDayModify({ summary, blocks });

        const updated = await saveParsedDayModification({
          tripId,
          dayIndex,
          parsed,
        });

        return res.json({ success: true, updated });
      }

      // ✅ GPT LOOP MODE
      if (!feedback) {
        return res.status(400).json({ error: "Missing feedback for GPT modify" });
      }

      // First GPT call — allow backend to hydrate if summary + blocks are missing
      let contextSummary = summary;
      let contextBlocks = blocks;

      if (!contextSummary || !contextBlocks) {
        const tripDay = await TripCurrentDays.findOne({ tripId, dayIndex });
        if (!tripDay) {
          return res.status(404).json({ error: "TripCurrentDays not found" });
        }

        contextSummary = tripDay.summary;
        contextBlocks = tripDay.blocks;
      }

      // Always require summary + blocks to be defined now
      if (!contextSummary || !contextBlocks) {
        return res.status(400).json({ error: "No summary + blocks for GPT call" });
      }

      const gptOutput = await tripDayGPTModifier({
        summary: contextSummary,
        blocks: contextBlocks,
        feedback,
      });

      const parsed = parseSingleDayModify(gptOutput);
      return res.json(parsed); // frontend will store in currentDayDraft
    } catch (err) {
      console.error("Error in /modifygpt/day:", err);
      res.status(500).json({ error: "Internal error" });
    }
  });

  module.exports = router;
