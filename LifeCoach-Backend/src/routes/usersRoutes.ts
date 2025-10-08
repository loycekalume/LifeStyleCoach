import express from "express";
import { addUser, deleteUser, getUser, getUserById } from "../controllers/usersController";
import {protect} from "../middlewares/auth/protect"
import { adminGuard, InstuctorGuard, notUserGuard } from "../middlewares/auth/roleMiddleware";

const router=express.Router()


router.post("/", addUser);
router.get("/", getUser)
router.get("/:id",getUserById)
router.delete("/:id",deleteUser)




export default router