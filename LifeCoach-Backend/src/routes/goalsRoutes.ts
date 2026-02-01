import { Router } from "express";
import { protect } from "../middlewares/auth/protect"; 
import { getClientGoals } from "../controllers/goalsController"; 

const router = Router();

router.get("/", protect, getClientGoals);

export default router;