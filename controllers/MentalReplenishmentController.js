const MentalReplenishment = require('../models/MentalReplenishment');

const saveMentalReplenishment = async (req, res) => {
  try {
    const entry = new MentalReplenishment(req.body);
    await entry.save();
    res.status(200).json({ message: "MentalReplenishment entry saved" });
  } catch (err) {
    console.error("Error saving MentalReplenishment:", err);
    res.status(500).json({ error: "Failed to save entry" });
  }
};