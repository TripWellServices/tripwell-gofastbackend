export function shouldShowWeeklyReview(trainingPlan, today) {
  const endDate = new Date(trainingPlan.weekEndDate);
  return today >= endDate;
}
