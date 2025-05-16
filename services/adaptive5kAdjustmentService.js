const adjustAdaptive5kTime = (base5kTimeSec, efficiencyScore) => {
  let timeDelta = 0;

  if (efficiencyScore >= 0.95) {
    timeDelta = -10; // excellent alignment
  } else if (efficiencyScore >= 0.80) {
    timeDelta = -5;  // solid alignment
  } else if (efficiencyScore >= 0.60) {
    timeDelta = 0;   // neutral, no adaptation
  } else if (efficiencyScore >= 0.40) {
    timeDelta = 5;   // underperformance
  } else {
    timeDelta = 10;  // major misalignment
  }

  return base5kTimeSec + timeDelta;
};

module.exports = { adjustAdaptive5kTime };
