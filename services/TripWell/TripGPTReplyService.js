// services/TripWell/GPTRawMover.js

const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const TripGPT = require("../../models/TripWell/TripGPT");

async function GPTRawMover({ tripId, userId, rawId }) {
  if (!tripId || !userId || !rawId) {
    throw new Error("Missing required parameters to move GPT raw");
  }

  // 🔍 Fetch the raw GPT freeze frame
  const raw = await TripGPTRaw.findById(rawId);
  if (!raw || !raw.response) {
    throw new Error("Raw GPT response not found");
  }

  const gptReply = raw.response.choices?.[0]?.message?.content?.trim();
  if (!gptReply) {
    throw new Error("No reply content found in GPT response");
  }

  // 💾 Save parsed reply into TripGPT model
  const savedReply = await TripGPT.create({
    tripId,
    userId,
    gptReply,
    parsed: {}, // placeholder — future structure parser
    timestamp: new Date(),
  });

  return {
    gptReply,
    replyId: savedReply._id,
  };
}

module.exports = GPTRawMover;
