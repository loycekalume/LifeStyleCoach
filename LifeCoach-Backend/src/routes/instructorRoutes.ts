import express from "express"
import { addInstructor, addPricingOption, deleteInstuctor, deletePricingOption, getInstructorContact, getInstructorPricing, getInstructorProfile, getInstructors, getInstructorSpecializations, getInstuctorById, updateInstructor, updateInstructorContact, updateInstructorProfile, updatePricingOption } from "../controllers/instructorsController";
import { protect } from './../middlewares/auth/protect';
import { adminGuard } from "../middlewares/auth/roleMiddleware";


const router=express.Router()

router.post("/",addInstructor)
router.get("/", getInstructors)
router.get("/:id",getInstuctorById)
router.put("/:id", updateInstructor);
router.delete("/:id",deleteInstuctor)
router.get("/:id/contact", getInstructorContact);
router.put("/:id/contact", updateInstructorContact);
router.get("/:id/specializations", getInstructorSpecializations);
router.get("/:id/profile",getInstructorProfile)
router.put("/:id/profile", updateInstructorProfile);

router.get("/:id/pricing", getInstructorPricing);

router.post("/pricing", addPricingOption);


router.put("/:id/pricing", updatePricingOption);


router.delete("/:id/pricing", deletePricingOption);


export default router;
