// src/services/notification.service.ts
import pool from "../db.config";

type Period = "morning" | "afternoon" | "night";

export const createDailyNotifications = async (period: Period) => {
  const today = new Date().toISOString().split("T")[0];
  const message = "Remember to check in with your goals today 🌱";

  // Get all users who are clients (role_id = 5)
  const clients = await pool.query(
    `
    SELECT u.user_id
    FROM users u
    JOIN user_roles r ON u.role_id = r.role_id
    WHERE u.role_id = 5
    `
  );

  for (const client of clients.rows) {
    const userId = client.user_id;

    // Avoid duplicate notifications for same day & period
    const exists = await pool.query(
      `SELECT 1 FROM notifications WHERE user_id = $1 AND period = $2 AND date = $3`,
      [userId, period, today]
    );

    if (exists.rowCount === 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, message, period, date)
         VALUES ($1, $2, $3, $4)`,
        [userId, message, period, today]
      );
    }
  }

  console.log(`✅ ${period} notifications created`);
};
