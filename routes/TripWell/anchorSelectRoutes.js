const express = require("express");
const router = express.Router();
const { saveAnchorSelection } = require("../../services/TripWell/anchorSelectService");

router.post("/tripwell/anchorselects/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.uid;
    const { selectedAnchors } = req.body;

    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const result = await saveAnchorSelection({ tripId, userId, selectedAnchors });

    res.status(200).json({ message: "Anchor selection saved", id: result._id });
  } catch (err) {
    console.error("🛑 AnchorSelect Save Error:", err);
    res.status(500).json({ error: "Failed to save anchor selection" });
  }
});

module.exports = router;
