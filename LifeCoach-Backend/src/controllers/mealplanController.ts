import { Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// @desc    Create a new meal plan WITH food items
// @route   POST /api/meal-plans
export const createMealPlan = asyncHandler(async (req: UserRequest, res: Response) => {
  const client = await pool.connect(); // Use a client for transactions
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // 1. Get dietician_id
    const dieticianQuery = await client.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    const dietician_id = dieticianQuery.rows[0].dietician_id;

    // 2. Get Data (Including Macros & Items)
    const { 
        title, 
        category, 
        description, 
        total_calories, 
        protein_g, 
        carbs_g, 
        fats_g,
        items // Array of { meal_type, food_name, portion, ... }
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }

    // --- START TRANSACTION ---
    await client.query("BEGIN");

    // 3. Insert the Meal Plan (Parent)
    const newPlan = await client.query(
      `INSERT INTO meal_plans 
        (dietician_id, title, category, description, total_calories, protein_g, carbs_g, fats_g)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [dietician_id, title, category, description, total_calories, protein_g, carbs_g, fats_g]
    );

    const planId = newPlan.rows[0].meal_plan_id;

    // 4. Insert the Meal Items (Children)
    if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
            await client.query(
                `INSERT INTO meal_items 
                  (meal_plan_id, meal_type, food_name, portion, calories, protein_g, carbs_g, fats_g)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    planId, 
                    item.meal_type, 
                    item.food_name, 
                    item.portion, 
                    item.calories || 0,
                    item.protein_g || 0,
                    item.carbs_g || 0,
                    item.fats_g || 0
                ]
            );
        }
    }

    // --- COMMIT TRANSACTION ---
    await client.query("COMMIT");

    res.status(201).json({
      message: "Meal plan created successfully",
      mealPlan: newPlan.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK"); // Undo changes if error
    console.error("Error creating meal plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

// @desc    Get all meal plans for the authenticated dietician
// @route   GET /api/meal-plans
export const getMyMealPlans = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

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
          meal_plan_id,
          title,
          category,
          description,
          total_calories,
          protein_g,
          carbs_g,
          fats_g,
          is_favorite,
          created_at
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

// @desc    Get a SINGLE meal plan with its items
// @route   GET /api/meal-plans/:id
export const getMealPlanById = asyncHandler(async (req: UserRequest, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Fetch Plan Details
        const planResult = await pool.query(
            `SELECT * FROM meal_plans WHERE meal_plan_id = $1`,
            [id]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ message: "Plan not found" });
        }

        // 2. Fetch Items
        const itemsResult = await pool.query(
            `SELECT * FROM meal_items WHERE meal_plan_id = $1`,
            [id]
        );

        res.status(200).json({
            plan: planResult.rows[0],
            items: itemsResult.rows
        });

    } catch (error) {
        console.error("Error retrieving meal plan details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// @desc    Update a meal plan
// @route   PUT /api/meal-plans/:id
export const updateMealPlan = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, description, total_calories, protein_g, carbs_g, fats_g, is_favorite } = req.body;

    const updatedPlan = await pool.query(
      `UPDATE meal_plans
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           description = COALESCE($3, description),
           total_calories = COALESCE($4, total_calories),
           protein_g = COALESCE($5, protein_g),
           carbs_g = COALESCE($6, carbs_g),
           fats_g = COALESCE($7, fats_g),
           is_favorite = COALESCE($8, is_favorite),
           updated_at = CURRENT_TIMESTAMP
       WHERE meal_plan_id = $9
       RETURNING *`,
      [title, category, description, total_calories, protein_g, carbs_g, fats_g, is_favorite, id]
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
    // ON DELETE CASCADE in SQL handles deleting the items automatically
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

// @desc    Assign a meal plan to a client
// @route   POST /api/meal-plans/assign
export const assignMealPlan = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const dieticianQuery = await pool.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    const dietician_id = dieticianQuery.rows[0].dietician_id;
    const { client_id, meal_plan_id, start_date, notes } = req.body;

    if (!client_id || !meal_plan_id || !start_date) {
      return res.status(400).json({ message: "Client, Meal Plan, and Start Date are required" });
    }

    // Use correct table name: client_diet_assignments (or client_meal_plans if you named it that)
    const result = await pool.query(
      `INSERT INTO client_diet_assignments 
        (client_id, meal_plan_id, dietician_id, assigned_date, custom_notes, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [client_id, meal_plan_id, dietician_id, start_date, notes]
    );

    res.status(201).json({
      message: "Meal plan assigned successfully",
      assignment: result.rows[0],
    });

  } catch (error) {
    console.error("Error assigning meal plan:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get potential clients for assignment
// @route   GET /api/dietician/clients
export const getDieticianClients = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const dieticianQuery = await pool.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    // Logic: Get users who have a client profile
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email
       FROM users u 
       JOIN clients c ON u.user_id = c.user_id
       ORDER BY u.name ASC`
    );

    res.status(200).json({
      message: "Clients retrieved successfully",
      clients: result.rows,
    });

  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get Assigned Plans (For Client View)
export const getClientAssignedMealPlans = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      `SELECT 
        cmp.assignment_id,
        cmp.status,
        cmp.assigned_date,
        cmp.custom_notes,
        mp.meal_plan_id,
        mp.title,
        mp.category,
        mp.description,
        mp.total_calories,
        mp.protein_g,
        mp.carbs_g,
        mp.fats_g,
        u.name AS dietician_name
      FROM client_diet_assignments cmp
      JOIN meal_plans mp ON cmp.meal_plan_id = mp.meal_plan_id
      JOIN dieticians d ON cmp.dietician_id = d.dietician_id
      JOIN users u ON d.user_id = u.user_id
      WHERE cmp.client_id = $1
      ORDER BY cmp.assigned_date DESC`,
      [clientId]
    );

    res.status(200).json({
      message: "Assigned meal plans retrieved successfully",
      plans: result.rows,
    });

  } catch (error) {
    console.error("Error fetching client meal plans:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});