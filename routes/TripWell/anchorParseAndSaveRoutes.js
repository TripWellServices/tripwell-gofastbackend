const express = require("express");
const router = express.Router();
const { anchorParseAndSave } = require("../../services/TripWell/anchorParseAndSaveService");

// POST /tripwell/anchorparseandsave/:tripId
router.post("/tripwell/anchorparseandsave/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const { userId, anchorArray } = req.body; // anchorArray is the raw Angela output

  try {
    const logicSaved = await anchorParseAndSave(tripId, userId, anchorArray);
    res.status(200).json({ saved: logicSaved });
  } catch (err) {
    console.error("🛑 Anchor Parse+Save Error:", err);
    res.status(500).json({ error: "Failed to save anchor logic" });
  }
});

module.exports = router;
