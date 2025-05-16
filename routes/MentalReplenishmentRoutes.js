import express from "express";
import { saveMentalReplenishment } from "../controllers/MentalReplenishmentController.js";

const router = express.Router();
router.post("/save", saveMentalReplenishment);
export default router;
