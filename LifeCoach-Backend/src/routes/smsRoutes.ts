import { Router } from "express";
import { body } from "express-validator";
import { sendSmsController } from "../controllers/smsController";

const router = Router();

router.post(
  "/send",
  [
    body("to").isString().withMessage("Phone number required"),
    body("message").isString().withMessage("Message required")
  ],
  sendSmsController
);

export default router;
