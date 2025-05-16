function generateWorkoutsForWeek({ week, phase, paces, mileageTarget, trainingDaysPerWeek }) {
  const workouts = [];
  let longRunMiles = Math.round(mileageTarget * 0.33);

  if (phase === 'taper') {
    longRunMiles = Math.round(mileageTarget * 0.4);
  }

  workouts.push({
    type: "long_run",
    distanceMiles: longRunMiles,
    targetPace: paces.easy
  });

  if (phase === 'base') {
    if (week % 2 === 0) {
      workouts.push({
        type: "fartlek",
        structure: "6x1 min on/1 min off",
        targetPace: paces.vo2max
      });
    } else {
      workouts.push({
        type: "short_tempo",
        durationMinutes: 20,
        targetPace: paces.tempo
      });
    }
  } else if (phase === 'peak') {
    if (week % 3 === 0) {
      workouts.push({
        type: "yasso_800s",
        reps: 6,
        targetTimeMinutes: paces.mp
      });
    } else {
      workouts.push({
        type: "long_tempo",
        durationMinutes: 30,
        targetPace: paces.tempo
      });
    }
  } else if (phase === 'taper') {
    workouts.push({
      type: "sharpening_strides",
      structure: "6x200m strides",
      targetPace: paces.vo2max
    });
  }

  return {
    longRun: longRunMiles,
    sessions: workouts
  };
}

module.exports = { generateWorkoutsForWeek };
