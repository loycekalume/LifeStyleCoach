import { Request, Response } from "express"
import pool from "../db.config"
import asyncHandler
 from "../middlewares/asyncHandler"
export const addInstructor = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { user_id,
            specialization,
            coaching_mode,
            bio,
            available_locations } = req.body

         const user=await pool.query("SELECT *FROM users WHERE user_id=$1",[user_id])

        if(!user.rows.length || user.rows[0].role_id !==3){
            return res.status(400).json({ message: "User is not an instructor" });
        }

        const result = await pool.query
            (`INSERT INTO instructors(
            user_id,
            specialization,
            coaching_mode,
            bio,
            available_locations) 
            VALUES($1,$2,$3,$4,$5) RETURNING *`,
                [user_id,
                    specialization,
                    coaching_mode,
                    bio,
                    available_locations])

        res.status(200).json({
            message: "Instructor successfully added",
            instructor: result.rows[0]
        })

    } catch (error) {
        console.error("Error adding instructor:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

export const getInstructors =asyncHandler( async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM instructors ")

        res.status(200).json({
            message: "Instructors retrieved",
            instructor: result.rows
        })
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})
export const getInstuctorById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query("SELECT * FROM instructors WHERE instructor_id=$1 RETURNING *", [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "Instructor not found " })
            return
        }
        res.status(200).json(result.rows[0])
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

export const deleteInstuctor =asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query(`DELETE  FROM instructors where instructor_id=$1 RETURNING *`, [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "Instructor Not found" });
            return
        }
        res.status(200).json({ message: "instuctor successfully deleted" })
    } catch (error) {
        console.error("Error adding instuctor:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})