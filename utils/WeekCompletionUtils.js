function isFinalTrainingDay(activityDateStr, weekPlan) {
  const activityDate = new Date(activityDateStr);
  const endDate = new Date(weekPlan.endDate);

  // Strip time for day match
  return (
    activityDate.getFullYear() === endDate.getFullYear() &&
    activityDate.getMonth() === endDate.getMonth() &&
    activityDate.getDate() === endDate.getDate()
  );
}

module.exports = { isFinalTrainingDay };
