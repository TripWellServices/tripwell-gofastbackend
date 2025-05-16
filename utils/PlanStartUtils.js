export const getCurrentWeekIndex = (startDate) => {
  const today = new Date();
  const days = Math.floor((today - new Date(startDate)) / (1000 * 60 * 60 * 24));
  return Math.floor(days / 7);
};

export const getWeekDateRange = (startDate, weekIndex) => {
  const start = new Date(startDate);
  start.setDate(start.getDate() + (weekIndex * 7));

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return {
    weekStart: start.toISOString().split("T")[0],
    weekEnd: end.toISOString().split("T")[0]
  };
};
