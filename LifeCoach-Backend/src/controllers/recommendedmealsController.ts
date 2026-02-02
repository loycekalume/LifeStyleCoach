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
    const finalLocationInput = locationOverride || user.location || "Kenya";

    // ✅ NEW: Get recently recommended meals to avoid repetition
    const recentMealsQuery = `
      SELECT DISTINCT meal_name 
      FROM recommended_meals 
      WHERE user_id = $1 
      AND recommended_date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    const recentMeals = await pool.query(recentMealsQuery, [userId]);
    const recentMealNames = recentMeals.rows.map(row => row.meal_name);

    // ✅ IMPROVED: Better structured system prompt
    const systemPrompt = `
You are a professional Kenyan nutritionist creating balanced, nutritious meal plans.

USER PROFILE:
- Location: ${finalLocationInput}
- Weight Goal: ${user.weight_goal}
- Health Conditions: ${user.health_conditions?.join(', ') || 'None'}
- Allergies: ${user.allergies?.join(', ') || 'None'}
- Budget: ${user.budget}

${recentMealNames.length > 0 ? `AVOID these recently recommended meals: ${recentMealNames.join(', ')}` : ''}

REQUIREMENTS:
1. Focus on meals commonly available in Kenya and East Africa
2. Include a mix of traditional Kenyan foods and healthy modern options
3. Ensure meals are balanced with proteins, carbs, healthy fats, and vegetables
4. Consider the user's budget (Low = affordable local foods, Medium = mix of local and imported, High = premium options)
5. Respect dietary restrictions from health conditions and allergies
6. Provide realistic calorie estimates
7. Match meals to the weight goal:
   - "lose": Lower calorie, high protein, high fiber
   - "gain": Higher calorie, protein-rich, nutrient-dense
   - "maintain": Balanced macros

MEAL EXAMPLES FOR KENYA:
Breakfast: Uji (porridge), Mandazi with tea, Githeri, Eggs with whole grain bread, Fruit salad with yogurt
Lunch: Ugali with sukuma wiki and beans, Brown rice with chicken stew, Chapati with beef and vegetables, Fish with sweet potato
Dinner: Pilau with kachumbari, Vegetable stir-fry with brown rice, Grilled tilapia with greens, Lentil curry with chapati

OUTPUT FORMAT (STRICT JSON):
[
  {
    "type": "Breakfast",
    "meal": "Specific meal name",
    "calories": "200-400 cal",
    "reason": "Brief explanation of nutritional benefits and how it fits the goal"
  },
  {
    "type": "Lunch",
    "meal": "Specific meal name",
    "calories": "400-600 cal",
    "reason": "Brief explanation"
  },
  {
    "type": "Dinner",
    "meal": "Specific meal name",
    "calories": "350-550 cal",
    "reason": "Brief explanation"
  }
]

IMPORTANT: Return ONLY the JSON array. No markdown, no explanations, no code blocks.
    `.trim();

    // C. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate today's personalized meal plan." }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7, // ✅ Increased for more variety
      max_tokens: 800,  // ✅ Increased for detailed reasons
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

    // ✅ Validate the meal plan structure
    if (!Array.isArray(mealPlan) || mealPlan.length !== 3) {
      console.error("Invalid meal plan structure:", mealPlan);
      return res.status(500).json({ error: "Invalid meal plan generated" });
    }

    // D. Save to Database (Transaction)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // ✅ Clear previous pending meals for TODAY only (not all time)
      await client.query(
        "DELETE FROM recommended_meals WHERE user_id = $1 AND recommended_date = CURRENT_DATE AND status = 'pending'",
        [userId]
      );

      const savedMeals = [];
      const insertQuery = `
        INSERT INTO recommended_meals (user_id, meal_type, meal_name, calories, reason, recommended_date, status)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 'pending')
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

      const displayLocation = locationOverride ? "GPS Location" : finalLocationInput;

      res.status(200).json({
        message: "Fresh meal plan generated successfully",
        location: displayLocation,
        data: savedMeals,
        tips: [
          "Drink at least 8 glasses of water throughout the day",
          "Portion sizes matter - listen to your body's hunger cues",
          "Fresh, local ingredients are often the most nutritious and affordable"
        ]
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