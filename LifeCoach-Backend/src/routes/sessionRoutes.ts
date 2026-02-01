import express from "express";
import {
  createSession,
  getInstructorSessions,

  updateSession,
  deleteSession,
} from "../controllers/sessionControllers";
import { protect } from "../middlewares/auth/protect";

const router = express.Router();

router.post("/", protect,createSession);
router.get("/",protect, getInstructorSessions);

router.put("/:id", protect,updateSession);
router.delete("/:id",protect, deleteSession);

export default router;
