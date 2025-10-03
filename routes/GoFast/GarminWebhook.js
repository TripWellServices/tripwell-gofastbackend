const express = require("express");
const router = express.Router();
const { saveGarminActivity } = require("../../services/GoFast/GarminSaveActivityService");

router.post("/garmin-webhook", async (req, res) => {
  try {
    const payload = req.body;

    if (payload?.activityFiles) {
      for (const activity of payload.activityFiles) {
        const userId = activity.userId; // for now, using Garmin's userId directly
        await saveGarminActivity(userId, activity);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Garmin webhook error:", err);
    res.status(500).send("Garmin webhook failed");
  }
});

module.exports = router;
