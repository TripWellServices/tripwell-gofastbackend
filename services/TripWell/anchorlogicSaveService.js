const mongoose = require("mongoose");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const { parseAnchorSuggestionsWithLogic } = require("./gptanchorparserService");

async function saveAnchorLogic(tripId, userId, anchorTitles) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  if (!Array.isArray(anchorTitles) || anchorTitles.length === 0) {
    throw new Error("Must include at least one anchor title");
  }

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  // 🧠 Marlo enriches placeholders
  const hydratedAnchors = anchorTitles.map(title => ({
    title,
    description: "",
    location: "",
    isDayTrip: false,
    suggestedFollowOn: "",
  }));

  const enrichedAnchors = await parseAnchorSuggestionsWithLogic(hydratedAnchors);

  // 💾 Save new AnchorLogic doc
  const anchorLogic = await AnchorLogic.create({
    tripId: tripObjectId,
    userId,
    enrichedAnchors,
  });

  return anchorLogic;
}

module.exports = { saveAnchorLogic };
