import { Response } from "express"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()
console.log("JWT SECRET:", process.env.JWT_SECRET)
console.log("REFRESH TOKEN:", process.env.REFRESH_TOKEN_SECRET)


export const generateToken = (res: Response, userId: string, roleId: number) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if(!refreshSecret || !jwtSecret){
        throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables")
    }

    try {
        //lets generate a short lived access token for 15mins
        
// sign(payload: string | Buffer | object, secretOrPrivateKey: null, options?: jwt.SignOptions & { algorithm: "none"; }): string
        const accessToken=jwt.sign({userId,roleId},jwtSecret,{expiresIn:"15m"})
        //lets generate a long lived refresh token
        const refreshToken=jwt.sign({userId},refreshSecret,{expiresIn:"30d"})


        //set Access token as HTTP-Only secure cookie
        res.cookie("access_token",accessToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV !=="development",
            sameSite:"strict",
            maxAge:15*60*1000,
        });

        res.cookie("refresh_token",refreshToken,{
            httpOnly:true,
            secure: process.env.NODE_ENV !== "development",
            sameSite:"strict",
            maxAge:30*24*60*60*1000 //30 days
        })

        return {accessToken,refreshToken}
    } catch (error) {
        console.error("Error generating JWT:",error)
        throw new Error("Error generating authentication tokens");
    }
}
