const TripDay = require("../../models/TripWell/TripDay");

async function saveTripDaysFromAngela(tripId, itineraryString) {
  const daySections = itineraryString.split(/(?=^Day \d+ – )/gm);

  const tripDays = daySections.map((block) => {
    const lines = block.trim().split("\n").filter(Boolean);

    const header = lines.shift();
    const summary = lines.shift()?.replace(/^Summary of the day:\s*/i, "").trim();

    const dayIndexMatch = header?.match(/^Day (\d+)/);
    if (!dayIndexMatch) return null;

    const dayIndex = parseInt(dayIndexMatch[1], 10);
    const blocks = {};
    let currentBlock = null;

    lines.forEach((line) => {
      line = line.trim();

      const isHeader = /^(Morning|Afternoon|Evening):$/i.exec(line);
      if (isHeader) {
        currentBlock = isHeader[1].toLowerCase();
        blocks[currentBlock] = [];
        return;
      }

      if (/^[•\-]/.test(line) && currentBlock) {
        blocks[currentBlock].push(line.replace(/^[•\-]\s*/, "").trim());
      }
    });

    // Final formatting: { title, desc } for each block
    const formattedBlocks = {};
    ["morning", "afternoon", "evening"].forEach((blockKey) => {
      const entries = blocks[blockKey] || [];
      if (entries.length > 0) {
        formattedBlocks[blockKey] = {
          title: entries[0],
          desc: entries.slice(1).join(" "),
        };
      }
    });

    return {
      tripId,
      dayIndex,
      summary,
      blocks: formattedBlocks,
    };
  }).filter(Boolean); // Filter out malformed/null days

  // Clean slate + save
  await TripDay.deleteMany({ tripId });
  const created = await TripDay.insertMany(tripDays);
  return created.length;
}

module.exports = { saveTripDaysFromAngela };
