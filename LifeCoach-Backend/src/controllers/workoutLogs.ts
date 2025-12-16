import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";

// POST /api/logs/complete
export const logCompletedWorkout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user_id, template_id, duration_minutes, notes } = req.body;

    // 1. Basic Validation
    if (!user_id || !template_id || !duration_minutes) {
      return res.status(400).json({ message: "Missing required fields (user_id, template_id, duration)" });
    }

    // 2. Insert into History Table
    // Note: ensure you have created the 'workout_logs' table we discussed earlier!
    const result = await pool.query(
      `INSERT INTO workout_logs (client_id, workout_id, duration_minutes, notes, date_completed) 
       VALUES ($1, $2, $3, $4, CURRENT_DATE) 
       RETURNING *`,
      [user_id, template_id, duration_minutes, notes || ""]
    );

    res.status(201).json({ 
        message: "Workout logged successfully!", 
        log: result.rows[0] 
    });

  } catch (error) {
    console.error("Error logging workout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});