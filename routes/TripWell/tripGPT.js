const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { handleTripGPTReply } = require("../../services/TripWell/TripGPTReplyService");

router.post("/:tripId/gpt", async (req, res) => {
  const { tripId } = req.params;
  const { userInput, userData } = req.body;

  console.log("🧠 TripGPT route hit:", {
    tripId,
    userInput,
    userId: userData?.firebaseId,
  });

  // 🛡️ Field validation
  if (!userInput || !tripId || !userData) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ error: "Invalid tripId format" });
  }

  try {
    const userId = userData.firebaseId;

    const gptResult = await handleTripGPTReply({
      tripId,
      userId,
      userInput,
    });

    res.json({
      success: true,
      gptReply: gptResult.gptReply,
      replyId: gptResult.replyId,
    });
  } catch (error) {
    console.error("❌ GPT reply failed:", error);
    res.status(500).json({ error: error.message || "GPT failure" });
  }
});

module.exports = router;
