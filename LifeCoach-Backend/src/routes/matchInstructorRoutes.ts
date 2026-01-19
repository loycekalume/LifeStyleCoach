import { Router } from "express";
import { getMatchedInstructors } from "../controllers/matchInstructorController";
import { protect } from "../middlewares/auth/protect";

const router = Router();

// This endpoint requires the user to be logged in (to get their user_id for the match)
router.get("/match", protect, getMatchedInstructors);

export default router;