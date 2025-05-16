
import { getGoalStatus } from '../services/FeedbackSummaryService.js';

export async function fetchRaceFeedback(req, res) {
  try {
    const userId = req.user.id; // requires auth middleware
    const status = await getGoalStatus(userId);
    res.json({ goalStatus: status });
  } catch (err) {
    console.error("Error generating feedback:", err);
    res.status(500).json({ error: "Failed to evaluate race feedback." });
  }
}
