const express = require('express');
const { savePulseStrength } = require('../controllers/PulseStrengthController');

const router = express.Router();
router.post("/save", savePulseStrength);
module.exports = router;