import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response } from "express";
import pool from "../db.config"; // adjust path to your DB connection

//  Create a new session
export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const { client_id, instructor_id, session_type, duration, scheduled_at, status, notes, meeting_link, chat_link } = req.body;

  if (!client_id || !instructor_id || !session_type || !duration || !scheduled_at) {
    res.status(400).json({ message: "Please provide all required fields" });
    return;
  }

  const result = await pool.query(
    `INSERT INTO sessions (client_id, instructor_id, session_type, duration, scheduled_at, status, notes, meeting_link, chat_link)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      client_id,
      instructor_id,
      session_type,
      duration,
      scheduled_at,
      status || "pending",
      notes || null,
      meeting_link || null,
      chat_link || null
    ]
  );

  res.status(201).json(result.rows[0]);
});

//  Get all sessions
export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT s.id, s.session_type, s.duration, s.scheduled_at, s.status, s.notes,
            s.meeting_link, s.chat_link,
            u.user_id AS client_id, u.name AS client_name, 
            i.instructor_id, iu.name AS instructor_name
     FROM sessions s
     JOIN users u ON s.client_id = u.user_id
     JOIN instructors i ON s.instructor_id = i.instructor_id
     JOIN users iu ON i.user_id = iu.user_id
     ORDER BY s.scheduled_at DESC`
  );

  res.json(result.rows);
});

//  Get single session by ID
export const getSessionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT s.id, s.session_type, s.duration, s.scheduled_at, s.status, s.notes,
            s.meeting_link, s.chat_link,
            u.user_id AS client_id, u.name AS client_name, 
            i.instructor_id, iu.name AS instructor_name
     FROM sessions s
     JOIN users u ON s.client_id = u.user_id
     JOIN instructors i ON s.instructor_id = i.instructor_id
     JOIN users iu ON i.user_id = iu.user_id
     WHERE s.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(result.rows[0]);
});

//  Update a session
export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { session_type, duration, scheduled_at, status, notes, meeting_link, chat_link } = req.body;

  const result = await pool.query(
    `UPDATE sessions
     SET session_type   = COALESCE($1, session_type),
         duration       = COALESCE($2, duration),
         scheduled_at   = COALESCE($3, scheduled_at),
         status         = COALESCE($4, status),
         notes          = COALESCE($5, notes),
         meeting_link   = COALESCE($6, meeting_link),
         chat_link      = COALESCE($7, chat_link)
     WHERE id = $8
     RETURNING *`,
    [session_type, duration, scheduled_at, status, notes, meeting_link, chat_link, id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json(result.rows[0]);
});

// Delete a session
export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query("DELETE FROM sessions WHERE id = $1 RETURNING *", [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Session not found" });
    return;
  }

  res.json({ message: "Session deleted successfully" });
});
