const PulsePerformance = require("../models/GoFastMVP2/PulsePerformance");

const savePulsePerformance = async (req, res) => {
  try {
    const entry = new PulsePerformance(req.body);
    await entry.save();
    res.status(200).json({ message: "PulsePerformance entry saved" });
  } catch (err) {
    console.error("Error saving PulsePerformance:", err);
    res.status(500).json({ error: "Failed to save entry" });
  }
};

module.exports = { savePulsePerformance };
