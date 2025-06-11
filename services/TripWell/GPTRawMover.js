// services/TripWell/GPTRawMoverService.js
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const TripGPT = require("../../models/TripWell/TripGPT");

async function moveLatestRawToTripGPT({ tripId, userId }) {
  const raw = await TripGPTRaw.findOne({ tripId, userId }).sort({ timestamp: -1 });
  if (!raw) throw new Error("No raw GPT entry found");

  const content = raw.response?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("No content in raw GPT response");

  const saved = await TripGPT.create({ tripId, userId, gptReply: content });
  return { gptReply: saved.gptReply, replyId: saved._id };
}

module.exports = { moveLatestRawToTripGPT };
