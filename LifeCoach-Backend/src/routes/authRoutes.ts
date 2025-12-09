import express from "express"
import { loginUser, logoutUser, refreshToken, registerUser } from "../controllers/authController"

const router=express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/logout",logoutUser)
router.post("/refresh-token", refreshToken);


export default router