import express from "express";
import {
  createMealPlan,
  getDieticianMealPlans,
  updateMealPlan,
  deleteMealPlan,
  getMyMealPlans,
  assignMealPlan,
  getClientAssignedMealPlans,
  getDieticianClients,
} from "../controllers/mealplanController";
import { protect } from "../middlewares/auth/protect";

const router = express.Router();

// All routes are protected (require authentication)
router.post("/", protect, createMealPlan);
router.get("/", protect, getMyMealPlans);
router.post("/assign", protect, assignMealPlan);
router.get("/clients", protect, getDieticianClients);
router.get("/dietician/:id", protect, getDieticianMealPlans);
router.put("/:id", protect, updateMealPlan);
router.delete("/:id", protect, deleteMealPlan);
router.get("/client/:clientId", protect, getClientAssignedMealPlans);

export default router;