import { Router } from "express";
import {
  assignWorkoutToClient,
  getClientWorkouts,
  getClientWorkoutById,
  deleteClientWorkout,
  updateClientWorkoutStatus,
  getInstructorClients,
  getClientDashboardWorkouts,
  getClientAssignedWorkoutsDetails
} from "../controllers/clientWorkoutsController";

const router = Router();

router.post("/", assignWorkoutToClient);


router.get("/", getClientWorkouts);
router.get("/:instructor_id/clients", getInstructorClients);

router.get("/:id", getClientWorkoutById);


router.put("/:id", updateClientWorkoutStatus);


router.delete("/:id", deleteClientWorkout);

// Add this line to your routes file
router.get("/client/:id/workouts", getClientDashboardWorkouts);

router.get("/client/assigned-workouts/:clientId", getClientAssignedWorkoutsDetails);

export default router;
