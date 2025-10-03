
const { getGoalStatus } = require('../services/Archive/FeedbackSummaryService');

const fetchRaceFeedback = async (req, res) => {
  try {
    const userId = req.user.id; // requires auth middleware
    const status = await getGoalStatus(userId);
    res.json({ goalStatus: status });
  } catch (err) {
    console.error("Error generating feedback:", err);
    res.status(500).json({ error: "Failed to evaluate race feedback." });
  }
};

module.exports = { fetchRaceFeedback };