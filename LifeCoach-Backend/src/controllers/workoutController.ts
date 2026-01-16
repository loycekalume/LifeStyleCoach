import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";

// Add new workout
export const addWorkout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { instructor_id, plan, title, description, video_url } = req.body;

    if (!instructor_id || !title || !description || !plan) {
      return res.status(400).json({ 
          message: "instructor_id, title, description, and plan are required" 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO workouts (instructor_id, plan, description, title, video_url) 
       VALUES ($1, $2::jsonb, $3, $4, $5) RETURNING *`,
      [instructor_id, JSON.stringify(plan), description, title, video_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding workout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 2. UPDATE WORKOUT (Includes video_url)
export const updateWorkout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, plan, video_url } = req.body;

    if (!id) return res.status(400).json({ message: "Workout ID is required" });

    const updated = await pool.query(
      `UPDATE workouts
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           plan = COALESCE($3::jsonb, plan),
           video_url = COALESCE($4, video_url)
       WHERE workout_id = $5
       RETURNING *`,
      [title, description, plan ? JSON.stringify(plan) : null, video_url, id]
    );

    if (updated.rows.length === 0) return res.status(404).json({ message: "Workout not found" });

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    console.error("Error updating workout:", error);
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

export const getInstructorWorkouts = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check path parameters first (e.g., /workout/instructor/:instructor_id)
    const instructorIdParam = req.params.instructor_id;

    // Check query parameters next (e.g., /workout?instructor_id=X)
    const instructorIdQuery = req.query.instructor_id;

    // Use the ID from the URL path if present, otherwise use the query ID
    let instructor_id: string | undefined = (instructorIdParam || instructorIdQuery) as string | undefined;

    let query = "SELECT * FROM workouts";
    const params: number[] = [];

    // 🛑 Validate and sanitize instructor_id before running SQL
    if (instructor_id) {
      // Remove non-numeric characters (e.g., "id=6" → "6")
      const cleanId = instructor_id.replace(/[^0-9]/g, "");
      const numericId = parseInt(cleanId, 10);

      if (isNaN(numericId) || numericId <= 0) {
        console.error(`Invalid instructor ID received: ${instructor_id}`);
        return res.status(400).json({ message: "Invalid format for instructor ID." });
      }

      query += " WHERE instructor_id = $1";
      params.push(numericId);
    } else {
      // Optional safeguard: return empty instead of exposing all workouts
      // return res.status(400).json({ message: "Instructor ID is required." });
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error retrieving workouts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
