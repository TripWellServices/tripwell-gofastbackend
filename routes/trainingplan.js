const express = require("express");
const router = express.Router();
const { generateWeeklyPlan } = require("../services/WeeklyGeneratorService");
const { TrainingPlan } = require("../models/TrainingPlan"); // assumes Mongoose model
const { getPhaseMap } = require("../utils/phaseUtils");
const { getWeeklyMileagePlan } = require("../utils/WeeklyMileageUtils");

router.post("/generate-training-plan", async (req, res) => {
  const { userId, startDate, raceDate, current5kPace, age } = req.body;
  const totalWeeks = Math.ceil((new Date(raceDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 7));

  const phaseOverview = getPhaseMap(totalWeeks);
  const weeklyMileagePlan = getWeeklyMileagePlan(35, totalWeeks);
  const week0 = generateWeeklyPlan({ weekIndex: 0, phase: "Build", weeklyMileage: weeklyMileagePlan[0], current5kPace, age });

  const plan = await TrainingPlan.create({
    userId,
    startDate,
    raceDate,
    totalWeeks,
    phaseOverview,
    weeklyMileagePlan,
    weeks: [week0]
  });

  res.json({
    totalWeeks,
    weeklyMileagePlan,
    phaseOverview,
    week0,
    startDate,
    raceDate
  });
});

router.get("/week/:index", async (req, res) => {
  const { userId } = req.query;
  const { index } = req.params;
  const plan = await TrainingPlan.findOne({ userId });

  if (!plan) return res.status(404).send("No training plan found");

  if (plan.weeks.length > index) {
    return res.json(plan.weeks[index]);
  }

  const weekIndex = parseInt(index);
  const phase = plan.phaseOverview.find(p => p.weeks.includes(weekIndex + 1))?.name || "Build";
  const weeklyMileage = plan.weeklyMileagePlan[weekIndex];
  const newWeek = generateWeeklyPlan({
    weekIndex,
    phase,
    weeklyMileage,
    current5kPace: req.query.current5kPace,
    age: req.query.age
  });

  plan.weeks[weekIndex] = newWeek;
  await plan.save();

  res.json(newWeek);
});

router.get("/day/today", async (req, res) => {
  const { userId, currentDate } = req.query;
  const plan = await TrainingPlan.findOne({ userId });
  if (!plan) return res.status(404).send("No training plan found");

  const totalDays = Math.floor((new Date(currentDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(totalDays / 7);
  const dayIndex = totalDays % 7;

  const week = plan.weeks[weekIndex];
  if (!week || !week.days[dayIndex]) return res.status(404).send("Workout not found");

  res.json(week.days[dayIndex]);
});

module.exports = router;