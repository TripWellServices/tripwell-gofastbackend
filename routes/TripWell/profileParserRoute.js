const express = require("express");
const router = express.Router();
const { parseProfileData, validateProfileData } = require("../../services/TripWell/profileParserService");

/**
 * POST /Tripwell/profile-parser
 * Parses and validates GPT response for profile content
 */
router.post("/profile-parser", async (req, res) => {
  const { rawResponse } = req.body;

  // Validate input
  if (!rawResponse) {
    return res.status(400).json({
      status: "error",
      message: "Missing required field: rawResponse"
    });
  }

  try {
    // Parse the raw response
    const parseResult = parseProfileData(rawResponse);
    
    if (!parseResult.success) {
      return res.status(400).json({
        status: "error",
        message: parseResult.error
      });
    }

    // Validate the parsed data
    const validationResult = validateProfileData(parseResult.data);
    
    if (!validationResult.success) {
      return res.status(400).json({
        status: "error",
        message: validationResult.error
      });
    }

    // Return parsed and validated data
    res.status(200).json({
      status: "ok",
      profileData: validationResult.data
    });

  } catch (error) {
    console.error("Parser error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Parser failed"
    });
  }
});

module.exports = router;
