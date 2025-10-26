import { Router } from "express";
import {
  assignWorkoutToClient,
  getClientWorkouts,
  getClientWorkoutById,
  deleteClientWorkout,
  updateClientWorkoutStatus,
  getInstructorClients
} from "../controllers/clientWorkoutsController";

const router = Router();

router.post("/", assignWorkoutToClient);


router.get("/", getClientWorkouts);
router.get("/:instructor_id/clients", getInstructorClients);

router.get("/:id", getClientWorkoutById);


router.put("/:id", updateClientWorkoutStatus);


router.delete("/:id", deleteClientWorkout);

export default router;
