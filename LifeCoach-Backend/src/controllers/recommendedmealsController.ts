import { Request, Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes"; // Assuming you have this type

dotenv.config();

const groq = new Groq({ apiKey: process.env.XAI_API_KEY});

// 1. Generate Recommendations using Groq
export const generateMealRecommendations = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = req.user?.user_id; // Get ID from verified token
  // If testing without auth middleware, use: const { user_id } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // A. Get User Profile for Context
    const clientQuery = `
      SELECT weight_goal, health_conditions, allergies, budget, location 
      FROM clients 
      WHERE user_id = $1
    `;
    const clientResult = await pool.query(clientQuery, [userId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: "Client profile not found. Please complete your profile." });
    }

    const user = clientResult.rows[0];

    // B. Build the System Prompt
    const systemPrompt = `
      You are an expert Kenyan Nutritionist. 
      Generate a 1-day meal plan (Breakfast, Lunch, Dinner) strictly based on:
      - Location: ${user.location} (Use ONLY locally available foods in this region).
      - Goal: ${user.weight_goal}
      - Conditions: ${user.health_conditions ? user.health_conditions.join(', ') : 'None'}
      - Allergies: ${user.allergies ? user.allergies.join(', ') : 'None'}
      - Budget: ${user.budget}

      OUTPUT FORMAT:
      Return ONLY valid JSON array with this exact structure:
      [
        { "type": "Breakfast", "meal": "Name of meal", "calories": "approx cal", "reason": "Why this fits" },
        { "type": "Lunch", "meal": "Name of meal", "calories": "approx cal", "reason": "Why this fits" },
        { "type": "Dinner", "meal": "Name of meal", "calories": "approx cal", "reason": "Why this fits" }
      ]
      Do not include markdown blocks like \`\`\`json. Just the raw JSON array.
    `;

    // C. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate my meal plan." }
      ],
      model: "llama-3.1-8b-instant", // High speed model
      temperature: 0.5, // Lower temperature for more consistent formatting
      max_tokens: 500,
    });

    let aiContent = completion.choices[0]?.message?.content || "[]";
    
    // Cleanup: Remove markdown if AI adds it
    aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

    let mealPlan;
    try {
        mealPlan = JSON.parse(aiContent);
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Content:", aiContent);
        return res.status(500).json({ error: "AI response was not valid JSON" });
    }

    // D. Save to Database (Transaction)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Optional: Clear previous pending meals for today to avoid duplicates
      await client.query(
        "DELETE FROM recommended_meals WHERE user_id = $1 AND recommended_date = CURRENT_DATE AND status = 'pending'",
        [userId]
      );

      const savedMeals = [];
      const insertQuery = `
        INSERT INTO recommended_meals (user_id, meal_type, meal_name, calories, reason, recommended_date)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
        RETURNING *
      `;

      for (const meal of mealPlan) {
        const saved = await client.query(insertQuery, [
          userId, 
          meal.type, 
          meal.meal, 
          meal.calories, 
          meal.reason
        ]);
        savedMeals.push(saved.rows[0]);
      }

      await client.query('COMMIT');

      res.status(200).json({
        message: "Meal plan generated successfully",
        location: user.location,
        data: savedMeals
      });

    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("Meal Generation Error:", error);
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
});

// 2. Get Daily Meals
// ... inside getDailyMeals ...
export const getDailyMeals = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // 1. Get the user's location from clients table
    const locationResult = await pool.query(
        `SELECT location FROM clients WHERE user_id = $1`, 
        [userId]
    );
    const location = locationResult.rows[0]?.location || "Local"; // Default to 'Local' if missing

    // 2. Get the meals
    const result = await pool.query(
        `SELECT * FROM recommended_meals 
         WHERE user_id = $1 AND recommended_date = CURRENT_DATE
         ORDER BY recommendation_id ASC`,
        [userId]
    );

    res.status(200).json({
        message: "Meals retrieved",
        location: location, // <--- SEND LOCATION TO FRONTEND
        data: result.rows
    });
});

// 3. Log Meal Status
export const logMealStatus = asyncHandler(async (req: UserRequest, res: Response) => {
    const { recommendation_id, status } = req.body;
    const userId = req.user?.user_id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const result = await pool.query(
        `UPDATE recommended_meals 
         SET status = $1 
         WHERE recommendation_id = $2 AND user_id = $3 
         RETURNING *`,
        [status, recommendation_id, userId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json({ message: "Status updated", data: result.rows[0] });
});