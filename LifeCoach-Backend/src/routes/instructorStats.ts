import express from 'express'

import { protect } from '../middlewares/auth/protect';
import { getInstructorStats } from '../controllers/instructorStats';

const router = express.Router()


// Add this route
router.get("/", protect, getInstructorStats);

export default router