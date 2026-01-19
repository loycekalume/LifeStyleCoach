// src/routes/chatRoutes.ts
import { Router } from "express";
import { getChatuiHistory, getUserConversations, markMessagesAsRead, startConversation } from "../controllers/chatui";
import { protect } from "../middlewares/auth/protect"; // Make sure this path is correct

const router = Router();

// Route: POST /messages/start
// Desc:  Starts a new conversation or returns existing one
// Auth:  Protected (Needs token to know who the client is)
router.post("/start", protect, startConversation);
router.get("/conversations", protect, getUserConversations);
router.get("/:conversationId/messages", protect, getChatuiHistory);
router.put("/:conversationId/read", protect, markMessagesAsRead);
export default router;