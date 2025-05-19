const TrainingBase = require("../models/TrainingBase");
const { buildInitialRacePrediction } = require("../utils/RacePredictorUtils");

async function logInitialRacePrediction(userId) {
  const base = await TrainingBase.findOne({ userId });
  if (!base || !base.raceGoal || !base.currentFitness) return;

  const { current5kTime } = base.currentFitness;
  const { type: raceType, goalTime } = base.raceGoal;

  const prediction = buildInitialRacePrediction(current5kTime, raceType, goalTime);
  base.initialRacePrediction = prediction;
  base.goalDeltaSeconds = prediction.deltaInSeconds;

  await base.save();
}

module.exports = { logInitialRacePrediction };
