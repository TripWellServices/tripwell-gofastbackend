const CapabilityProfileService = require('../services/Archive/CapabilityProfileService');

const createCapabilityProfile = async (req, res) => {
  try {
    const { userId, currentAvgPace, sustainableDistance, peakingState, baseMileage } = req.body;
    const capabilityProfile = await CapabilityProfileService.createCapabilityProfile(userId, { currentAvgPace, sustainableDistance, peakingState, baseMileage });
    res.json(capabilityProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCapabilityProfileByUser = async (req, res) => {
  try {
    const capabilityProfile = await CapabilityProfileService.getCapabilityProfileByUser(req.params.userId);
    res.json(capabilityProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createCapabilityProfile, getCapabilityProfileByUser };
