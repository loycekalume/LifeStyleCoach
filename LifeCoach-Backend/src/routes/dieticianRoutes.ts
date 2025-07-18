import express, { Router } from "express"
import { addDietician, deleteDietician, getDietician, getDieticianById } from "../controllers/dieticianController"


const router=express.Router()

router.post("/",addDietician);
router.get("/",getDietician);
router.get("/:id",getDieticianById)
router.delete("/:id",deleteDietician)



export default router