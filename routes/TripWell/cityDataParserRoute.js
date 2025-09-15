const express = require("express");
const router = express.Router();
const { parseCityData, validateCityData } = require("../../services/TripWell/cityDataParserService");

/**
 * POST /Tripwell/city-data-parser
 * Parses and validates GPT response for city data
 */
router.post("/city-data-parser", async (req, res) => {
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
    const parseResult = parseCityData(rawResponse);
    
    if (!parseResult.success) {
      return res.status(400).json({
        status: "error",
        message: parseResult.error
      });
    }

    // Validate the parsed data
    const validationResult = validateCityData(parseResult.data);
    
    if (!validationResult.success) {
      return res.status(400).json({
        status: "error",
        message: validationResult.error
      });
    }

    // Return parsed and validated data
    res.status(200).json({
      status: "ok",
      cityData: validationResult.data
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
