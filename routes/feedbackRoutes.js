
import express from 'express';
import { fetchRaceFeedback } from '../controllers/FeedbackController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();
router.post('/feedback-summary', verifyToken, fetchRaceFeedback);

export default router;
