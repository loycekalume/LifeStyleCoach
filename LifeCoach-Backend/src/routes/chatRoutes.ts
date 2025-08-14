import express from "express"
import { chatWithBot } from "../controllers/chatController";

const router=express.Router()

router.post("/",chatWithBot)

export default router;