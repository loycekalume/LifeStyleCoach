import express from "express"
import { addChatHistory, deleteChatHistory, getChatHistory, getChatHistoryById, getChatHistoryByUserId, getMyChatHistory } from "../controllers/chatHistoryController";
import { protect } from "../middlewares/auth/protect";

const router=express.Router()

router.post("/",addChatHistory)
router.get("/",getChatHistory)
router.get("/history", protect, getMyChatHistory);
router.get("/:id",getChatHistoryById)
router.get("/users/:user_id",getChatHistoryByUserId)
router.delete("/:id",deleteChatHistory)

export default router;