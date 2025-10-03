const MentalEntry = require("../models/GoFastMVP2/MentalEntry");

const saveMentalEntry = async ({ userId, mood, text }) => {
  const date = new Date().toISOString().split("T")[0];
  return await MentalEntry.create({
    userId,
    date,
    mood,
    text
  });
};

const getMentalEntriesForUser = async (userId, limit = 10) => {
  return await MentalEntry.find({ userId }).sort({ date: -1 }).limit(limit);
};

const hasMoodDropoff = async (userId, days = 5) => {
  const entries = await getMentalEntriesForUser(userId, 30);
  const dateSet = new Set(entries.map(e => e.date));
  let missed = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (!dateSet.has(key)) missed++;
  }

  return missed >= days;
};

module.exports = {
  saveMentalEntry,
  getMentalEntriesForUser,
  hasMoodDropoff
};
