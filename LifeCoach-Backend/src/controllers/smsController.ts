import { Request, Response } from "express";
import { sendSms } from "../services/smsService";
import { validationResult } from "express-validator";

export const sendSmsController = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { to, message } = req.body;

  try {
    const result = await sendSms(to, message);
    return res.json({ success: true, sid: result.sid });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
