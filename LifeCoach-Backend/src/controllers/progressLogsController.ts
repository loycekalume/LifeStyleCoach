import { Request, Response } from "express";
import pool from "../db.config";

export const getClientProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // 1. Fetch Base Weight from Profile (The starting point)
        const profileQuery = `SELECT weight FROM clients WHERE user_id = $1`;
        
        // 2. Fetch Weight Logs (Updates over time)
        const progressQuery = `
            SELECT log_date::text as date, weight 
            FROM client_progress_logs 
            WHERE user_id = $1 
            ORDER BY log_date ASC
        `;

        // 3. Fetch Workout Dates (Activity)
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
        const weightLogs = progressRes.rows;
        const workoutLogs = workoutRes.rows;

        // 4. ✅ MERGE DATES: Create a master list of all active days
        const uniqueDates = new Set<string>();
        weightLogs.forEach((w: any) => uniqueDates.add(w.date));
        workoutLogs.forEach((w: any) => uniqueDates.add(w.date));

        // 5. HANDLE NO DATA: Return today's date with profile weight
        if (uniqueDates.size === 0) {
            return res.json([{
                date: new Date().toISOString().split('T')[0], // Today
                weight: baseWeight,
                workout_done: false,
                current_streak: 0
            }]);
        }

        // 6. Sort dates chronologically
        const sortedDates = Array.from(uniqueDates).sort((a, b) => 
            new Date(a).getTime() - new Date(b).getTime()
        );

        // 7. Lookups for O(1) access
        const weightMap = new Map();
        weightLogs.forEach((w: any) => weightMap.set(w.date, parseFloat(w.weight)));
        
        const workoutSet = new Set(workoutLogs.map((w: any) => w.date));

        // 8. Build the Response
        // We track "lastKnownWeight" to fill in gaps where the user worked out but didn't weigh themselves
        let lastKnownWeight = baseWeight;

        // Try to find the earliest logged weight to start with if available
        if (weightLogs.length > 0 && new Date(weightLogs[0].date) < new Date(sortedDates[0])) {
             lastKnownWeight = parseFloat(weightLogs[0].weight);
        }

        let currentStreak = 0;

        const responseData = sortedDates.map(date => {
            // Update weight if there is a new log for this specific day
            if (weightMap.has(date)) {
                lastKnownWeight = weightMap.get(date);
            }

            // Streak Logic (Simple: consecutive entries in this list)
            if (workoutSet.has(date)) {
                currentStreak++;
            } else {
                // Optional: Reset streak on missed days? 
                // For now, we keep it simple or let it persist.
                // currentStreak = 0; 
            }

            return {
                date: date,
                weight: lastKnownWeight, // Uses carried-over weight
                workout_done: workoutSet.has(date),
                current_streak: currentStreak
            };
        });

        res.json(responseData);

    } catch (err) {
        console.error("Progress API Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};