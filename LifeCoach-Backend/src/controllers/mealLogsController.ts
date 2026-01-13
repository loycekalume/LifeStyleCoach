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

    // 1. Construct AI Prompt for Calorie Estimation
    // We explicitly ask for a Kenyan context to understand local dishes like 'Ugali' correctly.
    const systemPrompt = `
        You are an expert Nutritionist. 
        Estimate the calories for the following meal.
        Context: The user is likely in Kenya (East Africa).
        
        Meal: ${meal_name}
        Portion: ${portion_size || "Standard Serving"}
        
        Strictly output ONLY a JSON object with a single key 'calories' containing the integer number.
        Example: { "calories": 450 }
        Do not add any explanation or other text.
    `;

    let estimatedCalories = 0;

    try {
        // 2. Call Groq AI
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Calculate calories." }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.1, // Low temp for precision
            max_tokens: 50
        });

        const aiResponse = completion.choices[0]?.message?.content || "{}";
        
        // Clean up response in case AI adds markdown
        const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanJson);
        
        estimatedCalories = parsedData.calories || 0;

    } catch (aiError) {
        console.error("AI Estimation Failed:", aiError);
        // Fallback: If AI fails, we log it with 0 calories and let the user edit it later
        // or you could return an error. Here we proceed with 0.
        estimatedCalories = 0;
    }

    // 3. Save to Database
    const insertQuery = `
        INSERT INTO meal_logs (user_id, meal_type, meal_name, portion_size, calories, log_date)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
        RETURNING *
    `;

    const result = await pool.query(insertQuery, [
        userId, 
        meal_type, 
        meal_name, 
        portion_size || 'Standard', 
        estimatedCalories
    ]);

    res.status(201).json({
        message: "Meal logged successfully",
        data: result.rows[0],
        ai_estimated: estimatedCalories > 0 // Flag to tell UI if AI worked
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
    
    // Calculate total daily calories
    const totalCalories = result.rows.reduce((sum, meal) => sum + (meal.calories || 0), 0);

    res.status(200).json({
        message: "Daily log retrieved",
        data: result.rows,
        total_calories: totalCalories
    });
});