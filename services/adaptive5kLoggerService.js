const Adaptive5kPace = require('../../models/Archive/Adaptive5kPace-OLD');

/**
 * Get the most recent adaptive 5K time for a user
 * @param {ObjectId} userId
 * @returns {Promise<string>} - adaptive 5K in MM:SS format
 */
const getMostRecentAdaptive5k = async (userId) => {
  const latest = await Adaptive5kPace.findOne({ userId }).sort({ weekIndex: -1, createdAt: -1 });
  if (!latest || !latest.adaptive5kTime) throw new Error('No adaptive 5K time found');

  const seconds = latest.adaptive5kTime;
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

/**
 * Log a new adaptive 5K time after weekly aggregation
 * @param {Object} params
 * @param {ObjectId} params.userId
 * @param {Number} params.weekIndex
 * @param {ObjectId} params.sourceWeekId
 * @param {Number} params.adaptive5kTime - in seconds
 * @param {Number} [params.delta] - change from prior week
 * @param {String} [params.rationale] - optional notes
 * @returns {Promise<Object>} - saved record
 */
const logAdaptive5k = async ({ userId, weekIndex, sourceWeekId, adaptive5kTime, delta, rationale }) => {
  const entry = new Adaptive5kPace({
    userId,
    weekIndex,
    sourceWeekId,
    adaptive5kTime,
    delta,
    rationale,
  });
  return await entry.save();
};

module.exports = {
  getMostRecentAdaptive5k,
  logAdaptive5k,
};
