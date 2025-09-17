import { Request, Response } from "express"
import pool from "../db.config"
import bcrypt from 'bcrypt'
import asyncHandler from './../middlewares/asyncHandler';


export const addUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const {
            name,
            email,
            password_hash,
            contact,
            role_id
        } = req.body

        //check if email already exists
        const emailCheck = await pool.query("SELECT * FROM users WHERE email =$1", [email]);
        if (emailCheck.rows.length > 0) {
            res.status(400).json({ message: "Email already in use" })
            return

        }
        //Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password_hash, salt)

        //Insert new user
        const newUser = await pool.query(
            `INSERT INTO users( 
       name,
            email,
            password_hash,
            contact,
            role_id
    )VALUES( $1, $2, $3, $4, $5)
    RETURNING *`,
            [name,
            email,
            password_hash,
            contact,
            role_id]
        );

        res.status(201).json({
            message: "user successfully added",
            user: newUser.rows[0]
        })
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

export const getUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users`)

        

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error getting users:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`SELECT * FROM users WHERE user_id=$1`, [id]);

        if (result.rows.length === 0) {
            res.status(400).json({ message: "User not found" })
            return;
        }
        res.status(200).json(result.rows[0])
    } catch (error) {
        console.error("Error getting user", error)
        res.status(500).json({ messsage: "Internal server error" })
    }
})



export  const deleteUser= asyncHandler(async(req:Request,res:Response)=>{
    try {
        const {id}=req.params
        const result=await pool.query("DELETE  FROM users WHERE user_id=$1 RETURNING *",[id])

        if (result.rows.length ===0){
            res.status(400).json({message:"User Not found"})
            return
        }
        res.status(200).json({message:"User deleted"})
    } catch (error) {
        console.error("Error deleting user",error)
        res.status(500).json({message:"Internal server Error"})
    }
})

