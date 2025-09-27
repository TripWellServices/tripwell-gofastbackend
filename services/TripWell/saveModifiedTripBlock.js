const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

/**
 * Saves a modified block into the TripCurrentDays.blocks[block] field.
 * Overwrites only the specified block.
 */
async function saveModifiedTripBlock({ tripId, dayIndex, block, newBlock }) {
  if (!tripId || typeof dayIndex !== "number" || !block || !newBlock) {
    throw new Error("Missing required fields for saveModifiedTripBlock");
  }

  const updated = await TripCurrentDays.findOneAndUpdate(
    { tripId, dayIndex },
    {
      $set: {
        [`blocks.${block}.title`]: newBlock.title,
        [`blocks.${block}.desc`]: newBlock.desc
      }
    },
    { new: true }
  );

  if (!updated) {
    throw new Error(`Failed to update TripCurrentDays ${tripId} Day ${dayIndex}`);
  }

  return updated;
}

module.exports = { saveModifiedTripBlock };
