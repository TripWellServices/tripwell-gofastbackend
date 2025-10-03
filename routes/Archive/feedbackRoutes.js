
const express = require('express');
const { fetchRaceFeedback } = require('../controllers/FeedbackController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();
router.post('/feedback-summary', verifyToken, fetchRaceFeedback);

module.exports = router;