const TripDay = require("../../models/TripWell/TripDay");

async function saveTripDaysFromAngela(tripId, itineraryString) {
  const daySections = itineraryString.split(/(?=^Day \d+ – )/gm);

  const tripDays = daySections.map((block) => {
    const lines = block.trim().split("\n").filter(Boolean);
    const header = lines.shift();
    const summary = lines.shift()?.replace(/^Summary of the day:\s*/i, "").trim();

    const dayIndex = parseInt(header.match(/^Day (\d+)/)?.[1], 10);

    const blocks = {};
    let currentBlock = null;

    lines.forEach((line) => {
      const isBlockHeader = /^(Morning|Afternoon|Evening):$/i.exec(line);
      if (isBlockHeader) {
        currentBlock = isBlockHeader[1].toLowerCase();
        blocks[currentBlock] = [];
      } else if (line.startsWith("•") && currentBlock) {
        blocks[currentBlock].push(line.replace(/^•\s*/, "").trim());
      }
    });

    const formattedBlocks = {};
    for (const [key, entries] of Object.entries(blocks)) {
      if (entries.length) {
        formattedBlocks[key] = {
          title: entries[0],
          desc: entries.slice(1).join(" ")
        };
      }
    }

    return {
      tripId,
      dayIndex,
      summary,
      blocks: formattedBlocks
    };
  });

  const created = await Promise.all(tripDays.map((day) => TripDay.create(day)));
  return created.length;
}

module.exports = { saveTripDaysFromAngela };
