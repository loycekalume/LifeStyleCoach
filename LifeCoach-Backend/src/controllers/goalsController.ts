import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";

// GET /client/goals
export const getClientGoals = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;

    // --- 1. CALCULATE UNIFIED STREAK (The Flame) ---
    // Rules: Consecutive days where User logged (Any Meal OR Any Workout)
    const streakQuery = `
        WITH combined_activity AS (
            SELECT log_date as activity_date FROM meal_logs WHERE user_id = $1
            UNION
            SELECT date_completed::date as activity_date FROM workout_logs WHERE client_id = $1
        ),
        distinct_dates AS (
            SELECT DISTINCT activity_date 
            FROM combined_activity 
            WHERE activity_date <= CURRENT_DATE
        ),
        groups AS (
            SELECT activity_date, 
                   activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::integer AS grp
            FROM distinct_dates
        )
        SELECT COUNT(*) as streak_days
        FROM groups
        WHERE grp = (
            SELECT grp FROM groups ORDER BY activity_date DESC LIMIT 1
        )
    `;

    // Check if streak is alive (Activity today or yesterday?)
    const lastActivityQuery = `
        SELECT MAX(d) as last_date FROM (
            SELECT log_date as d FROM meal_logs WHERE user_id = $1
            UNION
            SELECT date_completed::date as d FROM workout_logs WHERE client_id = $1
        ) as recent
    `;

    const lastResult = await pool.query(lastActivityQuery, [userId]);
    const lastDate = lastResult.rows[0]?.last_date ? new Date(lastResult.rows[0].last_date) : null;
    
    let currentStreak = 0;
    if (lastDate) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        // Compare dates without time
        const isRecent = lastDate.toISOString().split('T')[0] === today.toISOString().split('T')[0] || 
                         lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];

        if (isRecent) {
             const streakRes = await pool.query(streakQuery, [userId]);
             currentStreak = parseInt(streakRes.rows[0]?.streak_days || "0");
        }
    }


    // --- 2. CALCULATE WEEKLY GOALS (The Progress Bars) ---
    
    // A. Nutrition: Count days in last 7 days with 3+ meals
    const nutritionQuery = `
        SELECT COUNT(*) as perfect_days FROM (
            SELECT log_date 
            FROM meal_logs 
            WHERE user_id = $1 
            AND log_date > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY log_date 
            HAVING COUNT(*) >= 3
        ) as sub
    `;
    const nutritionRes = await pool.query(nutritionQuery, [userId]);
    const nutritionScore = parseInt(nutritionRes.rows[0]?.perfect_days || "0");

    // B. Workouts: Count days in last 7 days with 1+ workout
    const workoutQuery = `
        SELECT COUNT(DISTINCT date_completed::date) as active_days
        FROM workout_logs
        WHERE client_id = $1
        AND date_completed > CURRENT_TIMESTAMP - INTERVAL '7 days'
    `;
    const workoutRes = await pool.query(workoutQuery, [userId]);
    const workoutScore = parseInt(workoutRes.rows[0]?.active_days || "0");


    // --- 3. CONSTRUCT RESPONSE OBJECTS ---
    // We format these as "Goal Objects" so the Frontend can render them easily
    const generatedGoals = [
        {
            goal_id: 'auto_nutrition',
            title: 'Perfect Nutrition (3 meals/day)',
            current_value: nutritionScore,
            target_value: 7, // 7 days a week
            unit: 'days',
            status: nutritionScore >= 7 ? 'completed' : 'active',
            icon_type: 'food'
        },
        {
            goal_id: 'auto_fitness',
            title: 'Daily Workout',
            current_value: workoutScore,
            target_value: 7, // 7 days a week
            unit: 'days',
            status: workoutScore >= 7 ? 'completed' : 'active',
            icon_type: 'fitness'
        }
    ];

    res.json({
        goals: generatedGoals,
        streak: currentStreak
    });
});