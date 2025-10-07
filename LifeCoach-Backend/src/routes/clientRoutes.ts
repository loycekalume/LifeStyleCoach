import express from 'express'
import { deleteClient, getClientById, getClients, updateClient, upsertClient } from '../controllers/clientsController'
const router = express.Router()
router.post("/",upsertClient)
router.get("/",  getClients);
router.get("/:id", getClientById);


router.put("/:id",  updateClient);


router.delete("/:id", deleteClient);
export default router;