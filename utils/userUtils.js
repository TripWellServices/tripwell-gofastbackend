
const MS_IN_ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function shouldBecomeInactive(user) {
  if (!user || user.userStatus !== "training" || !user.lastGarminLog) return false;
  const now = Date.now();
  const lastLogTime = new Date(user.lastGarminLog).getTime();
  return now - lastLogTime > MS_IN_ONE_WEEK;
}

export function shouldPromoteToRaceMode(user, trainingPlan) {
  if (!trainingPlan?.raceGoal?.date) return false;
  const now = new Date();
  const raceDate = new Date(trainingPlan.raceGoal.date);
  const daysToRace = Math.floor((raceDate - now) / (1000 * 60 * 60 * 24));
  return daysToRace >= 1 && daysToRace <= 2 && user.userStatus === "training";
}
