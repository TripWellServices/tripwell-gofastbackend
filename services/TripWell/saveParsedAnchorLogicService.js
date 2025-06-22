const mongoose = require("mongoose");
const { parseAnchorSuggestionsWithLogic } = require("./gptanchorparserService");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");

async function saveParsedAnchorLogic({ tripId, userId, selectedAnchors }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");
  if (!Array.isArray(selectedAnchors) || selectedAnchors.length === 0) {
    throw new Error("Selected anchors must be a non-empty array");
  }

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  // 🔍 Step 1: Parse with Marlo
  const enrichedAnchors = await parseAnchorSuggestionsWithLogic(selectedAnchors);

  // 💾 Step 2: Save to AnchorLogic model
  const anchorLogicRecord = await AnchorLogic.create({
    tripId: tripObjectId,
    userId,
    enrichedAnchors,
  });

  return {
    enrichedAnchors,
    anchorLogicRecord,
  };
}

module.exports = { saveParsedAnchorLogic };