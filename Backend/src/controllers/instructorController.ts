import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// CREATE INSTRUCTOR PROFILE
export const createInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { instructor_id, specialization, coaching_mode, bio, available_locations } = req.body;

  // Check instructor_id (user_id) provided
  if (!instructor_id) {
    return res.status(400).json({ message: "instructor_id (user_id) is required" });
  }

  // Verify user exists and has role 'instructor'
  const userResult = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [instructor_id]);
  if (userResult.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  if (userResult.rows[0].role !== "instructor") {
    return res.status(400).json({ message: "User is not registered as an instructor" });
  }

  // Insert instructor profile
  const result = await pool.query(
    `INSERT INTO instructors (instructor_id, specialization, coaching_mode, bio, available_locations)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [instructor_id, specialization, coaching_mode, bio, available_locations]
  );

  res.status(201).json({ message: "Instructor profile created", instructor: result.rows[0] });
});

// GET ALL INSTRUCTORS
export const getAllInstructors = asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query(`SELECT * FROM instructors ORDER BY created_at DESC`);
  res.status(200).json({ count: result.rows.length, instructors: result.rows });
});

// GET SINGLE INSTRUCTOR
export const getSingleInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { instructor_id } = req.params;

  const result = await pool.query(`SELECT * FROM instructors WHERE instructor_id = $1`, [instructor_id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Instructor not found" });
  }

  res.status(200).json({ instructor: result.rows[0] });
});

// UPDATE INSTRUCTOR PROFILE
export const updateInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { instructor_id } = req.params;
  const { specialization, coaching_mode, bio, available_locations } = req.body;

  const result = await pool.query(
    `UPDATE instructors
     SET specialization = $1, coaching_mode = $2, bio = $3, available_locations = $4
     WHERE instructor_id = $5
     RETURNING *`,
    [specialization, coaching_mode, bio, available_locations, instructor_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Instructor not found" });
  }

  res.status(200).json({ message: "Instructor profile updated", instructor: result.rows[0] });
});

// DELETE INSTRUCTOR
export const deleteInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { instructor_id } = req.params;

  const result = await pool.query(`DELETE FROM instructors WHERE instructor_id = $1 RETURNING *`, [instructor_id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Instructor not found" });
  }

  res.status(200).json({ message: "Instructor profile deleted" });
});
