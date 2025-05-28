require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ No OpenAI API key found. Skipping OpenAI config.");
  module.exports = null;
} else {
  const OpenAI = require("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  module.exports = openai;
}
