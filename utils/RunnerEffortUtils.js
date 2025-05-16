function classifyRunEffort({ paceAligned, hrAligned }) {
  if (paceAligned && hrAligned) {
    return {
      score: 1.0,
      label: 'Efficient',
      comment: 'Pace and HR aligned — ideal training effort.'
    };
  } else if (paceAligned && !hrAligned) {
    return {
      score: 0.5,
      label: 'Runner Grit',
      comment: 'You hit your target pace, even as HR climbed. High effort — be mindful of recovery.'
    };
  } else if (!paceAligned && hrAligned) {
    return {
      score: 0.25,
      label: 'Controlled',
      comment: 'HR was in range, but pace was low — likely a recovery effort.'
    };
  } else {
    return {
      score: 0.0,
      label: 'Inefficient',
      comment: 'Neither pace nor HR aligned — training intent missed.'
    };
  }
}

module.exports = { classifyRunEffort };