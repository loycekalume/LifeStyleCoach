import express from 'express'

import { protect } from '../middlewares/auth/protect';
import { hireClient, getInstructorClients, getInstructorLeads} from '../controllers/instructorClients';
const router = express.Router()


router.post("/hire", protect, hireClient);
router.get("/leads", protect, getInstructorLeads);
router.get("/my-clients", protect, getInstructorClients);

export default router