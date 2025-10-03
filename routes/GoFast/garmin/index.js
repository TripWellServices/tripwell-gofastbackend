const express = require('express');
const router = express.Router();

// Import individual garmin routes
const callback = require('./callback');
const initiate = require('./initiate');

// Mount the routes
router.use('/callback', callback);
router.use('/initiate', initiate);

module.exports = router;
