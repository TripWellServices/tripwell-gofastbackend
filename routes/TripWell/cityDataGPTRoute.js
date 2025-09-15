const express = require("express");
const router = express.Router();
const gpt = require("../../config/openai");

/**
 * POST /Tripwell/city-data-gpt
 * Calls GPT to get city travel data
 */
router.post("/city-data-gpt", async (req, res) => {
  const { city, country, currency_code } = req.body;

  // Validate input
  if (!city || !country || !currency_code) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: city, country, currency_code"
    });
  }

  if (!gpt) {
    return res.status(500).json({
      status: "error",
      message: "GPT not configured"
    });
  }

  try {
    // Call GPT with Angela prompt
    const completion = await gpt.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Angela, TripWell's travel assistant. Return structured JSON only with keys: { city, country, currency_code, pois[], restaurants[], transportation[] }. No prose. No markdown."
        },
        {
          role: "user",
          content: `Get travel data for ${city}, ${country} with currency ${currency_code}`
        }
      ],
      temperature: 0.3
    });

    const responseText = completion.choices[0].message.content;

    // Return raw response for parser to handle
    res.status(200).json({
      status: "ok",
      city: city,
      rawResponse: responseText
    });

  } catch (error) {
    console.error("GPT call error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "GPT call failed"
    });
  }
});

module.exports = router;
