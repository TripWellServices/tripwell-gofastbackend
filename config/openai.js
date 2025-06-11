// config/openai.js
require("dotenv").config();

const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ No OpenAI API key found. Skipping OpenAI config.");
  module.exports = null;
} else {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  module.exports = openai; // ✅ export instance directly (no curly braces)
}
