import express from "express";
import { savePulsePerformance } from "../controllers/PulsePerformanceController.js";

const router = express.Router();
router.post("/save", savePulsePerformance);
export default router;
