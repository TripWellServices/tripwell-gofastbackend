const express = require("express");
const router = express.Router();
const { generateAnchorSuggestionsTest } = require("../../services/anchorgpttestService");

// GET /tripwell/anchorgpttest
router.get("/anchorgpttest", async (req, res) => {
  try {
    console.log("🔍 Generating test anchor suggestions");
    const result = await generateAnchorSuggestionsTest();
    console.log("✅ Test anchor suggestions generated:", result.anchors?.length || 0, "anchors");
    res.status(200).json(result);
  } catch (err) {
    console.error("🔥 Anchor GPT Test Route Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
