const express = require("express");
const router = express.Router();
const TripReflection = require("../../models/TripWell/TripReflection");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// 💾 Save or update a reflection for a specific trip day (frontend passes summary)
router.post("/reflection/:tripId/:dayIndex", verifyFirebaseToken, async (req, res) => {
  console.log("🔍 Reflection route hit - req.user:", req.user);
  console.log("🔍 Reflection route hit - req.headers:", req.headers);
  
  const { tripId, dayIndex } = req.params;
  const { summary, moodTags, journalText } = req.body;
  const userId = req.user?.uid;

  console.log("🔍 Reflection route - userId:", userId);
  console.log("🔍 Reflection route - tripId:", tripId, "dayIndex:", dayIndex);

  if (!userId) return res.status(401).json({ error: "User not authenticated" });
  if (!tripId || isNaN(parseInt(dayIndex))) return res.status(400).json({ error: "Invalid tripId or dayIndex" });

  try {
    const filter = { tripId, dayIndex: parseInt(dayIndex), userId };
    const update = { summary, moodTags, journalText };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    const reflection = await TripReflection.findOneAndUpdate(filter, update, options);

    res.status(200).json({ message: "Reflection saved", reflection });
  } catch (err) {
    console.error("🛑 Error saving reflection:", err);
    res.status(500).json({ error: "Failed to save reflection" });
  }
});

module.exports = router;
