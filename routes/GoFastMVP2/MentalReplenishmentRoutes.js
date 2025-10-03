const express = require('express');
const { saveMentalReplenishment } = require('../../controllers/MentalReplenishmentController');

const router = express.Router();
router.post("/save", saveMentalReplenishment);
module.exports = router;