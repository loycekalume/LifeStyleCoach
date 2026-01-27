import { Request, Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

dotenv.config();
const groq = new Groq({ apiKey: process.env.XAI_API_KEY });

// 1. Generate Recommendations using Groq
export const generateMealRecommendations = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = req.user?.user_id;
  
  // ✅ NEW: Receive the coordinates string (e.g., "Lat: -1.2, Long: 36.8")
  const { locationOverride } = req.body; 

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

    // ✅ LOGIC: Use coordinates if sent, otherwise fallback to DB location, then default to Kenya
    const finalLocationInput = locationOverride || user.location || "Kenya";

    // B. Updated System Prompt to handle Coordinates
    const systemPrompt = `
      You are an expert Nutritionist familiar with global and local cuisines.
      
      The user is currently at this location: "${finalLocationInput}".
      
      INSTRUCTIONS:
      1. If the location is provided as GPS Coordinates (Lat/Long):
         - First, identify the likely City, Region, or Country from these coordinates.
         - Then, generate the meal plan using foods LOCALLY available in that identified region.
      2. If the location is a city name, use foods available there.

      Generate a 1-day meal plan (Breakfast, Lunch, Dinner) based on:
      - Goal: ${user.weight_goal}
      - Conditions: ${user.health_conditions ? user.health_conditions.join(', ') : 'None'}
      - Allergies: ${user.allergies ? user.allergies.join(', ') : 'None'}
      - Budget: ${user.budget}

      OUTPUT FORMAT:
      Return ONLY a valid JSON array with this exact structure:
      [
        { "type": "Breakfast", "meal": "Name of meal", "calories": "approx cal", "reason": "Why this fits (mention the identified location context if possible)" },
        { "type": "Lunch", "meal": "Name of meal", "calories": "approx cal", "reason": "Why this fits" },
        { "type": "Dinner", "meal": "Name of meal", "calories": "approx cal", "reason": "Why this fits" }
      ]
      Do not include markdown blocks like \`\`\`json or extra text.
    `;

    // C. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate my meal plan." }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 600,
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

      // Clear previous pending meals for today to avoid duplicates
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

      // Determine display location for frontend
      // If we used coordinates, label it "GPS Location" so the user knows it worked
      const displayLocation = locationOverride ? "GPS Location" : finalLocationInput;

      res.status(200).json({
        message: "Meal plan generated successfully",
        location: displayLocation,
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
export const getDailyMeals = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // Get location from profile as default for display
    const locationResult = await pool.query(
        `SELECT location FROM clients WHERE user_id = $1`, 
        [userId]
    );
    const location = locationResult.rows[0]?.location || "Local";

    const result = await pool.query(
        `SELECT * FROM recommended_meals 
         WHERE user_id = $1 AND recommended_date = CURRENT_DATE
         ORDER BY recommendation_id ASC`,
        [userId]
    );

    res.status(200).json({
        message: "Meals retrieved",
        location: location, 
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