// GET /api/race/locked-pace/:userId
const RaceSelfAssessment = require('../models/RaceSelfAssessment');

router.get('/locked-pace/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const record = await RaceSelfAssessment.findOne({ userId });
    if (!record || !record.lockedPace) {
      return res.status(404).json({ error: 'No locked pace found' });
    }
    res.json({ lockedPace: record.lockedPace });
  } catch (err) {
    console.error('Error fetching locked pace:', err);
    res.status(500).json({ error: 'Server error' });
  }
});