import { Router } from "express";
import { logMealWithAI, getDailyLog } from "../controllers/mealLogsController"; // Update path
import {protect} from "../middlewares/auth/protect"; // Your auth middleware

const router = Router();

// Existing routes...

// NEW Routes for manual logging
router.post('/track', protect, logMealWithAI);
router.get('/track/daily', protect, getDailyLog);

export default router;