import express from "express"
import { chatWithBot } from "../controllers/chatController";
import { protect } from "../middlewares/auth/protect";

const router=express.Router()

router.post("/", chatWithBot)

export default router;