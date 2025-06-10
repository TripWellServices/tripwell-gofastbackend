const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { handReply } = require("../../services/TripWell/TripGPTReplyService");

// 🔥 POST /tripwell/:tripId/gpt — Trigger GPT response for latest ask
router.post("/:tripId/gpt", async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?.uid; // ✅ From Firebase token

  console.log("🧠 TripGPT route hit:", {
    tripId,
    userId,
  });

  if (!tripId) {
    return res.status(400).json({ error: "Missing tripId" });
  }

  if (!userId) {
    return res.status(401).json({ error: "Missing user identity" });
  }

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ error: "Invalid tripId format" });
  }

  try {
    const gptResult = await handReply({ tripId, userId });

    res.status(200).json({
      success: true,
      gptReply: gptResult.gptReply,
      replyId: gptResult.replyId,
    });
  } catch (error) {
    console.error("❌ GPT reply failed:", error);
    res.status(500).json({ error: error.message || "GPT failure" });
  }
});

module.exports = router; // ✅ DO NOT WRAP THIS IN { router }
