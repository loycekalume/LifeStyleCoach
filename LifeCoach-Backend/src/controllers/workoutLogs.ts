import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";



// Get logs for the Graph & Timeline (Instructor View)
export const getClientLogs = asyncHandler(async (req: Request, res: Response) => {
    const { client_id } = req.params; 

    try {
        const query = `
            SELECT 
                wl.log_id,
                w.title as workout_title,
                wl.date_completed,
                wl.duration_minutes,
                wl.rating,
                wl.notes as client_notes
                -- Removed proof_url
            FROM workout_logs wl
            JOIN workouts w ON wl.workout_id = w.workout_id
            WHERE wl.client_id = $1
            ORDER BY wl.date_completed ASC 
        `;
        const result = await pool.query(query, [client_id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Server error fetching logs" });
    }
});

// ==========================================
// 2. CLIENT ACTIONS
// ==========================================


export const getMyAssignments = asyncHandler(async (req: Request, res: Response) => {
    // For user 13, clientId will be 13
    const clientId = (req as any).user.user_id; 

    const query = `
        SELECT 
            cw.id as assignment_id,
            cw.status,
            cw.date_assigned,
            cw.last_performed,
            cw.notes as instructor_notes,
            w.workout_id,
            w.title,
            w.description,
            w.video_url,
            w.total_duration,
            w.plan,
            u.name as instructor_name
        FROM client_workouts cw
        JOIN workouts w ON cw.workout_id = w.workout_id
        -- First, join to instructors to get the user_id for that instructor
        LEFT JOIN instructors i ON cw.instructor_id = i.instructor_id
        -- Then, join to users to get the actual name (Frank Omolo)
        LEFT JOIN users u ON i.user_id = u.user_id
        WHERE cw.client_id = $1 
        AND cw.status = 'scheduled'
        ORDER BY cw.date_assigned DESC
    `;

    const result = await pool.query(query, [clientId]);
    
    // Log for your terminal to confirm it's working
    console.log(`[SUCCESS] Found ${result.rows.length} assignments for User ${clientId}`);
    
    res.status(200).json(result.rows);
});

// Log a Session (The "I Finished" Button)
export const logWorkoutSession = asyncHandler(async (req: Request, res: Response) => {
    const { assignment_id, workout_id, duration, notes, rating } = req.body;
    const clientId = (req as any).user.user_id;

    if (!workout_id || !duration) {
        return res.status(400).json({ message: "Workout ID and Duration are required" });
    }

    try {
        // 1. Insert into History Log (No proof_url)
        const insertQuery = `
            INSERT INTO workout_logs (client_id, workout_id, assignment_id, duration_minutes, notes, rating)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const logResult = await pool.query(insertQuery, [
            clientId, workout_id, assignment_id, duration, notes, rating
        ]);

        // 2. Update "last_performed" so the client knows they did it today
        if (assignment_id) {
            await pool.query(
                `UPDATE client_workouts SET last_performed = CURRENT_TIMESTAMP WHERE id = $1`,
                [assignment_id]
            );
        }

        res.status(201).json({ message: "Workout logged successfully!", log: logResult.rows[0] });
    } catch (error) {
        console.error("Error logging workout:", error);
        res.status(500).json({ message: "Failed to log workout" });
    }
});