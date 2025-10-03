const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const { hydrateUserData } = require('../utils/userStatusChecker');

/**
 * GET /api/hydrate
 * Returns all user data for UniversalRouter
 */
router.get('/hydrate', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    
    const data = await hydrateUserData(firebaseId);
    
    if (!data || !data.user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: data.user,
      profile: data.profile,
      race: data.race,
      plan: data.plan
    });
  } catch (error) {
    console.error('Hydrate error:', error);
    res.status(500).json({ error: 'Failed to hydrate user data' });
  }
});

module.exports = router;

