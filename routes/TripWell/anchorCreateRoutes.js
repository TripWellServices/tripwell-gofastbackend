const express = require("express");
const router = express.Router();
const { anchorCreate } = require("../../services/TripWell/anchorCreateService");

// POST /tripwell/anchorcreate/:tripId
router.post("/tripwell/anchorcreate/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const { userId } = req.body;

  try {
    const rawAnchors = await anchorCreate(tripId, userId);
    res.status(200).json({ anchors: rawAnchors });
  } catch (err) {
    console.error("🛑 Anchor Create Error:", err);
    res.status(500).json({ error: "Failed to generate anchor suggestions" });
  }
});

module.exports = router;
