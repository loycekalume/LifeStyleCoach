import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";

// ==================================================
// 1. Get Recommended Workouts (The System Algorithm)
// ==================================================
// in controllers/systemWorkoutController.ts

export const getRecommendedWorkouts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // 1. Get Goal AND Fitness Level
    const clientQuery = `SELECT weight_goal, fitness_level FROM clients WHERE user_id = $1`;
    const clientResult = await pool.query(clientQuery, [userId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: "Client profile not found." });
    }

    const { weight_goal, fitness_level } = clientResult.rows[0];

    // 2. The Smart Logic (Using a Dynamic Query)
    // We select workouts based on the hierarchy:
    // Beginner gets -> Beginner Only
    // Intermediate gets -> Intermediate OR Beginner
    // Advanced gets -> Everything
    
    let difficultyFilter = "";
    
    if (fitness_level === 'beginner') {
        difficultyFilter = "AND difficulty_level = 'beginner'";
    } else if (fitness_level === 'intermediate') {
        difficultyFilter = "AND difficulty_level IN ('beginner', 'intermediate')";
    } 
    // If advanced, we don't add a filter (they see all)

    const workoutQuery = `
      SELECT 
        template_id, 
        name, 
        description, 
        difficulty_level, 
        estimated_duration_min,
        goal_category
      FROM workout_templates
      WHERE goal_category = $1 
      ${difficultyFilter} 
      ORDER BY 
        -- Custom sort to ensure the perfect match comes first
        CASE 
            WHEN difficulty_level = $2 THEN 1 
            ELSE 2 
        END ASC
    `;

    const workouts = await pool.query(workoutQuery, [weight_goal, fitness_level]);

    res.status(200).json({
      client_goal: weight_goal,
      client_level: fitness_level,
      recommended_workouts: workouts.rows
    });

  } catch (error) {
    console.error("Error fetching recommended workouts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ==================================================
// 2. Get Specific Exercises for a Workout Template
// ==================================================
export const getWorkoutDetails = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    const exerciseQuery = `
      SELECT 
        e.name, 
        e.video_url, 
        e.target_muscle,
        e.equipment_needed,
        we.sets, 
        we.reps, 
        we.rest_seconds
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.exercise_id
      WHERE we.template_id = $1
      ORDER BY we.order_index ASC
    `;

    const details = await pool.query(exerciseQuery, [templateId]);

    if (details.rows.length === 0) {
        return res.status(404).json({ message: "No exercises found for this template." });
    }

    res.status(200).json(details.rows);

  } catch (error) {
    console.error("Error fetching workout details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const getAllSystemWorkouts = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { difficulty, search } = req.query;

    let query = `
      SELECT 
        template_id, 
        name, 
        description, 
        difficulty_level, 
        estimated_duration_min,
        goal_category
      FROM workout_templates 
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;

    // Filter by Difficulty if provided
    if (difficulty && difficulty !== 'all') {
        query += ` AND difficulty_level = $${paramCount}`;
        params.push(difficulty);
        paramCount++;
    }

    // Search by Name if provided
    if (search) {
        query += ` AND name ILIKE $${paramCount}`;
        params.push(`%${search}%`); // ILIKE makes it case-insensitive
        paramCount++;
    }

    query += ` ORDER BY name ASC`;

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error fetching library workouts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /save
export const saveWorkout = asyncHandler(async (req: Request, res: Response) => {
  const { userId, templateId } = req.body;
  
  // Try to insert. If it fails (duplicate), we assume they want to UN-save it (toggle)
  try {
    await pool.query(
      "INSERT INTO saved_workouts (client_id, template_id) VALUES ($1, $2)",
      [userId, templateId]
    );
    res.status(201).json({ message: "Workout saved to your routine." });
  } catch (error: any) {
    // If error code is 23505 (Unique Violation), delete it instead (Toggle effect)
    if (error.code === '23505') {
        await pool.query(
            "DELETE FROM saved_workouts WHERE client_id = $1 AND template_id = $2",
            [userId, templateId]
        );
        res.status(200).json({ message: "Workout removed from your routine." });
    } else {
        throw error;
    }
  }
});

// GET saved/:userId
export const getSavedWorkouts = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await pool.query(`
    SELECT wt.* FROM workout_templates wt
    JOIN saved_workouts sw ON wt.template_id = sw.template_id
    WHERE sw.client_id = $1
    ORDER BY sw.saved_at DESC
  `, [userId]);
  
  res.status(200).json(result.rows);
});