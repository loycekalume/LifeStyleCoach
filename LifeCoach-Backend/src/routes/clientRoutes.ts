import express from 'express'
import { deleteClient, getClientById, getClients, getMatchedClientsForInstructor, updateClient, upsertClient } from '../controllers/clientsController'
import { protect } from '../middlewares/auth/protect';
const router = express.Router()
router.post("/",upsertClient)
router.get("/",  getClients);
router.get("/matches", protect, getMatchedClientsForInstructor);
router.get("/:id", getClientById);


router.put("/:id",  updateClient);


router.delete("/:id", deleteClient);
export default router;