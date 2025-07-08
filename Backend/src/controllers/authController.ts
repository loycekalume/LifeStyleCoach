import { Request, Response, NextFunction } from "express";
import pool from "../db/db.config";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers/generateToken";
import asyncHandler from "../middlewares/asyncHandler";


// ----------------- REGISTER -----------------
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, gender } = req.body;

  // 1. Validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide name, email, password, and role" });
  }

  if (!["user", "instructor", "admin"].includes(role.toLowerCase())) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  // 2. Check if user exists
  const existingUser = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);

  if (existingUser.rows.length > 0) {
    return res.status(400).json({ message: "User with this email already exists" });
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Insert user
  const insertQuery = `
    INSERT INTO users (name, email, password_hash, role, gender)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING user_id, name, email, role, gender, created_at
  `;

  const result = await pool.query(insertQuery, [
    name,
    email,
    hashedPassword,
    role,
    gender
  ]);

  const user = result.rows[0];

  // 5. Set token in cookie
  const { accessToken, refreshToken } = await generateToken(res, user.user_id, user.role);

  res.status(201).json({
    message: "User registered successfully",
    tokens: { accessToken, refreshToken },
    user
  });
});

// ----------------- LOGIN -----------------
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  const userQuery = `
    SELECT user_id, name, email, password_hash, role, gender
    FROM users WHERE email = $1
  `;
  const result = await pool.query(userQuery, [email]);

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const { accessToken, refreshToken } = await generateToken(res, user.user_id, user.role);

  res.status(200).json({
    message: "Login successful",
    tokens: { accessToken, refreshToken },
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      role: user.role,
    },
  });
});

// ----------------- LOGOUT -----------------
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.cookie("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(200).json({ message: "User logged out successfully" });
});
