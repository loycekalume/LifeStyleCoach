import { Response } from "express"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()


dotenv.config();

export const generateToken = (res: Response, userId: string, roleId: number) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!refreshSecret || !jwtSecret) {
        throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables");
    }

    try {
        // Generate tokens
        const accessToken = jwt.sign({ userId, roleId }, jwtSecret, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: "30d" });

        // Check environment
        const isProduction = process.env.NODE_ENV !== "development";

     
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: isProduction, // true on HTTPS (Render), false on localhost
            sameSite: isProduction ? "none" : "lax", // 'none' for cross-site in prod
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Error generating authentication tokens");
    }
};


