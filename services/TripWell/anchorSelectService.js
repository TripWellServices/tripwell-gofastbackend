const mongoose = require("mongoose");
const AnchorSelect = require("../../models/TripWell/AnchorSelect");

async function saveAnchorSelection({ tripId, userId, selectedAnchors }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  if (!Array.isArray(selectedAnchors) || selectedAnchors.length < 1) {
    throw new Error("Must include at least one anchor");
  }

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  const anchorSelect = await AnchorSelect.create({
    tripId: tripObjectId,
    userId,
    selectedAnchors,
  });

  return anchorSelect;
}

module.exports = { saveAnchorSelection };
