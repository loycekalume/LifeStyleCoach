import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";

// GET /client/sessions
export const getUpcomingSessions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;

    // We use UNION ALL to combine Dietician Consultations AND Instructor Sessions.
    // We strictly cast columns to match the frontend expectations.
    
    const query = `
        -- 1. DIETICIAN CONSULTATIONS
        SELECT 
            c.consultation_id as id,
            'dietician' as session_type,
            c.category as session_title,
            u.name as host_name, 
            c.scheduled_date::text as session_date,
            c.scheduled_time::text as start_time,
            c.meeting_link,
            c.status,
            c.scheduled_date + c.scheduled_time as sort_timestamp -- Helper for sorting
        FROM consultations c
        JOIN dieticians d ON c.dietician_id = d.dietician_id
        JOIN users u ON d.user_id = u.user_id
        WHERE c.client_id = $1 
          AND c.status IN ('scheduled', 'confirmed') 
          AND c.scheduled_date >= CURRENT_DATE

        UNION ALL

        -- 2. INSTRUCTOR SESSIONS
        SELECT 
            s.id,
            'instructor' as session_type,
            s.session_type as session_title,
            u.name as host_name,
            s.scheduled_at::date::text as session_date,
            s.scheduled_at::time::text as start_time,
            s.meeting_link,
            s.status,
            s.scheduled_at as sort_timestamp
        FROM sessions s
        JOIN instructors i ON s.instructor_id = i.instructor_id
        JOIN users u ON i.user_id = u.user_id
        WHERE s.client_id = $1 
          AND s.status IN ('pending', 'confirmed') 
          AND s.scheduled_at >= CURRENT_TIMESTAMP

        ORDER BY sort_timestamp ASC
        LIMIT 5
    `;

    const result = await pool.query(query, [userId]);

    res.json({
        sessions: result.rows
    });
});