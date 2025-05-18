// services/performanceAdaptiveService.js
const PulsePerformance = require('../models/PulsePerformance');
const TrainingPlan = require('../models/TrainingPlan');

const performanceAdaptiveService = async (userId) => {
  const entries = await PulsePerformance.find({ userId }).sort({ createdAt: -1 }).limit(10);
  if (!entries || entries.length < 3) {
    return { deltaSeconds: 0, revised5kTime: null, reason: 'Not enough data' };
  }

  let totalMileage = 0;
  let yesCount = 0;

  entries.forEach(entry => {
    const miles = parseFloat(entry.totalMileage || '0');
    totalMileage += miles;
    if (entry.hitGoalPace === 'yes') yesCount++;
  });

  const avgMileage = totalMileage / entries.length;
  const totalRuns = entries.length;

  let deltaSeconds = 0;

  if (totalRuns >= 10) deltaSeconds -= 5;
  if (yesCount >= 5) deltaSeconds -= 5;
  if (avgMileage >= 30) deltaSeconds -= 5;
  if (avgMileage < 15) deltaSeconds += 5;

  const plan = await TrainingPlan.findOne({ userId });
  if (!plan || !plan.currentFitness || !plan.currentFitness.current5kTime) {
    return { deltaSeconds, revised5kTime: null, reason: 'Missing base 5K time' };
  }

  const baseTime = plan.currentFitness.current5kTime; // format: "22:00"
  const [min, sec] = baseTime.split(':').map(Number);
  let totalSec = min * 60 + sec + deltaSeconds;

  if (totalSec < 0) totalSec = 0; // prevent negative time

  const newMin = Math.floor(totalSec / 60);
  const newSec = String(totalSec % 60).padStart(2, '0');
  const revised5kTime = `${newMin}:${newSec}`;

  return {
    revised5kTime,
    deltaSeconds,
    summary: {
      runs: totalRuns,
      hitGoalPaceYes: yesCount,
      avgMileage: Math.round(avgMileage * 10) / 10
    }
  };
};