import { Request, Response } from "express";
import pool from "../db.config";

// ===========================
// Get Client Progress (Weight & BMI)
// Reads from dedicated weight_logs table
// ===========================
export const getClientProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // 1. Fetch height from clients table (for BMI calculation)
        const profileQuery = `SELECT height FROM clients WHERE user_id = $1`;

        // 2. Fetch all weight logs from dedicated table — every row is a unique date
        const weightQuery = `
            SELECT 
                log_date::text as date, 
                weight 
            FROM weight_logs 
            WHERE user_id = $1 
            ORDER BY log_date ASC
        `;

        const [profileRes, weightRes] = await Promise.all([
            pool.query(profileQuery, [userId]),
            pool.query(weightQuery, [userId])
        ]);

        const heightCm = parseFloat(profileRes.rows[0]?.height || 0);
        const heightM = heightCm > 0 ? heightCm / 100 : 0;
        const weightLogs = weightRes.rows;

        // 3. If no weight logs exist at all, return empty array
        // (baseline should have been inserted on profile creation)
        if (weightLogs.length === 0) {
            return res.json([]);
        }

        // 4. Calculate BMI for each weight entry
        const responseData = weightLogs.map((log: any) => {
            const weight = parseFloat(log.weight);
            const bmi = heightM > 0 && weight > 0
                ? parseFloat((weight / (heightM * heightM)).toFixed(1))
                : 0;

            return {
                date: log.date,
                weight,
                bmi,
            };
        });

        res.json(responseData);

    } catch (err) {
        console.error("Progress API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// Log Weight Entry
// Inserts a new row per date — same date updates, new date inserts
// ===========================
export const logWeight = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { weight, date } = req.body;

    try {
        if (!weight || weight <= 0) {
            return res.status(400).json({ message: "Invalid weight value" });
        }

        const logDate = date || new Date().toISOString().split('T')[0];

        // Upsert: same date = update weight, new date = insert new row
        const result = await pool.query(
            `INSERT INTO weight_logs (user_id, weight, log_date)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, log_date) 
             DO UPDATE SET weight = EXCLUDED.weight
             RETURNING *`,
            [userId, weight, logDate]
        );

        // Keep clients table in sync with the latest weight
        // Only updates if this log is the most recent date
        await pool.query(
            `UPDATE clients 
             SET weight = $1 
             WHERE user_id = $2
             AND NOT EXISTS (
                SELECT 1 FROM weight_logs 
                WHERE user_id = $2 AND log_date > $3
             )`,
            [weight, userId, logDate]
        );

        return res.json({
            message: "Weight logged successfully",
            data: result.rows[0]
        });

    } catch (err) {
        console.error("Log Weight API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// Get Client Nutrition Progress
// Returns daily totals (one entry per day)
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
        // 1. Workout stats (last 30 days)
        const workoutStatsQuery = `
            SELECT 
                COUNT(*) as total_workouts,
                COALESCE(AVG(rating), 0) as avg_rating,
                COALESCE(SUM(duration_minutes), 0) as total_minutes
            FROM workout_logs
            WHERE client_id = $1
                AND date_completed >= NOW() - INTERVAL '30 days'
        `;

        // 2. Nutrition stats (History: days logged)
        const nutritionStatsQuery = `
            SELECT 
                COUNT(DISTINCT log_date) as days_logged
            FROM meal_logs
            WHERE user_id = $1
                AND log_date >= CURRENT_DATE - INTERVAL '30 days'
        `;

        // 3. Today's Calorie Total (The Fix)
        const todayCaloriesQuery = `
            SELECT COALESCE(SUM(calories), 0) as today_calories
            FROM meal_logs
            WHERE user_id = $1 AND log_date = CURRENT_DATE
        `;

        // 4. Streak calculation
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

        // 5. Last activity date (to check if streak is still alive)
        const lastActivityQuery = `
            SELECT MAX(d) as last_date FROM (
                SELECT log_date as d FROM meal_logs WHERE user_id = $1
                UNION
                SELECT date_completed::date as d FROM workout_logs WHERE client_id = $1
            ) as recent
        `;

        // Run all queries in parallel
        const [workoutStats, nutritionStats, todayCaloriesRes, lastActivity] = await Promise.all([
            pool.query(workoutStatsQuery, [userId]),
            pool.query(nutritionStatsQuery, [userId]),
            pool.query(todayCaloriesQuery, [userId]),
            pool.query(lastActivityQuery, [userId])
        ]);

        // Streak Logic
        let currentStreak = 0;
        const lastDate = lastActivity.rows[0]?.last_date
            ? new Date(lastActivity.rows[0].last_date)
            : null;

        if (lastDate) {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            const lastDateStr = lastDate.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const isRecent = lastDateStr === todayStr || lastDateStr === yesterdayStr;

            if (isRecent) {
                const streakRes = await pool.query(streakQuery, [userId]);
                currentStreak = parseInt(streakRes.rows[0]?.streak_days || "0");
            }
        }

        // Check today's specific activity flags
        const todayCheck = await pool.query(`
            SELECT 
                EXISTS(
                    SELECT 1 FROM workout_logs 
                    WHERE client_id = $1 AND date_completed::date = CURRENT_DATE
                ) as workout_done,
                EXISTS(
                    SELECT 1 FROM meal_logs 
                    WHERE user_id = $1 AND log_date = CURRENT_DATE
                ) as meals_logged
        `, [userId]);

        // Send Final Response
        res.json({
            workouts: {
                total_workouts: parseInt(workoutStats.rows[0]?.total_workouts) || 0,
                avg_rating: parseFloat(workoutStats.rows[0]?.avg_rating) || 0,
                total_minutes: parseInt(workoutStats.rows[0]?.total_minutes) || 0
            },
            nutrition: {
                days_logged: parseInt(nutritionStats.rows[0]?.days_logged) || 0,
                // ✅ FIXED: Returns today's total sum instead of average
                today_calories: parseInt(todayCaloriesRes.rows[0]?.today_calories) || 0 
            },
            streak: {
                current_streak: currentStreak,
                workout_done: todayCheck.rows[0]?.workout_done || false,
                meals_logged: todayCheck.rows[0]?.meals_logged || false
            }
        });

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