const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const { handleTripAsk } = require("../../services/TripWell/TripAskService"); // ✅ Clean named import

router.post("/:tripId/chat", async (req, res) => {
  const { tripId } = req.params;
  const { userInput, tripData, userData } = req.body;

  console.log("🛰️ tripChat route hit with:", {
    method: req.method,
    path: req.originalUrl,
    params: req.params,
    body: req.body,
  });

  if (!userInput || !tripData || !tripId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res.status(400).json({ error: "Invalid tripId format" });
  }

  try {
    const userId = userData?.firebaseId || userData?.userId || null;

    const result = await handleTripAsk({
      tripId,
      userId,
      userInput,
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ TripWell chat error:", error);
    res.status(500).json({ error: "TripAsk logging failed" });
  }
});

module.exports = router;
