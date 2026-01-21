import { Router } from "express";
import {
  assignWorkoutToClient,
  getClientWorkouts,
  getClientWorkoutById,
  deleteClientWorkout,
  updateClientWorkoutStatus,
  getInstructorClients,
  getClientDashboardWorkouts,
  getClientAssignedWorkoutsDetails,
  getMyNotifications,
  markNotificationRead,
  addInstructorFeedback
} from "../controllers/clientWorkoutsController";
import { protect } from "../middlewares/auth/protect";

const router = Router();

router.post("/", assignWorkoutToClient);


router.get("/", getClientWorkouts);// Instructor actions
router.get("/notifications", protect, getMyNotifications);
router.put("/log/:log_id/feedback", protect, addInstructorFeedback);
router.put("/notifications/:id/read", protect, markNotificationRead);
router.get("/:instructor_id/clients", getInstructorClients);

router.get("/:id", getClientWorkoutById);


router.put("/:id", updateClientWorkoutStatus);


router.delete("/:id", deleteClientWorkout);

// Add this line to your routes file
router.get("/client/:id/workouts", getClientDashboardWorkouts);

router.get("/client/assigned-workouts/:clientId", getClientAssignedWorkoutsDetails);

export default router;
