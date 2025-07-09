import express from "express";
import {
  createMealLog,
  getAllMealLogs,
  getMealLogsByUser,
  getSingleMealLog,
  updateMealLog,
  deleteMealLog
} from "../controllers/mealLogController";

const router = express.Router();

router.post("/", createMealLog);
router.get("/", getAllMealLogs);
router.get("/user/:user_id", getMealLogsByUser);
router.get("/:log_id", getSingleMealLog);
router.put("/:log_id", updateMealLog);
router.delete("/:log_id", deleteMealLog);

export default router;
