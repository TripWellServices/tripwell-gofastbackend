// routes/TripWell/tripAnchorRoutes.js

const express = require("express");
const router = express.Router();
const TripIntent = require("../../models/TripWell/TripIntent");

// 🔁 Save selected anchors (distinct from GPT gen)
router.post("/tripwell/anchorselects/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { selectedAnchors } = req.body;
    const userId = req.user?.uid;

    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (!Array.isArray(selectedAnchors) || selectedAnchors.length < 1) {
      return res.status(400).json({ error: "Must include at least one anchor" });
    }

    const trip = await TripIntent.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    trip.anchors = selectedAnchors;
    await trip.save();

    res.status(200).json({ message: "Anchor selection saved." });
  } catch (err) {
    console.error("🛑 AnchorSelect Save Error:", err);
    res.status(500).json({ error: "Failed to save anchor selection" });
  }
});

module.exports = router;
