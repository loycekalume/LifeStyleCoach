import express from "express"
import { addChatHistory, deleteChatHistory, getChatHistory, getChatHistoryById, getChatHistoryByUserId, getMyChatHistory } from "../controllers/chatHistoryController";

const router=express.Router()

router.post("/",addChatHistory)
router.get("/",getChatHistory)
router.get("/:id",getChatHistoryById)
router.get("/history/:userId", getMyChatHistory);
router.get("/users/:user_id",getChatHistoryByUserId)
router.delete("/:id",deleteChatHistory)

export default router;