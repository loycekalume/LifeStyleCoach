import { Router } from "express";
import { generateDailyPlan, saveMealPlan } from "../controllers/recommendeMealPlans";

const router = Router();

// Route to generate a random plan (refreshable)
router.get("/generate/:userId", generateDailyPlan);

// Route to save the plan if they click "Save"
router.post("/save", saveMealPlan);

export default router;