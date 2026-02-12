import { Request, Response } from "express";
import pool from "../db.config";

// ===========================
// EXISTING: Get Client Progress (Weight, BMI, Workouts)
// ===========================
export const getClientProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // 1. Fetch Base Weight AND Height (Height is needed for BMI)
        const profileQuery = `SELECT weight, height FROM clients WHERE user_id = $1`;
        
        // 2. Fetch Weight Logs
        const progressQuery = `
            SELECT log_date::text as date, weight 
            FROM client_progress_logs 
            WHERE user_id = $1 
            ORDER BY log_date ASC
        `;

        // 3. Fetch Workout Dates
        const workoutQuery = `
            SELECT date_completed::date::text as date 
            FROM workout_logs 
            WHERE client_id = $1 
            ORDER BY date_completed ASC
        `;

        const [profileRes, progressRes, workoutRes] = await Promise.all([
            pool.query(profileQuery, [userId]),
            pool.query(progressQuery, [userId]),
            pool.query(workoutQuery, [userId])
        ]);

        const baseWeight = parseFloat(profileRes.rows[0]?.weight || 0);
        const heightCm = parseFloat(profileRes.rows[0]?.height || 0);
        const heightM = heightCm > 0 ? heightCm / 100 : 0;

        const weightLogs = progressRes.rows;
        const workoutLogs = workoutRes.rows;

        // 4. Merge Dates
        const uniqueDates = new Set<string>();
        weightLogs.forEach((w: any) => uniqueDates.add(w.date));
        workoutLogs.forEach((w: any) => uniqueDates.add(w.date));

        // 5. Handle Empty Data
        if (uniqueDates.size === 0) {
            return res.json([{
                date: new Date().toISOString().split('T')[0], 
                weight: baseWeight,
                bmi: heightM > 0 ? parseFloat((baseWeight / (heightM * heightM)).toFixed(1)) : 0,
                total_workouts: 0
            }]);
        }

        // 6. Sort Dates
        const sortedDates = Array.from(uniqueDates).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
        );

        // 7. Create Lookups
        const weightMap = new Map();
        weightLogs.forEach((w: any) => weightMap.set(w.date, parseFloat(w.weight)));
        
        const workoutSet = new Set(workoutLogs.map((w: any) => w.date));

        // 8. Build Response with Metrics
        let lastKnownWeight = baseWeight;
        if (weightLogs.length > 0 && new Date(weightLogs[0].date) < new Date(sortedDates[0])) {
             lastKnownWeight = parseFloat(weightLogs[0].weight);
        }

        let cumulativeWorkouts = 0;

        const responseData = sortedDates.map(date => {
            if (weightMap.has(date)) {
                lastKnownWeight = weightMap.get(date);
            }

            if (workoutSet.has(date)) {
                cumulativeWorkouts++;
            }

            let bmi = 0;
            if (heightM > 0 && lastKnownWeight > 0) {
                bmi = parseFloat((lastKnownWeight / (heightM * heightM)).toFixed(1));
            }

            return {
                date: date,
                weight: lastKnownWeight,
                bmi: bmi,
                total_workouts: cumulativeWorkouts
            };
        });

        res.json(responseData);

    } catch (err) {
        console.error("Progress API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// NEW: Get Client Nutrition Progress
// ===========================
export const getClientNutritionProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const nutritionQuery = `
            SELECT 
                log_date::text as date,
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fats) as total_fats,
                COUNT(*) as meals_logged
            FROM meal_logs
            WHERE user_id = $1
            GROUP BY log_date
            ORDER BY log_date ASC
        `;
        
        const result = await pool.query(nutritionQuery, [userId]);
        
        // Convert to numbers and format
        const formattedData = result.rows.map((row: any) => ({
            date: row.date,
            total_calories: parseInt(row.total_calories) || 0,
            total_protein: parseInt(row.total_protein) || 0,
            total_carbs: parseInt(row.total_carbs) || 0,
            total_fats: parseInt(row.total_fats) || 0,
            meals_logged: parseInt(row.meals_logged) || 0
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Nutrition Progress API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// NEW: Get Dashboard Summary Stats
// ===========================
export const getClientDashboard = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // Fetch workout stats (last 30 days)
        const workoutStatsQuery = `
            SELECT 
                COUNT(*) as total_workouts,
                COALESCE(AVG(rating), 0) as avg_rating,
                COALESCE(SUM(duration_minutes), 0) as total_minutes
            FROM workout_logs
            WHERE client_id = $1
                AND date_completed >= NOW() - INTERVAL '30 days'
        `;

        // Fetch nutrition stats (last 30 days)
        const nutritionStatsQuery = `
            SELECT 
                COUNT(DISTINCT log_date) as days_logged,
                COALESCE(AVG(daily_calories), 0) as avg_calories
            FROM (
                SELECT 
                    log_date, 
                    SUM(calories) as daily_calories
                FROM meal_logs
                WHERE user_id = $1
                    AND log_date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY log_date
            ) daily
        `;

        // Fetch current streak
        const streakQuery = `
            SELECT 
                current_streak,
                workout_done,
                meals_logged
            FROM progresslogs
            WHERE user_id = $1
            ORDER BY date DESC
            LIMIT 1
        `;

        const [workoutStats, nutritionStats, streakData] = await Promise.all([
            pool.query(workoutStatsQuery, [userId]),
            pool.query(nutritionStatsQuery, [userId]),
            pool.query(streakQuery, [userId])
        ]);

        // Format response
        const response = {
            workouts: {
                total_workouts: parseInt(workoutStats.rows[0]?.total_workouts) || 0,
                avg_rating: parseFloat(workoutStats.rows[0]?.avg_rating) || 0,
                total_minutes: parseInt(workoutStats.rows[0]?.total_minutes) || 0
            },
            nutrition: {
                days_logged: parseInt(nutritionStats.rows[0]?.days_logged) || 0,
                avg_calories: parseFloat(nutritionStats.rows[0]?.avg_calories) || 0
            },
            streak: {
                current_streak: parseInt(streakData.rows[0]?.current_streak) || 0,
                workout_done: streakData.rows[0]?.workout_done || false,
                meals_logged: streakData.rows[0]?.meals_logged || false
            }
        };

        res.json(response);

    } catch (err) {
        console.error("Dashboard API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// BONUS: Get Weekly Summary (for detailed insights)
// ===========================
export const getWeeklySummary = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // Last 7 days of activity
        const weeklyQuery = `
            WITH date_series AS (
                SELECT generate_series(
                    CURRENT_DATE - INTERVAL '6 days',
                    CURRENT_DATE,
                    '1 day'::interval
                )::date as date
            ),
            workouts AS (
                SELECT 
                    date_completed::date as date,
                    COUNT(*) as workout_count,
                    SUM(duration_minutes) as total_minutes
                FROM workout_logs
                WHERE client_id = $1
                    AND date_completed >= CURRENT_DATE - INTERVAL '6 days'
                GROUP BY date_completed::date
            ),
            meals AS (
                SELECT 
                    log_date as date,
                    SUM(calories) as total_calories,
                    COUNT(*) as meal_count
                FROM meal_logs
                WHERE user_id = $1
                    AND log_date >= CURRENT_DATE - INTERVAL '6 days'
                GROUP BY log_date
            )
            SELECT 
                ds.date::text,
                COALESCE(w.workout_count, 0) as workouts,
                COALESCE(w.total_minutes, 0) as minutes,
                COALESCE(m.meal_count, 0) as meals,
                COALESCE(m.total_calories, 0) as calories
            FROM date_series ds
            LEFT JOIN workouts w ON ds.date = w.date
            LEFT JOIN meals m ON ds.date = m.date
            ORDER BY ds.date ASC
        `;

        const result = await pool.query(weeklyQuery, [userId]);

        res.json(result.rows);

    } catch (err) {
        console.error("Weekly Summary API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};