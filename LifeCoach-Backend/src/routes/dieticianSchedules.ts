import express from "express";
import {
  createConsultation,
  getMyConsultations,
  getClientConsultations,
  getConsultationById,
  updateConsultation,
  updateConsultationStatus,
  deleteConsultation,
  getUpcomingConsultations,
} from "../controllers/dieticicianSchedules";
import { protect } from "../middlewares/auth/protect";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Main consultation routes
router.route("/")
  .get(getMyConsultations)      // GET /api/consultations - Get all consultations for authenticated dietician
  .post(createConsultation);     // POST /api/consultations - Create new consultation

// Upcoming consultations
router.get("/upcoming", getUpcomingConsultations);  // GET /api/consultations/upcoming

// Client-specific consultations
router.get("/client/:clientId", getClientConsultations);  

// Individual consultation operations
router.route("/:id")
  .get(getConsultationById)      // GET /api/consultations/:id
  .put(updateConsultation)       // PUT /api/consultations/:id
  .delete(deleteConsultation);   // DELETE /api/consultations/:id

// Status update route
router.patch("/:id/status", updateConsultationStatus);  // PATCH /api/consultations/:id/status

export default router;