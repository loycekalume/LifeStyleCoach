import { Router } from "express";
import { 
  generateMealRecommendations, 
  getDailyMeals, 
  logMealStatus 
} from "../controllers/recommendedmealsController";

// ✅ FIX: Import 'protect' from your actual auth file
// Adjust the path "../middlewares/auth/protect" if your file is in a different folder
import { protect } from "../middlewares/auth/protect"; 

const router = Router();

// Endpoint to generate (POST)
router.post("/generate", protect, generateMealRecommendations);

// Endpoint to get today's meals (GET)
router.get("/daily", protect, getDailyMeals);

// Endpoint to mark meal as eaten (PATCH)
router.patch("/log", protect, logMealStatus);

export default router;