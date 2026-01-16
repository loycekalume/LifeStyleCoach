import { Router } from "express";
// Adjust the import path to match your actual middleware file location
// You might be using 'verifyToken' from authMiddleware or 'protect' from auth/protect
import { protect } from "../middlewares/auth/protect"; 

import { 
    
    getMyAssignments, 
    logWorkoutSession, 
    getClientLogs,
     
} from "../controllers/workoutLogs";

const router = Router();




// Get progress logs/graph data for a specific client (Used by ClientProgress page)
router.get("/logs/:client_id", protect, getClientLogs);


// ==========================================
// 2. CLIENT ROUTES
// ==========================================

// Get active assignments for the logged-in client (Used by ClientWorkouts page)
router.get("/my-assignments", protect, getMyAssignments);

// Log a finished session (Used when client clicks "I Finished!")
router.post("/log-session", protect, logWorkoutSession);

export default router;