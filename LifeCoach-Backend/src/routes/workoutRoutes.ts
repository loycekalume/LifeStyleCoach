import express from "express"
import { addWorkout, deleteWorkout, getWorkouts, getWorkoutById, updateWorkout, getInstructorWorkouts } from "../controllers/workoutController"

const router =express.Router()
router.post("/",addWorkout)
router.get("/",getWorkouts)
router.get("/:id",getWorkoutById)
router.put("/:id", updateWorkout);
router.get("/instructor/:instructor_id",getInstructorWorkouts)

router.get("/users/:user_id",getWorkoutById)
router.delete("/:id",deleteWorkout)
export default router