import { Router } from "express";
import { getAllSystemWorkouts, getRecommendedWorkouts, getSavedWorkouts, getWorkoutDetails, saveWorkout } from "../controllers/recommendedWorkouts";

const router = Router();
router.post('/save', saveWorkout);
router.get('/all', getAllSystemWorkouts);
router.get("/recommended/:userId", getRecommendedWorkouts);
router.get("/details/:templateId", getWorkoutDetails);
router.get("/saved/:userId", getSavedWorkouts);

export default router;