import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";



// GET /instructorStats/
export const getInstructorStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;

    // 1. Get the instructor_id from instructors table (for sessions & workouts)
    const instructorQuery = `SELECT instructor_id FROM instructors WHERE user_id = $1`;
    const instructorResult = await pool.query(instructorQuery, [userId]);

    if (instructorResult.rows.length === 0) {
        return res.status(404).json({ message: "Instructor profile not found for this user." });
    }

    const instructorId = instructorResult.rows[0].instructor_id;

    // 2. Run counts with the CORRECT IDs for each table
    const [clientsRes, sessionsRes, workoutsRes, pendingRes] = await Promise.all([
        // ✅ instructor_clients uses users.user_id
        pool.query(
            `SELECT COUNT(*)::int as count FROM instructor_clients WHERE instructor_id = $1`, 
            [userId] // ← Use userId, NOT instructorId
        ),
        // ✅ sessions uses instructors.instructor_id
        pool.query(
            `SELECT COUNT(*)::int as count FROM sessions WHERE instructor_id = $1 AND status = 'completed'`, 
            [instructorId] // ← Use instructorId
        ),
        // ✅ workouts uses instructors.instructor_id
        pool.query(
            `SELECT COUNT(*)::int as count FROM workouts WHERE instructor_id = $1`, 
            [instructorId] // ← Use instructorId
        ),
        // ✅ sessions uses instructors.instructor_id
        pool.query(
            `SELECT COUNT(*)::int as count FROM sessions WHERE instructor_id = $1 AND status = 'pending'`, 
            [instructorId] // ← Use instructorId
        )
    ]);

    res.json({
        total_clients: clientsRes.rows[0].count,
        sessions_completed: sessionsRes.rows[0].count,
        workouts_created: workoutsRes.rows[0].count,
        pending_sessions: pendingRes.rows[0].count
    });
});