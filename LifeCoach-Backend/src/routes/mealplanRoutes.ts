import express from "express";
import {
  createMealPlan,
  getDieticianMealPlans,
  updateMealPlan,
  deleteMealPlan,
  getMyMealPlans,
} from "../controllers/mealplanController";
import { protect } from "../middlewares/auth/protect";

const router = express.Router();

// All routes are protected (require authentication)
router.post("/", protect, createMealPlan);
router.get("/", protect, getMyMealPlans); 
router.get("/dietician/:id", protect, getDieticianMealPlans);
router.put("/:id", protect, updateMealPlan);
router.delete("/:id", protect, deleteMealPlan);

export default router;