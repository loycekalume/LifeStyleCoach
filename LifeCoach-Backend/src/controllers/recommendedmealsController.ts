import { Request, Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

dotenv.config();
const groq = new Groq({ apiKey: process.env.XAI_API_KEY });


// ✅ Budget mapping with KES context
const BUDGET_CONTEXT = {
  low: {
    daily: "Under KES 300/day",
    guidelines: `
      - Stick to the cheapest staples: ugali, rice, beans, lentils, githeri
      - Vegetables: sukuma wiki, cabbage, tomatoes, onions (buy from roadside vendors)
      - Protein: eggs, beans, lentils, groundnuts, dried fish (cheapest options)
      - Fruits: bananas are the most affordable, seasonal mangoes when cheap
      - Avoid meat entirely or only once or twice a week (cheap cuts like offals)
      - Cook at home, never eat out
      - Buy in bulk where possible (beans, rice, flour)
      - Use simple seasonings: salt, cooking oil, onions, tomatoes
      - A typical day: Uji for breakfast, Ugali + beans + sukuma for lunch and dinner
    `
  },
  medium: {
    daily: "KES 300 - 700/day",
    guidelines: `
      - Can afford variety: chicken, fish (tilapia), eggs regularly
      - Fresh vegetables daily: sukuma wiki, cabbage, spinach, tomatoes, carrots
      - Some fruits: bananas, papaya, oranges
      - Rice, chapati, or ugali as base
      - Milk and simple dairy: milk for tea, occasionally yogurt
      - Can eat out once or twice a week (simple places like mama ngina)
      - Moderate meat: chicken 2-3 times a week, beef once
      - Oats or simple cereals for breakfast
    `
  },
  high: {
    daily: "Over KES 700/day",
    guidelines: `
      - Good cuts of meat: chicken breast, beef, fish (tilapia, mackerel)
      - Fresh fruits and vegetables daily, including avocados
      - Can afford variety: quinoa, sweet potatoes, nuts
      - Dairy: milk, yogurt, occasionally cheese
      - Eating out at decent restaurants is okay
      - Fresh juices and smoothies
      - Variety every meal, no need to repeat
      - Can buy from supermarkets without worrying about price
    `
  }
};

export const generateMealRecommendations = asyncHandler(async (req: UserRequest, res: Response) => {
  const userId = req.user?.user_id;
  const { locationOverride } = req.body; 

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const clientQuery = `
      SELECT weight_goal, health_conditions, allergies, budget, location 
      FROM clients 
      WHERE user_id = $1
    `;
    const clientResult = await pool.query(clientQuery, [userId]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: "Client profile not found." });
    }

    const user = clientResult.rows[0];
    const finalLocationInput = locationOverride || user.location || "Kenya";

    // ✅ Resolve budget to KES context (handle null/undefined gracefully)
    const budgetKey = (user.budget || "medium").toLowerCase();
    const budget = BUDGET_CONTEXT[budgetKey] || BUDGET_CONTEXT.medium;

    // ✅ Avoid repeating recent meals
    const recentMealsQuery = `
      SELECT DISTINCT meal_name 
      FROM recommended_meals 
      WHERE user_id = $1 
      AND recommended_date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    const recentMeals = await pool.query(recentMealsQuery, [userId]);
    const recentMealNames = recentMeals.rows.map(row => row.meal_name);

   const systemPrompt = `
You are a professional Kenyan nutritionist. All prices are in KES based on 
realistic local market prices. The client shops at local markets, NOT supermarkets.

=== CLIENT PROFILE ===
- Location: ${finalLocationInput}
- Weight Goal: ${user.weight_goal}
- Health Conditions: ${Array.isArray(user.health_conditions) ? user.health_conditions.join(', ') : 'None'}
- Allergies: ${Array.isArray(user.allergies) ? user.allergies.join(', ') : 'None'}

=== BUDGET ===
- Daily Food Budget: ${budget.daily}
- Guidelines:
${budget.guidelines}

=== PRICE REFERENCES (per serving, local market) ===
- Egg (1): KES 15-20
- Chicken thigh (1 piece): KES 60-80
- Beef (~150g): KES 80-100
- Dried fish (small pack): KES 30-50
- Rice (1 cup cooked): KES 25-35
- Ugali (1 serving): KES 15-20
- Beans (1 serving): KES 20-30
- Sukuma wiki (1 bunch): KES 20-40
- Cabbage (small piece): KES 15-25
- Tomato (1): KES 15-25
- Banana (1): KES 10-15
- Avocado (1): KES 25-50
- Milk (1 cup): KES 20-25
- Oats (1 serving): KES 25-35
- Groundnuts (handful): KES 20-30

${recentMealNames.length > 0 ? `=== AVOID (recently recommended) ===\n${recentMealNames.join(', ')}` : ''}

=== RULES ===
1. Total cost of ALL 3 meals combined must stay within ${budget.daily}
2. Each meal cost must be realistic based on the prices above
3. Prioritise local, affordable foods based on the budget tier
4. Respect health conditions and allergies strictly
5. Match portions to weight goal:
   - "lose": smaller portions, high fibre, less oil
   - "gain": bigger portions, more protein, more calories
   - "maintain": balanced, moderate portions

=== OUTPUT (STRICT JSON, no markdown) ===
[
  {
    "type": "Breakfast",
    "meal": "Specific meal name",
    "calories": "200-350 cal",
    "cost_kes": "KES 60",
    "reason": "Why this meal, how it fits budget and goal"
  },
  {
    "type": "Lunch",
    "meal": "Specific meal name",
    "calories": "350-500 cal",
    "cost_kes": "KES 120",
    "reason": "Why this meal"
  },
  {
    "type": "Dinner",
    "meal": "Specific meal name",
    "calories": "300-450 cal",
    "cost_kes": "KES 100",
    "reason": "Why this meal"
  }
]

IMPORTANT: Return ONLY the JSON array. Total of all cost_kes must not exceed ${budget.daily}.
`.trim();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate today's personalized meal plan." }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 800,
    });

    let aiContent = completion.choices[0]?.message?.content || "[]";
    aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

    let mealPlan;
    try {
        mealPlan = JSON.parse(aiContent);
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Content:", aiContent);
        return res.status(500).json({ error: "AI response was not valid JSON" });
    }

    if (!Array.isArray(mealPlan) || mealPlan.length !== 3) {
      console.error("Invalid meal plan structure:", mealPlan);
      return res.status(500).json({ error: "Invalid meal plan generated" });
    }

    // D. Save to Database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

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
          meal.reason  // ✅ reason now includes cost context from AI
        ]);
        savedMeals.push(saved.rows[0]);
      }

      await client.query('COMMIT');

      res.status(200).json({
        message: "Fresh meal plan generated successfully",
        location: finalLocationInput,
        budget_tier: budgetKey,
        budget_daily: budget.daily,
        data: savedMeals.map(meal => ({
          ...meal,
          // ✅ Attach cost from AI response if available
          cost_kes: mealPlan.find(m => m.meal === meal.meal_name)?.cost_kes || null
        })),
        tips: [
          `Your daily food budget is approximately ${budget.daily}`,
          "Buy seasonal produce from local markets for the best prices",
          "Cooking in bulk saves both time and money",
          "Drink at least 8 glasses of water throughout the day"
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