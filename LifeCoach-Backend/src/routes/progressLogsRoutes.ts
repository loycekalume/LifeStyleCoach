import express from "express"
import { getClientProgress} from "../controllers/progressLogsController";

const router=express.Router()
router.get("/progress/:userId", getClientProgress);


export default router;