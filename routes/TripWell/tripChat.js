const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { handAsk } = require("../../services/TripWell/TripAskService");

router.post("/:tripId/chat", async (req, res) => {
  const { tripId } = req.params;
  const { userInput } = req.body;
  const userId = req.user?.uid;

  console.log("🛰️ tripChat route hit with:", {
    method: req.method,
    path: req.originalUrl,
    params: req.params,
    body: req.body,
    userId,
  });

  if (!userInput || !tripId) {
    return res.status(400).json({ error: "Missing userInput or tripId" });
  }

  if (!userId) {
    return res.status(401).json({ error: "Missing user identity" });
  }

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ error: "Invalid tripId format" });
  }

  try {
    const result = await handAsk({ tripId, userId, userInput });

    res.status(200).json({
      success: true,
      message: "Ask saved to TripAsk successfully.",
      askId: result.askId,
    });
  } catch (error) {
    console.error("❌ TripAsk failed:", error);
    res.status(500).json({ error: "TripAsk logging failed" });
  }
});

module.exports = router;
