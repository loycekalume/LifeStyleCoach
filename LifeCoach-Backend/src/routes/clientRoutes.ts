import express from 'express'
import { deleteClient, getClientById, getClients, getMatchedClientsForInstructor,getMealPlanDetails,getMyMealPlans, updateClient, upsertClient } from '../controllers/clientsController'
import { protect } from '../middlewares/auth/protect';
const router = express.Router()
router.post("/",upsertClient)
router.get("/",  getClients);
router.get("/matches", protect, getMatchedClientsForInstructor);
router.get("/my-plans", protect, getMyMealPlans);
router.get("/:id", getClientById);

router.get("/plans/:planId/details", protect, getMealPlanDetails);
router.put("/:id",  updateClient);


router.delete("/:id", deleteClient);
export default router;