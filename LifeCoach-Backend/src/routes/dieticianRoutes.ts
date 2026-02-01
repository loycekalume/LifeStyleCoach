import express, { Router } from "express"
import { addDietician, deleteDietician,  getDietician, getDieticianById, getDieticianCertification, getDieticianPricing, getDieticianProfile, getDieticianSpecialization, getDieticianStats, updateDieticianCertification, updateDieticianPricing, updateDieticianProfile, updateDieticianSpecialization } from "../controllers/dieticianController"
import { protect } from "../middlewares/auth/protect" 

const router = express.Router()

router.post("/", addDietician);
router.get("/", getDietician);
router.get("/stats", protect, getDieticianStats);
//  Protect these routes
router.get("/profile", protect, getDieticianProfile);
router.put("/profile", protect, updateDieticianProfile);

//  Specialization routes
router.get("/specialization", protect, getDieticianSpecialization);
router.put("/specialization", protect, updateDieticianSpecialization);

//pricing routes
router.get("/pricing", protect, getDieticianPricing);
router.put("/pricing", protect, updateDieticianPricing);

//  Certification routes
router.get("/certification", protect, getDieticianCertification);
router.put("/certification", protect, updateDieticianCertification);


router.get("/:id", getDieticianById)
router.delete("/:id", deleteDietician)

export default router