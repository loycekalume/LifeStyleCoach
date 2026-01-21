import { Response } from "express";
import pool from "../db.config";
import { UserRequest } from "../utils/types/userTypes";

// Get notifications for logged-in user
export const getMyNotifications = async (req: UserRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.user_id;

  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  res.json(result.rows);
};

// Mark a notification as read
export const markAsRead = async (req: UserRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.params;

  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
    [id, req.user.user_id]
  );

  res.json({ success: true });
};

// Optional test endpoint: create a notification manually
export const createTestNotification = async (req: UserRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  await pool.query(
    `INSERT INTO notifications (user_id, message, period, date) VALUES ($1, $2, 'morning', CURRENT_DATE)`,
    [req.user.user_id, "Test notification 🌱"]
  );

  res.json({ success: true });
};
