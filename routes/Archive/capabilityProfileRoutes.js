const express = require('express');
const CapabilityProfileController = require('../controllers/CapabilityProfileController');
const router = express.Router();

// Create a new Capability Profile
router.post('/create', CapabilityProfileController.createCapabilityProfile);

// Get Capability Profile by User ID
router.get('/:userId', CapabilityProfileController.getCapabilityProfileByUser);

module.exports = router;
