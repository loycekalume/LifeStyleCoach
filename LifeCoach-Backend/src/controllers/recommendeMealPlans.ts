import { Request, Response } from "express";
import pool from "../db.config";

// Helper function to get a random meal by category
// We use "ORDER BY RANDOM() LIMIT 1" to let Postgres pick for us
const getRandomMeal = async (category: string) => {
  const query = `
    SELECT * FROM meals 
    WHERE category = $1 
    ORDER BY RANDOM() 
    LIMIT 1;
  `;
  const result = await pool.query(query, [category]);
  return result.rows[0];
};

export const generateDailyPlan = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // 1. (Optional) Fetch User Calorie Goal
    // For now, we assume a standard target, but you can uncomment this later:
    // const userRes = await pool.query("SELECT calorie_target FROM users WHERE id = $1", [userId]);
    // const target = userRes.rows[0]?.calorie_target || 2000;

    // 2. Fetch one random meal for each slot
    // We run these in parallel using Promise.all for speed
    const [breakfast, lunch, dinner, snack] = await Promise.all([
      getRandomMeal('breakfast'),
      getRandomMeal('lunch'),
      getRandomMeal('dinner'),
      getRandomMeal('snack')
    ]);

    // 3. Safety Check: Did we actually find meals?
    if (!breakfast || !lunch || !dinner) {
      return res.status(404).json({ 
        message: "Not enough meals in the database to generate a plan. Please add more meals." 
      });
    }

    // 4. Calculate Totals
    // Handle cases where snack might be null if you haven't added snacks yet
    const safeSnack = snack || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    const totalCalories = breakfast.calories + lunch.calories + dinner.calories + safeSnack.calories;
    const totalProtein = breakfast.protein + lunch.protein + dinner.protein + safeSnack.protein;

    // 5. Structure the Response
    // This isn't saved to the DB yet; it's just a "suggestion" for the user to view.
    const plan = {
      userId,
      totalCalories,
      totalProtein,
      meals: {
        breakfast,
        lunch,
        dinner,
        snack: snack || null // Send null if no snack found
      }
    };

    return res.status(200).json(plan);

  } catch (error) {
    console.error("Error generating meal plan:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// CONTROLLER: Save the plan if the user likes it
export const saveMealPlan = async (req: Request, res: Response) => {
  const { userId, planName, totalCalories, meals } = req.body; 
  // meals should be an object: { breakfast: {id...}, lunch: {id...} }

  const client = await pool.connect(); // Use a client for transactions

  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. Insert the Plan Wrapper
    const insertPlanQuery = `
      INSERT INTO generated_meal_plans (user_id, plan_name, total_calories)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const planRes = await client.query(insertPlanQuery, [userId, planName, totalCalories]);
    const planId = planRes.rows[0].id;

    // 2. Insert the Items (Breakfast, Lunch, Dinner)
    const insertItemQuery = `
      INSERT INTO generated_meal_plan_items (plan_id, meal_id, slot)
      VALUES ($1, $2, $3);
    `;

    // Execute inserts sequentially or parallel
    if (meals.breakfast) await client.query(insertItemQuery, [planId, meals.breakfast.id, 'breakfast']);
    if (meals.lunch) await client.query(insertItemQuery, [planId, meals.lunch.id, 'lunch']);
    if (meals.dinner) await client.query(insertItemQuery, [planId, meals.dinner.id, 'dinner']);
    if (meals.snack) await client.query(insertItemQuery, [planId, meals.snack.id, 'snack']);

    await client.query('COMMIT'); // Save changes
    
    res.status(201).json({ message: "Meal plan saved successfully", planId });

  } catch (error) {
    await client.query('ROLLBACK'); // Undo if error
    console.error("Error saving plan:", error);
    res.status(500).json({ message: "Failed to save plan" });
  } finally {
    client.release();
  }
};