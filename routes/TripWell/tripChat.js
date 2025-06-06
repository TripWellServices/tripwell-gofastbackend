const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const ChatService = require("../../services/TripWell/TripAskService"); // ✅ GPT handler

router.post("/:tripId/chat", async (req, res) => {
  const { tripId } = req.params;
  const { userInput, tripData, userData } = req.body;

  console.log("🛰️ tripChat route hit with:", {
    method: req.method,
    path: req.originalUrl,
    params: req.params,
    body: req.body,
  });

  // 🛡️ Required field check
  if (!userInput || !tripData || !tripId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 🚧 tripId format check (critical for Mongo stability)
  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ error: "Invalid tripId format" });
  }

  try {
    const result = await ChatService.handleTripChat({
      tripId,
      userId: userData?._id || null,
      userInput,
      tripData,
      userData,
    });

    res.json(result);
  } catch (error) {
    console.error("❌ TripWell chat error:", error);
    res.status(500).json({ error: "GPT chat failed" });
  }
});

module.exports = router;
