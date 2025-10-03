const express = require('express');
const { savePulsePerformance } = require('../../controllers/PulsePerformanceController');

const router = express.Router();
router.post("/save", savePulsePerformance);
module.exports = router;