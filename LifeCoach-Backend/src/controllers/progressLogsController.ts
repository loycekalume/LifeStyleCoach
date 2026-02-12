import { Request, Response } from "express";
import pool from "../db.config";

// ===========================
// GET CLIENT PROGRESS (Weight & Workouts over time)
// ===========================
export const getClientProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // 1. Fetch Basic Profile Info (Height is constant-ish)
        const profileRes = await pool.query(`SELECT height, weight FROM clients WHERE user_id = $1`, [userId]);
        const heightCm = parseFloat(profileRes.rows[0]?.height || 0);
        const heightM = heightCm > 0 ? heightCm / 100 : 0;
        const currentWeight = parseFloat(profileRes.rows[0]?.weight || 0);

        // 2. Fetch Weight History
        const weightQuery = `
            SELECT log_date::text as date, weight 
            FROM client_progress_logs 
            WHERE user_id = $1 
            ORDER BY log_date ASC
        `;

        // 3. Fetch Workout History (Count per day)
        const workoutQuery = `
            SELECT date_completed::date::text as date, COUNT(*) as count
            FROM workout_logs 
            WHERE client_id = $1 
            GROUP BY date_completed::date
            ORDER BY date_completed::date ASC
        `;

        const [weightRes, workoutRes] = await Promise.all([
            pool.query(weightQuery, [userId]),
            pool.query(workoutQuery, [userId])
        ]);

        const weightLogs = weightRes.rows;
        const workoutLogs = workoutRes.rows;

        // 4. Collect ALL unique dates from both sets
        const allDates = new Set<string>();
        weightLogs.forEach((row: any) => allDates.add(row.date));
        workoutLogs.forEach((row: any) => allDates.add(row.date));

        // If no logs exist, return a single entry with current profile data
        if (allDates.size === 0) {
            const today = new Date().toISOString().split('T')[0];
            return res.json([{
                date: today,
                weight: currentWeight,
                bmi: heightM > 0 ? parseFloat((currentWeight / (heightM * heightM)).toFixed(1)) : 0,
                total_workouts: 0
            }]);
        }

        // 5. Sort dates chronologically
        const sortedDates = Array.from(allDates).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
        );

        // 6. Build the timeline (Filling in gaps)
        let lastWeight = currentWeight; 
        // If the first log is historically earlier than current profile weight, start from that
        if (weightLogs.length > 0) {
             lastWeight = parseFloat(weightLogs[0].weight);
        }

        let cumulativeWorkouts = 0;
        
        // Maps for O(1) lookup
        const weightMap = new Map(weightLogs.map((l: any) => [l.date, parseFloat(l.weight)]));
        const workoutMap = new Map(workoutLogs.map((l: any) => [l.date, parseInt(l.count)]));

        const responseData = sortedDates.map(date => {
            // Update weight if a new log exists for this date, otherwise keep previous (Forward Fill)
            if (weightMap.has(date)) {
                lastWeight = weightMap.get(date)!;
            }

            // Update cumulative workouts
            if (workoutMap.has(date)) {
                cumulativeWorkouts += workoutMap.get(date)!;
            }

            // Calculate BMI dynamically based on that day's weight
            const bmi = (heightM > 0 && lastWeight > 0) 
                ? parseFloat((lastWeight / (heightM * heightM)).toFixed(1)) 
                : 0;

            return {
                date,
                weight: lastWeight,
                bmi,
                total_workouts: cumulativeWorkouts // Cumulative total up to this date
            };
        });

        res.json(responseData);

    } catch (err) {
        console.error("Progress API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// GET NUTRITION PROGRESS (Calories/Macros over time)
// ===========================
export const getClientNutritionProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const query = `
            SELECT 
                log_date::text as date,
                COALESCE(SUM(calories), 0) as total_calories,
                COALESCE(SUM(protein), 0) as total_protein,
                COALESCE(SUM(carbs), 0) as total_carbs,
                COALESCE(SUM(fats), 0) as total_fats,
                COUNT(*) as meals_logged
            FROM meal_logs
            WHERE user_id = $1
            GROUP BY log_date
            ORDER BY log_date ASC
        `;

        const result = await pool.query(query, [userId]);

        const formatted = result.rows.map((row: any) => ({
            date: row.date,
            total_calories: parseInt(row.total_calories),
            total_protein: parseInt(row.total_protein),
            total_carbs: parseInt(row.total_carbs),
            total_fats: parseInt(row.total_fats),
            meals_logged: parseInt(row.meals_logged)
        }));

        res.json(formatted);
    } catch (err) {
        console.error("Nutrition API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// GET DASHBOARD STATS (Summaries)
// ===========================
export const getClientDashboard = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // 1. Workout Stats (Last 30 Days)
        const workoutRes = await pool.query(`
            SELECT 
                COUNT(*) as total_workouts,
                COALESCE(AVG(rating), 0) as avg_rating,
                COALESCE(SUM(duration_minutes), 0) as total_minutes
            FROM workout_logs
            WHERE client_id = $1 
            AND date_completed >= CURRENT_DATE - INTERVAL '30 days'
        `, [userId]);

        // 2. Nutrition Stats (Last 30 Days)
        const nutritionRes = await pool.query(`
             SELECT 
                COUNT(DISTINCT log_date) as days_logged,
                COALESCE(AVG(daily_cals), 0) as avg_calories
             FROM (
                SELECT log_date, SUM(calories) as daily_cals
                FROM meal_logs
                WHERE user_id = $1
                AND log_date >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY log_date
             ) sub
        `, [userId]);

        // 3. Streak (Simplistic check for consecutive days)
        // Note: Real streak logic is complex, this checks if they did something today/yesterday
        const streakRes = await pool.query(`
            SELECT 
                CASE WHEN EXISTS (
                    SELECT 1 FROM workout_logs WHERE client_id = $1 AND date_completed::date = CURRENT_DATE
                ) THEN true ELSE false END as workout_done,
                CASE WHEN EXISTS (
                    SELECT 1 FROM meal_logs WHERE user_id = $1 AND log_date = CURRENT_DATE
                ) THEN true ELSE false END as meals_logged
        `, [userId]);

        // Mocking streak calculation for now (requires complex recursive query otherwise)
        const streakCount = 0; 

        res.json({
            workouts: {
                total_workouts: parseInt(workoutRes.rows[0]?.total_workouts || 0),
                avg_rating: parseFloat(workoutRes.rows[0]?.avg_rating || 0).toFixed(1),
                total_minutes: parseInt(workoutRes.rows[0]?.total_minutes || 0)
            },
            nutrition: {
                days_logged: parseInt(nutritionRes.rows[0]?.days_logged || 0),
                avg_calories: Math.round(parseFloat(nutritionRes.rows[0]?.avg_calories || 0))
            },
            streak: {
                current_streak: streakCount, 
                workout_done: streakRes.rows[0]?.workout_done,
                meals_logged: streakRes.rows[0]?.meals_logged
            }
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===========================
// GET WEEKLY SUMMARY (Last 7 Days)
// ===========================
export const getWeeklySummary = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const query = `
            SELECT 
                d.date::text,
                COALESCE(w.count, 0) as workouts,
                COALESCE(w.mins, 0) as minutes,
                COALESCE(m.cals, 0) as calories
            FROM (
                SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date as date
            ) d
            LEFT JOIN (
                SELECT date_completed::date as date, COUNT(*) as count, SUM(duration_minutes) as mins
                FROM workout_logs WHERE client_id = $1 GROUP BY 1
            ) w ON d.date = w.date
            LEFT JOIN (
                SELECT log_date as date, SUM(calories) as cals
                FROM meal_logs WHERE user_id = $1 GROUP BY 1
            ) m ON d.date = m.date
            ORDER BY d.date ASC
        `;
        
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Weekly Summary Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};