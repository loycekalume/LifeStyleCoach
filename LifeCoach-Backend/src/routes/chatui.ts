// src/routes/chatRoutes.ts
import { Router } from "express";
import { startConversation } from "../controllers/chatui";
import { protect } from "../middlewares/auth/protect"; // Make sure this path is correct

const router = Router();

// Route: POST /chat/start
// Desc:  Starts a new conversation or returns existing one
// Auth:  Protected (Needs token to know who the client is)
router.post("/start", protect, startConversation);

export default router;