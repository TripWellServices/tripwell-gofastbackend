import PulseStrength from "../models/PulseStrength.js";

export const savePulseStrength = async (req, res) => {
  try {
    const entry = new PulseStrength(req.body);
    await entry.save();
    res.status(200).json({ message: "PulseStrength entry saved" });
  } catch (err) {
    console.error("Error saving PulseStrength:", err);
    res.status(500).json({ error: "Failed to save entry" });
  }
};
