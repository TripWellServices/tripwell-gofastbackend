const express = require('express');
const ActivityController = require('../controllers/ActivityController');
const router = express.Router();

// Log a new activity (from Garmin or manual)
router.post('/log', ActivityController.logActivity);

// Get all activities for a user
router.get('/:userId', ActivityController.getActivitiesForUser);

module.exports = router;
