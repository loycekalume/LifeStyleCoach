import express from "express"
import { addProgressLog, deleteLog, getLogById, getLogByUserId, getLogs } from "../controllers/progressLogsController";

const router=express.Router()
router.post("/",addProgressLog)
router.delete("/:id",deleteLog)
router.get("/",getLogs)
router.get("/users/:user_id",getLogByUserId)
router.get("/:id",getLogById)


export default router;