import express from 'express'

import { protect } from '../middlewares/auth/protect';
import { getAiMatchedDieticiansForClient } from '../controllers/matchedDieticians';
const router = express.Router()



router.get("/match-dietician", protect, getAiMatchedDieticiansForClient);

export default router