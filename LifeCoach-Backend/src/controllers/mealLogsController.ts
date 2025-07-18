import { Request, Response } from 'express'
import pool from "../db.config"
import asyncHandler from '../middlewares/asyncHandler'


export const addMealLog = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { user_id, meal_time, description, calories } = req.body

        const result = await pool.query(
            `INSERT INTO meal_logs(user_id,meal_time,description,calories)
        VALUES($1,$2,$3,$4) RETURNING *`, [user_id, meal_time, description, calories]);
        res.status(201).json({
            message: "MealLog added successfully",
            mealLog: result.rows[0]
        })
    } catch (error) {
        console.error("Error creating mealLog", error)
        res.status(500).json({
            message: "Internal server Error"
        })
    }
})

export const getMealLogs = asyncHandler(async(req:Request,res:Response)=>{
  try {
    const result= await pool.query('SELECT * FROM meal_logs ')
    res.status(200).json({
        message:"meal Logs retrieved",
        mealLogs:result.rows
    })
  } catch (error) {
    console.error("Error retrieving meal logs",error)
    res.status(500).json({message:"Internal server Error"})
  }
})

export const getMealLogById=asyncHandler(async(req:Request,res:Response)=>{
    try {
         const{id}=req.params
         const result= await pool.query('SELECT * FROM meal_logs WHERE log_id=$1',[id]) 
         if(result.rows.length ===0){
            res.status(400).json({message:"Meal Log not Found"})
                return
         }
            res.status(200).json({
                message:"Meal Log retrieved",
                mealLog:result.rows[0]
            })
            
         
    } catch (error) {
        console.error("Error retrieving meal logs",error)
    res.status(500).json({message:"Internal server Error"}) 
    }
 

})

export const getMealLogByUserId=asyncHandler(async(req:Request,res:Response)=>{
    try {
        const{user_id}=req.params
        const result=await pool.query(`SELECT * FROM meal_logs WHERE user_id=$1`,[user_id])
        if(result.rows.length ===0){
            res.status(400).json({message:"Meal log not found"})
            return
        }
        res.json(result.rows)
    } catch (error) {
        console.error("Error retrieving meal logs")
        res.status(500).json({message:"Internal Server Error"})
    }
})
export const deleteMealLog =asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query(`DELETE FROM meal_logs WHERE log_id=$1 RETURNING *`, [id])

        if (result.rows.length === 0) {
            res.status(400).json({ message: "Meal Log not found" })
            return
        }
        res.status(200).json({
            message: "Meal Log Deleted"
        })
    } catch (error) {
        console.error("Error deleting Meal log", error)
        res.status(500).json({ message: "Internal Server Error" })
    }

})