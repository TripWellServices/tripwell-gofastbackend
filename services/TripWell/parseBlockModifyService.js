/**
 * Parse a single-block GPT modification output (Angela).
 * Expected GPT format:
 * {
 *   "block": { "title": "...", "desc": "..." }
 * }
 */
function parseBlockModifyService(gptOutput) {
  let parsed = {};

  try {
    if (typeof gptOutput === "string") {
      parsed = JSON.parse(gptOutput);
    } else if (typeof gptOutput === "object" && gptOutput !== null) {
      parsed = gptOutput;
    } else {
      throw new Error("Invalid GPT output format");
    }

    const { block } = parsed;

    if (!block || typeof block !== "object") {
      throw new Error("Missing or invalid 'block' in GPT response");
    }

    return {
      title: block.title?.trim() || "(No title)",
      desc: block.desc?.trim() || "(No description)"
    };
  } catch (err) {
    console.error("🛑 Error in parseBlockModifyService:", err);
    throw new Error("Failed to parse single block GPT output");
  }
}

module.exports = { parseBlockModifyService };
