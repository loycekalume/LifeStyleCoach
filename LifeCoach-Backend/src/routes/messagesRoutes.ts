import express from "express"
import { addMessage, deleteMessage, getMessageById, getMessageByUserId, getMessages } from "../controllers/messagesController"

const router=express.Router()

router.get("/",getMessages)
router.post("/",addMessage)
router.get("/:id",getMessageById)
router.get("/users/:user_id",getMessageByUserId)
router.delete("/:id",deleteMessage)

export default router;