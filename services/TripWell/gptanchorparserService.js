const path = require("path");
const AnchorLogic = require(path.resolve(__dirname, "../../models/TripWell/AnchorLogic"));

async function getAnchorData(tripId, userId) {
  try {
    const anchorDoc = await AnchorLogic.findOne({ tripId, userId });
    if (!anchorDoc) {
      console.warn("⚠️ No AnchorLogic found for this trip/user combo.");
      return null;
    }
    return anchorDoc.enrichedAnchors;
  } catch (err) {
    console.error("🔥 Error retrieving AnchorLogic:", err);
    throw err;
  }
}

module.exports = {
  getAnchorData,
};
