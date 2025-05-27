const express = require("express");
const router = express.Router();
const ChatService = require("../../services/TripWell/ChatService");

router.post("/:tripId/chat", async (req, res) => {
  const { tripId } = req.params;
  const { userInput, tripData, userData } = req.body;

  if (!userInput || !tripData || !tripId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await ChatService.handleTripChat({
      tripId,
      userId: userData?._id || null,
      userInput,
      tripData,
      userData
    });

    res.json(result);
  } catch (error) {
    console.error("TripWell chat error:", error);
    res.status(500).json({ error: "GPT chat failed" });
  }
});

module.exports = router;
