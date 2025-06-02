const TripBase = require('../../models/TripBase');

/**
 * Checks if the given join code already exists in the TripBase collection.
 * @param {string} joinCode - Code to check for global uniqueness
 * @returns {Promise<boolean>} - true if taken, false if available
 */
async function isJoinCodeTaken(joinCode) {
  if (!joinCode || typeof joinCode !== 'string') {
    throw new Error('Join code must be a non-empty string');
  }

  const existingTrip = await TripBase.findOne({ joinCode: joinCode.trim() });
  return !!existingTrip;
}

module.exports = {
  isJoinCodeTaken,
};
