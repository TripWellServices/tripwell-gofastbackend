const TripDay = require("../../models/TripWell/TripDay");

/**
 * Saves a single block modification into the TripDay document.
 * This is canon: used in block-level GPT flows (TripModifyDay, TripLive).
 *
 * @param {Object} params
 * @param {string} params.tripId
 * @param {number} params.dayIndex
 * @param {string} params.block - "morning" | "afternoon" | "evening"
 * @param {Object} params.updatedBlock - { title: string, desc: string }
 * @returns {Promise<Object>} - Updated TripDay document
 */
async function saveParsedDayModification({ tripId, dayIndex, block, updatedBlock }) {
  if (!tripId || typeof dayIndex !== "number" || !block || !updatedBlock) {
    throw new Error("Missing required fields for block save");
  }

  const validBlocks = ["morning", "afternoon", "evening"];
  if (!validBlocks.includes(block)) {
    throw new Error(`Invalid block: ${block}`);
  }

  const tripDay = await TripDay.findOne({ tripId, dayIndex });
  if (!tripDay) {
    throw new Error(`TripDay not found for tripId ${tripId}, dayIndex ${dayIndex}`);
  }

  tripDay.blocks[block] = {
    title: updatedBlock.title?.trim() || "(No title)",
    desc: updatedBlock.desc?.trim() || "(No description)",
  };

  await tripDay.save();

  return tripDay;
}

module.exports = { saveParsedDayModification };
