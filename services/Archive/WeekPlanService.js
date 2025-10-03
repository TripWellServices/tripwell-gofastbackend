const WeekPlan = require('../../models/Archive/WeekPlan-OLD');
const { getWeekRangeFromIndex } = require('../../utils/DateUtils');
const { computeAerobicEfficiencyForWeek } = require('./AerobicEfficiencyService');
const { predictAdaptive5K } = require('./PredictionEngine');
const { getPaceZonesFromAdaptive5k } = require('../../utils/PaceUtils');
const { adjustAdaptive5kTime } = require('./adaptive5kAdjustmentService');
const { getHRZones } = require('../../utils/HRZoneUtils');

const ensureWeekPlan = async (userId, weekIndex, sourceTrainingPlanId) => {
  const existing = await WeekPlan.findOne({ userId, weekIndex });
  if (existing) return existing;

  const { startDate, endDate } = getWeekRangeFromIndex(weekIndex);

  return await WeekPlan.create({
    userId,
    weekIndex,
    startDate,
    endDate,
    sourceTrainingPlanId
  });
};

const updateWeekPlanMetrics = async (userId, weekIndex) => {
  const weekPlan = await ensureWeekPlan(userId, weekIndex);

  const aerobicEfficiency = await computeAerobicEfficiencyForWeek(userId, weekIndex);
  const baseAdaptive5k = await predictAdaptive5K(userId, weekIndex);
  const paceZones = getPaceZonesFromAdaptive5k(baseAdaptive5k);
  const hrZones = getHRZones();

  const adjusted5k = await adjustAdaptive5kTime(
    userId,
    weekIndex,
    baseAdaptive5k,
    paceZones.easy, // using 'easy' pace as aerobic target
    hrZones.Z2      // Z2 HR zone as aerobic benchmark
  );

  weekPlan.aerobicEfficiency = aerobicEfficiency;
  weekPlan.adaptive5kTime = adjusted5k;
  weekPlan.pacePrescriptions = paceZones;

  await weekPlan.save();

  return weekPlan;
};

module.exports = {
  ensureWeekPlan,
  updateWeekPlanMetrics
};