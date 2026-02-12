import express from "express"



import {
    getClientProgress,
    getClientNutritionProgress,
    getClientDashboard,
    getWeeklySummary,
    logWeight
} from "../controllers/progressLogsController";

const router = express.Router();

// ===========================
// PROGRESS TRACKING ROUTES
// ===========================

/**
 * GET myprogress/progress/:userId
 * Returns weight, BMI, and cumulative workout progress over time
 */
router.get("/progress/:userId", getClientProgress);

/**
 * GET /myprogress/nutrition/:userId
 * Returns daily nutrition logs (calories, protein, carbs, fats, meal count)
 */
router.get("/nutrition/:userId", getClientNutritionProgress);

/**
 * GET myprogress/dashboard/:userId
 * Returns summary statistics for the dashboard:
 * - Workout stats (last 30 days)
 * - Nutrition stats (last 30 days)
 * - Current streak information
 */
router.get("/dashboard/:userId", getClientDashboard);

/**
 * GET /api/myprogress/weekly/:userId
 * Returns last 7 days of activity (workouts, meals, calories, minutes)
 */
router.get("/weekly/:userId", getWeeklySummary);

router.post("/progress/:userId/log-weight", logWeight);

export default router;