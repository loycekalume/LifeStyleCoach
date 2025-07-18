import { Request, Response } from "express";
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler";

export const addChatHistory = asyncHandler(async(req: Request, res: Response) => {
    try {
        const { user_id, question, answer } = req.body
        const result = await pool.query(`INSERT INTO chathistory
        (user_id,question,answer)VALUES($1,$2,$3) RETURNING *`,
            [user_id, question, answer])
        res.status(200).json({
            message: "ChatHistory added successfully",
            history: result.rows[0]
        })
    } catch (error) {
        console.error("Error adding history",error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
    try {

        const result = await pool.query(`SELECT * FROM chathistory `)
        res.status(200).json({
            message: "chathistory Retrieved",
            posts: result.rows
        })
    } catch (error) {
        console.error("Error retrieving post")
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const getChatHistoryById=asyncHandler(async(req:Request,res:Response)=>{
    try {
   
    const{id}=req.params
    const result= await pool.query(`SELECT * FROM chathistory WHERE id=$1`,[id])
    if(result.rowCount ===0){
        res.status(400).json({message:"chathistory not found"})
    }
    res.status(200).json({
        message:"chathistory Retrieved",
        post:result.rows[0]
    })
         
    } catch (error) {
          console.error("Error retrieving post")
       res.status(500).json({message:"Internal Server Error"})  
    }
})
export const getChatHistoryByUserId=asyncHandler(async(req:Request,res:Response)=>{
    try {
   
    const{user_id}=req.params
    const result= await pool.query(`SELECT * FROM chathistory WHERE user_id=$1`,[user_id])
    if(result.rowCount ===0){
        res.status(400).json({message:"chathistory not found"})
    }
    res.status(200).json({
        message:"chathistory Retrieved",
        post:result.rows
    })
         
    } catch (error) {
          console.error("Error retrieving ChatHistory",error)
       res.status(500).json({message:"Internal Server Error"})  
    }
})
export const deleteChatHistory =asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query(`DELETE FROM chathistory WHERE id=$1`, [id])

        if (result.rowCount === 0) {
            res.status(400).json({ message: "ChatHistory not found" })
        }
        res.status(200).json({
            message: "ChatHistory deleted",
            post: result.rows[0]
        })
    } catch (error) {
        console.error("Error deleting ChatHistory")
        res.status(500).json({ message: "Internal Server Error" })
    }
})