import { Router } from "express";
import {
  assignWorkoutToClient,
  getClientWorkouts,
  getClientWorkoutById,
  deleteClientWorkout,
  updateClientWorkoutStatus
} from "../controllers/clientWorkoutsController";

const router = Router();

router.post("/", assignWorkoutToClient);


router.get("/", getClientWorkouts);


router.get("/:id", getClientWorkoutById);

router.put("/:id", updateClientWorkoutStatus);


router.delete("/:id", deleteClientWorkout);

export default router;
