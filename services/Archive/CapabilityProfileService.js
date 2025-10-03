const CapabilityProfile = require('../../models/Archive/CapabilityProfile-OLD');

const createCapabilityProfile = async (userId, capabilityData) => {
  return await CapabilityProfile.create({ userId, ...capabilityData });
};

const getCapabilityProfileByUser = async (userId) => {
  return await CapabilityProfile.findOne({ userId });
};

module.exports = { createCapabilityProfile, getCapabilityProfileByUser };
