import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncHandler from "../asyncHandler";
import pool from "../../db/db.config";
import { UserRequest } from "../../utils/types/userTypes";

dotenv.config();

interface JwtPayload {
  userId: number;
  role:'user' | 'instructor' | 'admin';
}

export const protect = asyncHandler(async (req: UserRequest, res: Response, next: NextFunction) => {
  let token = req.cookies.access_token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("No token found in request");
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET not set in environment variables");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const userQuery = await pool.query(
      "SELECT user_id, name, email, role FROM users WHERE user_id = $1",
      [decoded.userId]
    );

    if (userQuery.rows.length === 0) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    req.user = userQuery.rows[0]; // Attach user to request
    next();
  } catch (error) {
    console.log("Token verification failed:", error);
    res.status(401).json({ message: "Token failed" });
  }
});

// Middleware to allow only specific roles
export const requireRole = (allowedRoles: string | string[]) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
      return;
    }

    next();
  };
};
