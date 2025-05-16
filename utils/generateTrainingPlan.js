// utils/generateTrainingPlan.js
const generateTrainingPlan = (startDate, raceDate) => {
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const start = new Date(startDate);
  const end = new Date(raceDate);
  const totalWeeks = Math.ceil((end - start) / msInWeek);

  const definePhases = (weeks) => {
    const base = Math.max(2, Math.floor(weeks * 0.25));
    const build = Math.max(2, Math.floor(weeks * 0.35));
    const peak = Math.max(2, Math.floor(weeks * 0.2));
    const taper = weeks - (base + build + peak);
    return { base, build, peak, taper };
  };

  const { base, build, peak, taper } = definePhases(totalWeeks);

  const generateWeek = (weekNum, phase) => {
    return {
      week: weekNum,
      phase,
      workouts: [
        { day: 'Mon', type: 'easy', miles: 4 },
        { day: 'Tue', type: 'rest' },
        { day: 'Wed', type: phase === 'peak' ? 'intervals' : 'tempo', miles: 6 },
        { day: 'Thu', type: 'easy', miles: 4 },
        { day: 'Fri', type: 'rest' },
        { day: 'Sat', type: 'long', miles: 10 + weekNum },
        { day: 'Sun', type: 'cross' }
      ]
    };
  };

  const plan = [];
  let weekNum = 1;

  for (let i = 0; i < base; i++) plan.push(generateWeek(weekNum++, 'base'));
  for (let i = 0; i < build; i++) plan.push(generateWeek(weekNum++, 'build'));
  for (let i = 0; i < peak; i++) plan.push(generateWeek(weekNum++, 'peak'));
  for (let i = 0; i < taper; i++) plan.push(generateWeek(weekNum++, 'taper'));

  return plan;
};

module.exports = generateTrainingPlan;
