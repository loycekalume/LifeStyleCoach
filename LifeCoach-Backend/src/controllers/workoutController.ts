import { Request, Response } from "express"
import pool from "../db.config"
import asyncHandler from './../middlewares/asyncHandler';

export const addWorkout = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { user_id,
            instructor_id,
            date,
            plan,
            status,
            notes
        } = req.body
        if (!user_id) {
            res.status(400).json({ message: "User_id required" })
        }

        const result = await pool.query(`INSERT INTO Workouts(
            user_id,
            instructor_id,
            date,
            plan,
            status,
            notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
            [user_id,
                instructor_id,
                date,
                plan,
                status,
                notes])

        res.status(200).json(result.rows[0])
    } catch (error) {
        console.error("Error adding workout:", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

export const getWorkout = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM Workouts ")

        res.status(200).json(result.rows)
    } catch (error) {
        console.error("Error retrieving Workout", error)
        res.status(500).json("Internal server error")
    }
})
export const getWorkoutById = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query("SELECT * FROM Workouts WHERE id=$1", [id])
        if (result.rows.length === 0) {
            res.status(400).json("WorkOut Not found")
            return
        }
        res.status(200).json(result.rows)

    } catch (error) {
        console.error("Error retrieving Workout", error)
        res.status(500).json("Internal server error")
    }
})

export const getWorkoutByUserId= asyncHandler(async(req:Request,res:Response)=>{
    try {
        const{user_id}=req.params
        const result=await pool.query("SELECT * FROM Workouts WHERE user_id=$1",[user_id])
        if(result.rows.length===0){
            res.status(400).json({message:"User has no workouts"})
            return
        }
        res.status(200).json({
            message:"User workouts retrieved",
            workouts:result.rows
        })
    } catch (error) {
        console.error("Error retrieving user workout", error)
        res.status(500).json("Internal server error") 
    }
})

export const deleteWorkout =asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query("DELETE FROM Workouts WHERE id=$1 RETURNING *", [id])

        if (result.rows.length === 0) {
            res.status(400).json("Workout Not Found")
            return
        }
        res.status(200).json({ message: "Workout deleted successfully" })
    } catch (error) {
        console.error("Error deleting Workout", error)
        res.status(500).json("Internal server error")
    }
})