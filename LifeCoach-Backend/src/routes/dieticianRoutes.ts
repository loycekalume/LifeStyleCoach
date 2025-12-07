import express, { Router } from "express"
import { addDietician, deleteDietician, getDietician, getDieticianById, getDieticianPricing, getDieticianProfile, getDieticianSpecialization, updateDieticianPricing, updateDieticianProfile, updateDieticianSpecialization } from "../controllers/dieticianController"
import { protect } from "../middlewares/auth/protect" // 👈 Import

const router = express.Router()

router.post("/", addDietician);
router.get("/", getDietician);

//  Protect these routes
router.get("/profile", protect, getDieticianProfile);
router.put("/profile", protect, updateDieticianProfile);

//  Specialization routes
router.get("/specialization", protect, getDieticianSpecialization);
router.put("/specialization", protect, updateDieticianSpecialization);

//pricing routes
router.get("/pricing", protect, getDieticianPricing);
router.put("/pricing", protect, updateDieticianPricing);

router.get("/:id", getDieticianById)
router.delete("/:id", deleteDietician)

export default router