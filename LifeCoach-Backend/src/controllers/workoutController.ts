import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";

// Add new workout
export const addWorkout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { instructor_id, created_at, plan, title, description } = req.body;

    if (!instructor_id || !plan) {
      return res.status(400).json({ message: "instructor_id and plan are required" });
    }

    const result = await pool.query(
      `INSERT INTO workouts (instructor_id, created_at, plan, description, title) 
       VALUES ($1, $2, $3::jsonb, $4, $5) RETURNING *`,
      [
        instructor_id,
        created_at || new Date(),
        JSON.stringify(plan), 
        description,
        title
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding workout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get all workouts
export const getWorkouts = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM workouts");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving workouts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get workout by ID
export const getWorkoutById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM workouts WHERE workout_id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error retrieving workout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export const updateWorkout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, plan } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Workout ID is required" });
    }

    // fetch existing workout first
    const existing = await pool.query(
      `SELECT * FROM workouts WHERE workout_id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Workout not found" });
    }

    const updated = await pool.query(
      `UPDATE workouts
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           plan = COALESCE($3::jsonb, plan)
       WHERE workout_id = $4
       RETURNING *`,
      [title, description, plan ? JSON.stringify(plan) : null, id]
    );

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    console.error("Error updating workout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete workout
export const deleteWorkout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM workouts WHERE workout_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

