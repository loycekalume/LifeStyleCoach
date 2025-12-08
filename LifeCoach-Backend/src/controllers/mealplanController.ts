import { Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// @desc    Create a new meal plan
// @route   POST /api/meal-plans
export const createMealPlan = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // Get dietician_id from the authenticated user
    const dieticianQuery = await pool.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    const dietician_id = dieticianQuery.rows[0].dietician_id;

    const { title, category, description, calories } = req.body;

    // Basic validation
    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }

    const newPlan = await pool.query(
      `INSERT INTO meal_plans (dietician_id, title, category, description, calories)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [dietician_id, title, category, description, calories]
    );

    res.status(201).json({
      message: "Meal plan created successfully",
      mealPlan: newPlan.rows[0],
    });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get all meal plans for the authenticated dietician
// @route   GET /api/meal-plans
export const getMyMealPlans = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // Get dietician_id from the authenticated user
    const dieticianQuery = await pool.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    const dietician_id = dieticianQuery.rows[0].dietician_id;

    const result = await pool.query(
      `SELECT 
         meal_plan_id as id,
         title,
         category,
         description,
         calories,
         is_favorite as favorite,
         created_at,
         updated_at
       FROM meal_plans 
       WHERE dietician_id = $1 
       ORDER BY created_at DESC`,
      [dietician_id]
    );

    res.status(200).json({
      message: "Meal plans retrieved successfully",
      mealPlans: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving meal plans:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get all meal plans for a specific dietician (keep for admin/public use)
// @route   GET /api/meal-plans/dietician/:id
export const getDieticianMealPlans = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         meal_plan_id as id,
         title,
         category,
         description,
         calories,
         is_favorite as favorite,
         created_at,
         updated_at
       FROM meal_plans 
       WHERE dietician_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    res.status(200).json({
      message: "Meal plans retrieved successfully",
      mealPlans: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving meal plans:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Update a meal plan
// @route   PUT /api/meal-plans/:id
export const updateMealPlan = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, description, calories, is_favorite } = req.body;

    const updatedPlan = await pool.query(
      `UPDATE meal_plans
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           description = COALESCE($3, description),
           calories = COALESCE($4, calories),
           is_favorite = COALESCE($5, is_favorite),
           updated_at = CURRENT_TIMESTAMP
       WHERE meal_plan_id = $6
       RETURNING 
         meal_plan_id as id,
         title,
         category,
         description,
         calories,
         is_favorite as favorite`,
      [title, category, description, calories, is_favorite, id]
    );

    if (updatedPlan.rowCount === 0) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json({
      message: "Meal plan updated successfully",
      mealPlan: updatedPlan.rows[0],
    });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Delete a meal plan
// @route   DELETE /api/meal-plans/:id
export const deleteMealPlan = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM meal_plans WHERE meal_plan_id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json({ message: "Meal plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});