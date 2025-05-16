const express = require('express');
const GoalProfileController = require('../controllers/GoalProfileController');
const router = express.Router();

// Create a new Goal Profile
router.post('/create', GoalProfileController.createGoalProfile);

// Get Goal Profile by User ID
router.get('/:userId', GoalProfileController.getGoalProfileByUser);

module.exports = router;
