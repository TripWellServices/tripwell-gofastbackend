// services/TripWell/anchorSelectsService.js

const mongoose = require("mongoose");
const AnchorSelects = require("../../models/TripWell/AnchorSelects");

async function saveAnchorSelects(tripId, userId, selectedAnchors, rawNotes = null) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");
  if (!Array.isArray(selectedAnchors) || selectedAnchors.length === 0) {
    throw new Error("Must include at least one selected anchor");
  }

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  const result = await AnchorSelects.create({
    tripId: tripObjectId,
    userId,
    selectedAnchors,
    rawNotes,
  });

  return result;
}

module.exports = { saveAnchorSelects };
