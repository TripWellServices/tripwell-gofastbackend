// services/TripWell/singleDayModifyfromParseSaver.js

const TripDay = require("../../models/TripWell/TripDay");

/**
 * Save parsed single-day modification to the correct TripDay by index.
 * @param {string} tripId
 * @param {number} dayIndex
 * @param {object} parsedDay - Output of parseSingleDayModify()
 * @param {string} parsedDay.summary
 * @param {object} parsedDay.blocks
 * @returns {Promise<TripDay>}
 */
async function saveParsedDayModification({ tripId, dayIndex, parsedDay }) {
  if (!tripId || typeof dayIndex !== "number") {
    throw new Error("Invalid tripId or dayIndex");
  }

  const { summary, blocks } = parsedDay || {};

  if (!summary || typeof blocks !== "object") {
    throw new Error("Parsed day missing summary or blocks");
  }

  const updated = await TripDay.findOneAndUpdate(
    { tripId, dayIndex },
    { summary, blocks },
    { new: true }
  );

  if (!updated) {
    throw new Error(`TripDay not found for tripId ${tripId}, dayIndex ${dayIndex}`);
  }

  return updated;
}

module.exports = { saveParsedDayModification };
