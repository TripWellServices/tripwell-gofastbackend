const express = require("express");
const router = express.Router();
const { modifyBlockPlanner } = require("../../services/TripWell/modifyBlockPlannerService");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

/**
 * POST /tripwell/planner/modify-block
 * Modifies a block in ItineraryDays (planning phase)
 */
router.post("/planner/modify-block", verifyFirebaseToken, async (req, res) => {
  const { tripId, dayIndex, block, feedback } = req.body;

  if (!tripId || typeof dayIndex !== "number" || !block || !feedback) {
    return res.status(400).json({ 
      error: "Missing required fields: tripId, dayIndex, block, feedback" 
    });
  }

  try {
    console.log("🎯 Planner block modification request:", { tripId, dayIndex, block });
    
    const result = await modifyBlockPlanner({ tripId, dayIndex, block, feedback });
    
    res.status(200).json({
      success: true,
      message: "Planning block modified successfully",
      updatedBlock: result.updatedBlock,
      updatedItinerary: result.updatedItinerary
    });
    
  } catch (error) {
    console.error("❌ Planner block modification error:", error);
    res.status(500).json({ 
      error: "Failed to modify planning block",
      details: error.message 
    });
  }
});

module.exports = router;
