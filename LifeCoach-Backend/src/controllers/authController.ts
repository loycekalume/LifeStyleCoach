import asyncHandler from "../middlewares/asyncHandler";
import { Request, Response } from "express"
import pool from "../db.config"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/helpers/generateToken";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { name, email, contact, password_hash, role_id } = req.body;

        // Check if the user exists
        const userExists = await pool.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email]
        );
        if (userExists.rows.length > 0) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password_hash, salt);

        // Insert into users table (with contact added)
        const register = await pool.query(
            `INSERT INTO users(name, email, contact, password_hash, role_id) 
             VALUES($1, $2, $3, $4, $5) RETURNING *`,
            [name, email, contact, hashedPassword, role_id]
        );

        // Generate JWT token for user access
        generateToken(res, register.rows[0].user_id, role_id);

        res.status(201).json({
            message: "User registered successfully",
            user: register.rows[0],
        });
    } catch (error) {
        console.error("Error registering user", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password_hash } = req.body;

    const userQuery = await pool.query(
      `SELECT 
         u.user_id, 
         u.name, 
         u.email, 
         u.password_hash, 
         u.role_id, 
         u.profile_complete, 
         i.instructor_id
       FROM users u
       LEFT JOIN instructors i ON u.user_id = i.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userQuery.rows[0];

    const isMatch = await bcrypt.compare(password_hash, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const instructorId = user.instructor_id || null;

    // 🔥 GENERATE AND SET JWT TOKENS (this was missing!)
    const { accessToken, refreshToken } = generateToken(
      res, 
      user.user_id.toString(), // Convert to string as your function expects
      user.role_id
    );

    // Send successful login response
    res.status(200).json({
      message: "Login successfully",
      token: accessToken, // 👈 Optional: send token in response too
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        profile_complete: user.profile_complete,
        instructor_id: instructorId,
      },
    });
  } catch (error) {
    console.error("Error logging in user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    //invalidate the access Token and the refresh Token
    res.cookie("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0)
    })
    res.cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0)
    })
 res.status(200).json({message:"User successfully logged out"})
})