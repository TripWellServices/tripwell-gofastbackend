
const express = require('express');
const { visualizeCourse } = require('../controllers/CourseVisualizationController');

const router = express.Router();
router.post('/visualize', visualizeCourse);

module.exports = router;