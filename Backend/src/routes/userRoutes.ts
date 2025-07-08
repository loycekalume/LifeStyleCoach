import express from "express";
import {
  completeProfile,
  updateUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  patchUserAccount,
  patchUserProfile
} from "../controllers/userController";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:user_id", getSingleUser);
router.put("/profile/:user_id", completeProfile);
router.put("/:user_id", updateUser);
router.patch("/:user_id", patchUserAccount);
router.patch("/profile/:user_id", patchUserProfile);
router.delete("/:user_id", deleteUser);

export default router;
