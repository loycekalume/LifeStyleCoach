import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response } from "express";
import pool from "../db.config";

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user.user_id; // This is the instructor's user_id
  const { client_id, session_type, duration, scheduled_at, status, notes, meeting_link, chat_link } = req.body;

  // Validation
  if (!client_id || !session_type || !duration || !scheduled_at) {
      return res.status(400).json({ message: "Please provide Client, Type, Duration, and Date." });
  }

  // ✅ Get instructor_id for the sessions table (which uses instructors.instructor_id)
  const instructorQuery = await pool.query(
    `SELECT instructor_id FROM instructors WHERE user_id = $1`,
    [user_id]
  );

  if (instructorQuery.rows.length === 0) {
    return res.status(403).json({ message: "Instructor profile not found." });
  }

  const instructor_id = instructorQuery.rows[0].instructor_id;

  // ✅ FIX: Check relationship using user_id (not instructor_id from instructors table)
  const relationCheck = await pool.query(
    `SELECT * FROM instructor_clients WHERE instructor_id = $1 AND client_id = $2`,
    [user_id, client_id] // ← Changed from instructor_id to user_id
  );


  if (relationCheck.rows.length === 0) {
    return res.status(403).json({ message: "You can only schedule sessions for your hired clients." });
  }

  // Create session (this uses instructor_id from instructors table)
  const result = await pool.query(
    `INSERT INTO sessions (client_id, instructor_id, session_type, duration, scheduled_at, status, notes, meeting_link, chat_link)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [client_id, instructor_id, session_type, duration, scheduled_at, status || "pending", notes, meeting_link, chat_link]
  );

  res.status(201).json(result.rows[0]);
});
// ✅ 2. Get My Sessions
// ✅ FIXED: Get My Sessions
export const getInstructorSessions = asyncHandler(async (req: Request, res: Response) => {
  const user_id = (req as any).user.user_id;

  // ✅ Get instructor_id
  const instructorQuery = await pool.query(
    `SELECT instructor_id FROM instructors WHERE user_id = $1`,
    [user_id]
  );

  if (instructorQuery.rows.length === 0) {
    return res.status(403).json({ message: "Instructor profile not found." });
  }

  const instructor_id = instructorQuery.rows[0].instructor_id;

  // Join Users and Instructors to get Names
  const query = `
    SELECT s.id, s.session_type, s.duration, s.scheduled_at, s.status, s.notes,
           s.meeting_link, s.chat_link,
           u.user_id AS client_id, u.name AS client_name, 
           i.instructor_id, iu.name AS instructor_name
    FROM sessions s
    JOIN users u ON s.client_id = u.user_id
    JOIN instructors i ON s.instructor_id = i.instructor_id
    JOIN users iu ON i.user_id = iu.user_id
    WHERE s.instructor_id = $1
    ORDER BY s.scheduled_at DESC
  `;

  const result = await pool.query(query, [instructor_id]);
  res.json({ sessions: result.rows });
});

// ✅ 3. Update Session
export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { session_type, duration, scheduled_at, status, notes, meeting_link, chat_link } = req.body;

  const result = await pool.query(
    `UPDATE sessions
     SET session_type = COALESCE($1, session_type),
         duration = COALESCE($2, duration),
         scheduled_at = COALESCE($3, scheduled_at),
         status = COALESCE($4, status),
         notes = COALESCE($5, notes),
         meeting_link = COALESCE($6, meeting_link),
         chat_link = COALESCE($7, chat_link)
     WHERE id = $8
     RETURNING *`,
    [session_type, duration, scheduled_at, status, notes, meeting_link, chat_link, id]
  );

  if (result.rows.length === 0) return res.status(404).json({ message: "Session not found" });
  res.json(result.rows[0]);
});

// ✅ 4. Delete Session
export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
  res.json({ message: "Session deleted" });
});