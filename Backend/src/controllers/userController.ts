import { Request, Response, NextFunction } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// ----------------- COMPLETE PROFILE -----------------
export const completeProfile = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const {
    weight_goal,
    age,
    weight,
    height,
    health_conditions,
    allergies,
    budget,
    location
  } = req.body;

  const result = await pool.query(
    `UPDATE users
     SET weight_goal = $1, age = $2, weight = $3, height = $4,
         health_conditions = $5, allergies = $6, budget = $7, location = $8
     WHERE user_id = $9
     RETURNING *`,
    [weight_goal, age, weight, height, health_conditions, allergies, budget, location, user_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ message: "Profile updated successfully", user: result.rows[0] });
});

// ----------------- UPDATE USER (PUT) -----------------
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const { name, email, gender, role } = req.body;

  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2, gender = $3, role = $4
     WHERE user_id = $5
     RETURNING *`,
    [name, email, gender, role, user_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ message: "User updated successfully", user: result.rows[0] });
});


export const patchUserAccount = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;

  const updates = [];
  const values = [];
  let idx = 1;

  // Only allow account fields
  const allowedFields = ['name', 'email', 'gender', 'role'];

  for (const [key, value] of Object.entries(req.body)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No valid account fields provided for update" });
  }

  values.push(user_id);

  const result = await pool.query(
    `UPDATE users SET ${updates.join(", ")} WHERE user_id = $${idx} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ message: "User account info updated successfully", user: result.rows[0] });
});

// ----------------- PATCH USER PROFILE INFO -----------------
export const patchUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;

  const updates = [];
  const values = [];
  let idx = 1;

  // Only allow profile fields
  const allowedFields = ['weight_goal', 'age', 'weight', 'height', 'health_conditions', 'allergies', 'budget', 'location'];

  for (const [key, value] of Object.entries(req.body)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No valid profile fields provided for update" });
  }

  values.push(user_id);

  const result = await pool.query(
    `UPDATE users SET ${updates.join(", ")} WHERE user_id = $${idx} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ message: "User profile updated successfully", user: result.rows[0] });
});


// ----------------- DELETE USER -----------------
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;

  const result = await pool.query(
    `DELETE FROM users WHERE user_id = $1 RETURNING *`,
    [user_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ message: "User deleted successfully" });
});

// ----------------- GET ALL USERS -----------------
export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`);
  res.status(200).json({ count: result.rows.length, users: result.rows });
});

// ----------------- GET SINGLE USER -----------------
export const getSingleUser = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;

  const result = await pool.query(
    `SELECT * FROM users WHERE user_id = $1`,
    [user_id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ user: result.rows[0] });
});
