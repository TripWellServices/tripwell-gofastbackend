// Read from journal entries in localStorage
export const getMoodHistory = () => {
  const raw = localStorage.getItem("gofast-journal-entries");
  const entries = raw ? JSON.parse(raw) : [];

  // Extract mood + date from each
  return entries
    .filter(e => e.mood && e.date)
    .map(e => ({ mood: e.mood, date: e.date }));
};
