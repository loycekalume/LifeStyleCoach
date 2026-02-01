import express from 'express'

import { protect } from '../middlewares/auth/protect';
const router = express.Router()



import { getUpcomingSessions } from "../controllers/clientSessions";

router.get("/", protect, getUpcomingSessions);

export default router;