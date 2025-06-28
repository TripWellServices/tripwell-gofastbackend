const TripDay = require("../../models/TripWell/TripDay");
const TripBase = require("../../models/TripWell/TripBase");

async function generateTripDays(tripId) {
  const trip = await TripBase.findById(tripId);
  if (!trip) throw new Error("Trip not found");

  const startDate = new Date(trip.startDate);
  const daysTotal = trip.daysTotal || 1;

  const dayPromises = [];

  for (let i = 0; i < daysTotal; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const day = new TripDay({
      tripId,
      dayIndex: i,
      summary: "",
      blocks: {
        morning: { title: "", desc: "" },
        afternoon: { title: "", desc: "" },
        evening: { title: "", desc: "" }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    dayPromises.push(day.save());
  }

  return await Promise.all(dayPromises);
}

module.exports = generateTripDays;
