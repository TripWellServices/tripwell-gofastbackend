// services/TripWell/parseSingleDayModify.js

/**
 * Parse a single-day GPT modification output (Angela).
 * Assumes output is either a valid JSON string or structured object.
 */
function parseSingleDayModify(gptOutput) {
  let parsed = {};

  try {
    if (typeof gptOutput === "string") {
      parsed = JSON.parse(gptOutput);
    } else if (typeof gptOutput === "object" && gptOutput !== null) {
      parsed = gptOutput;
    } else {
      throw new Error("Invalid GPT output format");
    }

    const { summary, blocks } = parsed;

    if (!summary || typeof blocks !== "object") {
      throw new Error("Missing summary or blocks in GPT response");
    }

    const formattedBlocks = {};
    ["morning", "afternoon", "evening"].forEach((key) => {
      const block = blocks[key];
      if (block && typeof block === "object") {
        formattedBlocks[key] = {
          title: block.title?.trim() || "",
          desc: block.desc?.trim() || ""
        };
      }
    });

    return {
      summary: summary.trim(),
      blocks: formattedBlocks
    };
  } catch (err) {
    console.error("🛑 Error in parseSingleDayModify:", err);
    throw new Error("Failed to parse single day GPT modification");
  }
}

module.exports = { parseSingleDayModify };
