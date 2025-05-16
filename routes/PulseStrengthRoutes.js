import express from "express";
import { savePulseStrength } from "../controllers/PulseStrengthController.js";

const router = express.Router();
router.post("/save", savePulseStrength);
export default router;
