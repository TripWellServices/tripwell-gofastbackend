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

async function parseAnchorSuggestionsWithLogic(anchors) {
  // For now, return the anchors as-is since they're already in the right format
  // In the future, this could call GPT to enrich the anchor data further
  try {
    if (!Array.isArray(anchors)) {
      throw new Error("Anchors must be an array");
    }
    
    // Ensure each anchor has the required fields
    const enrichedAnchors = anchors.map(anchor => ({
      title: anchor.title || "",
      description: anchor.description || `Experience: ${anchor.title}`,
      location: anchor.location || "",
      isDayTrip: anchor.isDayTrip || false,
      suggestedFollowOn: anchor.suggestedFollowOn || ""
    }));
    
    console.log("✅ Parsed anchor suggestions:", enrichedAnchors.length);
    return enrichedAnchors;
  } catch (err) {
    console.error("🔥 Error parsing anchor suggestions:", err);
    throw err;
  }
}

module.exports = {
  getAnchorData,
  parseAnchorSuggestionsWithLogic,
};
