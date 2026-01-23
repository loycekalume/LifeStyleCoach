import express from "express";
import { protect } from "../middlewares/auth/protect";
import { 
    hireClient, 
    getDieticianRoster, 
    getDieticianLeads, 
    getAiMatchedClientsForDietician
} from "../controllers/dieticianClients";


const router = express.Router();


router.get("/matches", protect, getAiMatchedClientsForDietician);
// 2. Leads (Conversations)
router.get("/leads", protect, getDieticianLeads);

// 3. Roster (Hired Clients)
router.get("/roster", protect, getDieticianRoster);

// 4. Action (Hire)
router.post("/hire", protect, hireClient);

export default router;