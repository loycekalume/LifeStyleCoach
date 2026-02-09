import { Request, Response } from "express";
import pool from "../db.config";

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
        // ✅ NEW: Get Height for BMI Calc (Convert cm to meters)
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
                bmi: heightM > 0 ? (baseWeight / (heightM * heightM)).toFixed(1) : 0,
                total_workouts: 0
            }]);
        }

        // 6. Sort
        const sortedDates = Array.from(uniqueDates).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
        );

        // 7. Lookups
        const weightMap = new Map();
        weightLogs.forEach((w: any) => weightMap.set(w.date, parseFloat(w.weight)));
        
        const workoutSet = new Set(workoutLogs.map((w: any) => w.date));

        // 8. Build Response with USEFUL METRICS
        let lastKnownWeight = baseWeight;
        if (weightLogs.length > 0 && new Date(weightLogs[0].date) < new Date(sortedDates[0])) {
             lastKnownWeight = parseFloat(weightLogs[0].weight);
        }

        let cumulativeWorkouts = 0; // ✅ Tracks total effort over time

        const responseData = sortedDates.map(date => {
            // Update weight if new log exists
            if (weightMap.has(date)) {
                lastKnownWeight = weightMap.get(date);
            }

            // Update cumulative workout count
            if (workoutSet.has(date)) {
                cumulativeWorkouts++;
            }

            // ✅ Calculate BMI
            let bmi = 0;
            if (heightM > 0 && lastKnownWeight > 0) {
                bmi = parseFloat((lastKnownWeight / (heightM * heightM)).toFixed(1));
            }

            return {
                date: date,
                weight: lastKnownWeight,
                bmi: bmi, // ✅ New Metric
                total_workouts: cumulativeWorkouts // ✅ New Metric (Always goes up)
            };
        });

        res.json(responseData);

    } catch (err) {
        console.error("Progress API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};