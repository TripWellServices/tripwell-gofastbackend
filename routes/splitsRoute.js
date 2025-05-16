const express = require("express");
const router = express.Router();
const GarminActivity = require("../models/GarminActivity");
const { getGarminActivityDetails } = require("../services/GarminFetchSplitsService");

router.get("/activity/splits", async (req, res) => {
  const { userId } = req.query;

  const activity = await GarminActivity.findOne({ userId }).sort({ activityDate: -1 });
  if (!activity || !activity.raw?.activityId) {
    return res.status(404).json({ error: "Activity or activityId not found" });
  }

  const splits = await getGarminActivityDetails(userId, activity.raw.activityId);
  res.json({ splits });
});

module.exports = router;
