import { Request, Response } from "express";
import pool from "../db.config";

// ===========================
// Get Client Progress (Weight, BMI, Workouts)
// NOW: Returns ONLY actual weight log entries (not daily snapshots)
// ===========================
export const getClientProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // 1. Fetch Height for BMI calculation
        const profileQuery = `SELECT height FROM clients WHERE user_id = $1`;
        
        // 2. Fetch ACTUAL Weight Logs (only dates where weight was logged)
        const progressQuery = `
            SELECT 
                log_date::text as date, 
                weight 
            FROM client_progress_logs 
            WHERE user_id = $1 
            ORDER BY log_date ASC
        `;

        // 3. Count workouts up to each weight log date
        const workoutCountQuery = `
            SELECT 
                cpl.log_date::text as date,
                COUNT(wl.log_id) as total_workouts
            FROM client_progress_logs cpl
            LEFT JOIN workout_logs wl 
                ON wl.client_id = $1 
                AND wl.date_completed::date <= cpl.log_date
            WHERE cpl.user_id = $1
            GROUP BY cpl.log_date
            ORDER BY cpl.log_date ASC
        `;

        const [profileRes, progressRes, workoutCountRes] = await Promise.all([
            pool.query(profileQuery, [userId]),
            pool.query(progressQuery, [userId]),
            pool.query(workoutCountQuery, [userId])
        ]);

        const heightCm = parseFloat(profileRes.rows[0]?.height || 0);
        const heightM = heightCm > 0 ? heightCm / 100 : 0;

        const weightLogs = progressRes.rows;
        const workoutCounts = new Map(
            workoutCountRes.rows.map((row: any) => [row.date, parseInt(row.total_workouts)])
        );

        // 4. Calculate BMI for each weight entry
        const responseData = weightLogs.map((log: any) => {
            const weight = parseFloat(log.weight);
            let bmi = 0;
            
            if (heightM > 0 && weight > 0) {
                bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
            }

            return {
                date: log.date,
                weight: weight,
                bmi: bmi,
                total_workouts: workoutCounts.get(log.date) || 0
            };
        });

        res.json(responseData);

    } catch (err) {
        console.error("Progress API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// NEW: Log Weight Entry
// ===========================
export const logWeight = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { weight, date } = req.body;

    try {
        // Validate input
        if (!weight || weight <= 0) {
            return res.status(400).json({ message: "Invalid weight value" });
        }

        const logDate = date || new Date().toISOString().split('T')[0];

        // Check if entry already exists for this date
        const checkQuery = `
            SELECT log_id FROM client_progress_logs 
            WHERE user_id = $1 AND log_date = $2
        `;
        const existing = await pool.query(checkQuery, [userId, logDate]);

        if (existing.rows.length > 0) {
            // Update existing entry
            const updateQuery = `
                UPDATE client_progress_logs 
                SET weight = $1, updated_at = NOW()
                WHERE user_id = $2 AND log_date = $3
                RETURNING *
            `;
            const result = await pool.query(updateQuery, [weight, userId, logDate]);
            return res.json({ 
                message: "Weight updated successfully", 
                data: result.rows[0] 
            });
        } else {
            // Insert new entry
            const insertQuery = `
                INSERT INTO client_progress_logs (user_id, log_date, weight)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await pool.query(insertQuery, [userId, logDate, weight]);
            return res.json({ 
                message: "Weight logged successfully", 
                data: result.rows[0] 
            });
        }

    } catch (err) {
        console.error("Log Weight API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// Get Client Nutrition Progress
// NOW: Returns daily totals (one entry per day)
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
// Get Dashboard Summary Stats
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
// Get Weekly Summary
// ===========================
export const getWeeklySummary = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
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