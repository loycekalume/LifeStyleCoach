import { Router } from "express";
import { logCompletedWorkout } from "../controllers/workoutLogs";

const router = Router();

router.post('/complete', logCompletedWorkout)

export default router;


