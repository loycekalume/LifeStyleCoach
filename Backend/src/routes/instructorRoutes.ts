import express from "express";
import {
  createInstructor,
  getAllInstructors,
  getSingleInstructor,
  updateInstructor,
  deleteInstructor
} from "../controllers/instructorController";

const router = express.Router();

router.post("/", createInstructor);
router.get("/", getAllInstructors);
router.get("/:instructor_id", getSingleInstructor);
router.put("/:instructor_id", updateInstructor);
router.delete("/:instructor_id", deleteInstructor);

export default router;
