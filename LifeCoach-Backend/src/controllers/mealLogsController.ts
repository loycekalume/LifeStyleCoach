import { Request, Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

dotenv.config();
const groq = new Groq({ apiKey: process.env.XAI_API_KEY });

// POST /api/meals/log
export const logMealWithAI = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    const { meal_type, meal_name, portion_size } = req.body;

    if (!userId || !meal_type || !meal_name) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Updated Prompt for Macros
    const systemPrompt = `
        You are an expert Nutritionist. 
        Estimate the nutrition for the following meal.
        Context: The user is likely in Kenya (East Africa).
        
        Meal: ${meal_name}
        Portion: ${portion_size || "Standard Serving"}
        
        Strictly output ONLY a JSON object with these keys: 'calories', 'protein', 'carbs', 'fats'.
        Values must be integers (grams for macros).
        Example: { "calories": 450, "protein": 30, "carbs": 50, "fats": 15 }
        Do not add any text before or after the JSON.
    `;

    let nutrition = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Calculate nutrition." }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            max_tokens: 100
        });

        const aiResponse = completion.choices[0]?.message?.content || "{}";
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);
        
        nutrition = {
            calories: parsedData.calories || 0,
            protein: parsedData.protein || 0,
            carbs: parsedData.carbs || 0,
            fats: parsedData.fats || 0
        };

    } catch (aiError) {
        console.error("AI Estimation Failed:", aiError);
        // Fallback to 0 if AI fails
    }

    // 2. Updated Insert Query
    const insertQuery = `
        INSERT INTO meal_logs (user_id, meal_type, meal_name, portion_size, calories, protein, carbs, fats, log_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
        RETURNING *
    `;

    const result = await pool.query(insertQuery, [
        userId, 
        meal_type, 
        meal_name, 
        portion_size || 'Standard', 
        nutrition.calories,
        nutrition.protein,
        nutrition.carbs,
        nutrition.fats
    ]);

    res.status(201).json({
        message: "Meal logged successfully",
        data: result.rows[0],
        ai_estimated: nutrition.calories > 0
    });
});

// GET /api/meals/history
export const getDailyLog = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;

    const query = `
        SELECT * FROM meal_logs 
        WHERE user_id = $1 AND log_date = CURRENT_DATE
        ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    
    // 3. Calculate Totals for Frontend
    const totals = result.rows.reduce((acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    res.status(200).json({
        message: "Daily log retrieved",
        data: result.rows,
        totals: totals // Sending all totals now
    });
});