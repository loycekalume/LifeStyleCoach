import {Request,Response} from 'express'
import pool from "../db.config"
import asyncHandler from '../middlewares/asyncHandler'

export const addProgressLog= asyncHandler(async(req:Request,res:Response)=>{
    try {
    const{user_id,
        date,
        weight,
        workout_done,
        meals_logged,
        current_streak
    }=req.body
    const result=await pool.query(`INSERT INTO ProgressLogs(
        user_id,
        date,
        weight,
        workout_done,
        meals_logged,
        current_streak)VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
        [user_id,
        date,
        weight,
        workout_done,
        meals_logged,
        current_streak])
    res.status(200).json({
        message:"ProgressLog recorded successfully",
        log:result.rows[0]
    })

} catch (error) {
       console.error("Error recording log",error) 
       res.status(500).json({message:"Internal Server Error"})
    }

})

export const getLogs= asyncHandler(async(req:Request,res:Response)=>{
    try {
        const result=await pool.query("SELECT * FROM ProgressLogs")
        res.status(200).json({
            message:"ProgressLogs retrieved",
            logs:result.rows
        
        })
    } catch (error) {
        console.error("Error retrieving logs",error) 
       res.status(500).json({message:"Internal Server Error"})
    }
    })
export const getLogByUserId = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query("SELECT * FROM ProgressLogs WHERE user_id=$1", [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Logs not found", logs: [] });
    }

    res.status(200).json({
      message: "User logs retrieved",
      logs: result.rows // <-- match frontend expectation
    });
  } catch (error) {
    console.error("Error retrieving logs", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


export const getLogById =asyncHandler(async(req:Request,res:Response)=>{
    try {
        const{id}=req.params
        const result=await pool.query("SELECT * FROM ProgressLogs WHERE id=$1",[id])
        if(result.rows.length ===0){
            res.status(400).json({message:"Log not Found"})
        }
        res.status(400).json({
            message:"log retrieved",
            log:result.rows[0]
        })
    } catch (error) {
         console.error("Error retrieving logs",error) 
       res.status(500).json({message:"Internal Server Error"})
    }
})

export const deleteLog= asyncHandler(async(req:Request,res:Response)=>{
    try {
        const {id}=req.params
        const result=await pool.query("DELETE FROM ProgressLogs WHERE id=$1 RETURNING *",[id])

        if(result.rows.length===0){
            res.json(400).json({message:"Log not found"})
        }
        res.status(200).json({
            message:"Log deleted",
            log:result.rows[0]
        })
    } catch (error) {
        
    }
})