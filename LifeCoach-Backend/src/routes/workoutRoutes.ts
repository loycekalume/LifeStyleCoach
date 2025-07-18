import express from "express"
import { addWorkout, deleteWorkout, getWorkout, getWorkoutById, getWorkoutByUserId } from "../controllers/workoutController"

const router =express.Router()
router.post("/",addWorkout)
router.get("/",getWorkout)
router.get("/:id",getWorkoutById)
router.get("/users/:user_id",getWorkoutByUserId)
router.delete("/:id",deleteWorkout)
export default router