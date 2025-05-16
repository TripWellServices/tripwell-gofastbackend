export const getDayOfWeek = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
};

export const isDateInWeek = (dateStr, startDate, weekIndex) => {
  const { weekStart, weekEnd } = getWeekDateRange(startDate, weekIndex);
  return dateStr >= weekStart && dateStr <= weekEnd;
};
