import { Router } from "express";
import { protect } from "../middlewares/auth/protect";
import {
  getMyNotifications,
  markAsRead,
} from "../controllers/notificationController";

const router = Router();

router.get("/my", protect, getMyNotifications);
router.patch("/:id/read", protect, markAsRead);

export default router;
