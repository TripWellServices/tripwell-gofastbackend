const TripDay = require("../../models/TripWell/TripDay");

/**
 * Saves a modified block into the TripDay.blocks[block] field.
 * Overwrites only the specified block.
 */
async function saveModifiedTripBlock({ tripId, dayIndex, block, newBlock }) {
  if (!tripId || typeof dayIndex !== "number" || !block || !newBlock) {
    throw new Error("Missing required fields for saveModifiedTripBlock");
  }

  const updated = await TripDay.findOneAndUpdate(
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
    throw new Error(`Failed to update TripDay ${tripId} Day ${dayIndex}`);
  }

  return updated;
}

module.exports = { saveModifiedTripBlock };
