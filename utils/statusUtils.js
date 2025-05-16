export function determineTrainingStatus(user, trainingPlan) {
  const now = new Date();

  if (!user) {
    return {
      trainingStatus: 'not_registered',
      redirectTo: '/sign-up',
    };
  }

  // Onboarding milestones
  if (!trainingPlan && !user.raceGoal && !user.commitLevel) {
    return {
      trainingStatus: 'not_started',
      redirectTo: '/mindset',
    };
  }

  if (!trainingPlan && user.raceGoal) {
    return {
      trainingStatus: 'onboarding',
      redirectTo: '/current-capability',
    };
  }

  // From here, plan exists
  const raceDate = new Date(trainingPlan.raceGoal?.date);
  const trainingStarted = trainingPlan.trainingStartedAt
    ? new Date(trainingPlan.trainingStartedAt)
    : null;
  const lastCheckIn = trainingPlan.lastCheckInAt
    ? new Date(trainingPlan.lastCheckInAt)
    : null;

  const daysSinceCheckIn = lastCheckIn
    ? Math.floor((now - lastCheckIn) / (1000 * 60 * 60 * 24))
    : null;
  const daysToRace = Math.floor((raceDate - now) / (1000 * 60 * 60 * 24));

  if (!trainingStarted) {
    const planAge = Math.floor(
      (now - new Date(trainingPlan.createdAt)) / (1000 * 60 * 60 * 24)
    );
    if (planAge >= 2) {
      return {
        trainingStatus: 'pending_start',
        redirectTo: '/what-happens-now',
      };
    } else {
      return {
        trainingStatus: 'plan_generated',
        redirectTo: '/plan-overview',
      };
    }
  }

  if (daysToRace === 0) {
    return {
      trainingStatus: 'race_day',
      redirectTo: '/race-morning',
    };
  }

  if (daysToRace <= 2 && daysToRace >= 1) {
    return {
      trainingStatus: 'pre_race',
      redirectTo: '/pre-race-hub',
    };
  }

  if (now > raceDate) {
    return {
      trainingStatus: 'post_race',
      redirectTo: '/race-reflection',
    };
  }

  if (daysSinceCheckIn !== null && daysSinceCheckIn > 14) {
    return {
      trainingStatus: 'training_inactive',
      redirectTo: '/resume-training',
    };
  }

  return {
    trainingStatus: 'training_active',
    redirectTo: '/training-pulse-hub',
  };
}
