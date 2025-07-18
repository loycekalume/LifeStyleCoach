import express from 'express'
import { addMealLog, deleteMealLog, getMealLogById, getMealLogByUserId, getMealLogs } from '../controllers/mealLogsController'

const router= express.Router()
router.post("/",addMealLog)
router.get("/",getMealLogs)
router.get("/:id",getMealLogById)
router.get("/users/:user_id/meal_logs",getMealLogByUserId)
router.delete("/:id",deleteMealLog)


export default router