
import express from 'express';
import { visualizeCourse } from '../controllers/CourseVisualizationController.js';

const router = express.Router();
router.post('/visualize', visualizeCourse);

export default router;
