import express, { Router } from "express"
import { addDietician, deleteDietician, getDietician, getDieticianById, getDieticianProfile, updateDieticianProfile } from "../controllers/dieticianController"
import { protect } from "../middlewares/auth/protect" // 👈 Import

const router = express.Router()

router.post("/", addDietician);
router.get("/", getDietician);

//  Protect these routes
router.get("/profile", protect, getDieticianProfile);
router.put("/profile", protect, updateDieticianProfile);

router.get("/:id", getDieticianById)
router.delete("/:id", deleteDietician)

export default router