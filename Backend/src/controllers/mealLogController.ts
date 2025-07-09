import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// CREATE MEAL LOG
export const createMealLog = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, meal_time, description, calories } = req.body;

  if (!user_id || !meal_time) {
    return res.status(400).json({ message: "user_id and meal_time are required" });
  }

  const result = await pool.query(
    `INSERT INTO meal_logs (user_id, meal_time, description, calories)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, meal_time, description, calories]
  );

  res.status(201).json({ message: "Meal log created successfully", meal_log: result.rows[0] });
});

// GET ALL MEAL LOGS
export const getAllMealLogs = asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query(`SELECT * FROM meal_logs ORDER BY created_at DESC`);
  res.status(200).json({ count: result.rows.length, meal_logs: result.rows });
});

// GET MEAL LOGS FOR A USER
export const getMealLogsByUser = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;

  const result = await pool.query(
    `SELECT * FROM meal_logs WHERE user_id = $1 ORDER BY meal_time DESC`,
    [user_id]
  );

  res.status(200).json({ count: result.rows.length, meal_logs: result.rows });
});

// GET SINGLE MEAL LOG
export const getSingleMealLog = asyncHandler(async (req: Request, res: Response) => {
  const { log_id } = req.params;

  const result = await pool.query(`SELECT * FROM meal_logs WHERE log_id = $1`, [log_id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Meal log not found" });
  }

  res.status(200).json({ meal_log: result.rows[0] });
});

// UPDATE MEAL LOG
export const updateMealLog = asyncHandler(async (req: Request, res: Response) => {
  const { log_id } = req.params;
  const { meal_time, description, calories } = req.body;

  const result = await pool.query(
    `UPDATE meal_logs
     SET meal_time = $1, description = $2, calories = $3
     WHERE log_id = $4
     RETURNING *`,
    [meal_time, description, calories, log_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Meal log not found" });
  }

  res.status(200).json({ message: "Meal log updated successfully", meal_log: result.rows[0] });
});

// DELETE MEAL LOG
export const deleteMealLog = asyncHandler(async (req: Request, res: Response) => {
  const { log_id } = req.params;

  const result = await pool.query(`DELETE FROM meal_logs WHERE log_id = $1 RETURNING *`, [log_id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Meal log not found" });
  }

  res.status(200).json({ message: "Meal log deleted successfully" });
});
