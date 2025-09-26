const express = require("express");
const router = express.Router();
const { modifyBlockExecution } = require("../../services/TripWell/modifyBlockExecutionService");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

/**
 * POST /tripwell/execution/modify-block
 * Modifies a block in TripCurrentDays (live trip phase)
 */
router.post("/execution/modify-block", verifyFirebaseToken, async (req, res) => {
  const { tripId, dayIndex, block, feedback } = req.body;

  if (!tripId || typeof dayIndex !== "number" || !block || !feedback) {
    return res.status(400).json({ 
      error: "Missing required fields: tripId, dayIndex, block, feedback" 
    });
  }

  try {
    console.log("🚀 Execution block modification request:", { tripId, dayIndex, block });
    
    const result = await modifyBlockExecution({ tripId, dayIndex, block, feedback });
    
    res.status(200).json({
      success: true,
      message: "Live trip block modified successfully",
      updatedBlock: result.updatedBlock,
      updatedLiveTrip: result.updatedLiveTrip
    });
    
  } catch (error) {
    console.error("❌ Execution block modification error:", error);
    res.status(500).json({ 
      error: "Failed to modify live trip block",
      details: error.message 
    });
  }
});

module.exports = router;
