import express from "express";
import { addUser, deleteUser, getUser, getUserById, toggleUserActive } from "../controllers/usersController";
import {protect} from "../middlewares/auth/protect"
import { adminGuard, InstuctorGuard, notUserGuard } from "../middlewares/auth/roleMiddleware";
import {getClients, getInstructors, getDieticians} from "../controllers/usersController"
const router=express.Router()


router.post("/", addUser);
router.get("/", getUser)
router.get("/instructors",  getInstructors);
router.get("/dieticians", getDieticians);
router.get("/clients",  getClients);
router.patch("/:id/toggle-active",  toggleUserActive);
router.get("/:id",getUserById)
router.delete("/:id",deleteUser)




export default router