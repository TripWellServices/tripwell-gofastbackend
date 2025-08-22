// services/TripWell/gptitineraryparserService.js

function parseAngelaItinerary(itineraryString) {
  const daySections = itineraryString.split(/(?=^Day \d+ – )/gm);

  const parsedDays = daySections.map((section) => {
    const lines = section.trim().split("\n").filter(Boolean);

    const header = lines.shift(); // "Day X – Weekday, Month Day"
    const summaryLine = lines.shift(); // "Summary of the day: ..."

    const dayIndexMatch = header?.match(/^Day (\d+)/);
    if (!dayIndexMatch) return null;

    const dayIndex = parseInt(dayIndexMatch[1], 10);
    const summary = summaryLine?.replace(/^Summary of the day:\s*/i, "").trim() || "";

    const blocks = {};
    let currentBlock = null;

    lines.forEach((line) => {
      const isHeader = line.match(/^(Morning|Afternoon|Evening):$/i);
      if (isHeader) {
        currentBlock = isHeader[1].toLowerCase();
        blocks[currentBlock] = [];
        return;
      }

      if (/^[•\-]/.test(line) && currentBlock) {
        blocks[currentBlock].push(line.replace(/^[•\-]\s*/, "").trim());
      }
    });

    // Format blocks into { title, desc } style
    const formattedBlocks = {};
    ["morning", "afternoon", "evening"].forEach((blockKey) => {
      const entries = blocks[blockKey] || [];
      if (entries.length > 0) {
        formattedBlocks[blockKey] = {
          title: entries[0],
          description: entries.slice(1).join(" ")
        };
      }
    });

    return {
      dayIndex,
      summary,
      blocks: formattedBlocks
    };
  }).filter(Boolean);

  return parsedDays;
}

module.exports = { parseAngelaItinerary };
