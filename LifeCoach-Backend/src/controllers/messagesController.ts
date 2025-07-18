import { Request, Response } from "express"
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler"

export const addMessage = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { sender_id, receiver_id, content } = req.body
        const result = await pool.query(`
            INSERT INTO Messages(sender_id,receiver_id,content)VALUES($1,$2,$3) RETURNING *`,
            [sender_id, receiver_id, content])

        res.status(200).json({
            message: "Message Added successfully",
            text: result.rows[0]
        })
    } catch (error) {
        console.error("Error Adding message", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
)
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT *FROM Messages")
        res.status(200).json({
            message: "Messages retrieved",
            text: result.rows
        })
    } catch (error) {
        console.error("Error retrieving messages", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})

export const getMessageById =async(req:Request,res:Response) =>{
    try {
    const {id}=req.params
    const result= await pool.query(`SELECT * FROM Messages WHERE id=$1`,[id])
    if(result.rowCount===0){
        res.status(400).json({message:"Message not found"})
    }
    res.status(200).json({
        message:"Message retrieved",
        text:result.rows[0]
    })
       } catch (error) {
          console.error("Error retrieving message", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
export const getMessageByUserId = asyncHandler(async(req:Request,res:Response) =>{
    try {
    const {user_id}=req.params
    const result= await pool.query(`SELECT * FROM Messages WHERE sender_ID=$1 OR receiver_id=$1`,[user_id])
    if(result.rowCount===0){
        res.status(400).json({message:"Message not found"})
    }
    res.status(200).json({
        message:" Users Messages retrieved",
        text:result.rows
    })
       } catch (error) {
          console.error("Error retrieving message", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const deleteMessage =asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query("DELETE FROM Messages WHERE ID=$1 RETURNING *", [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "Message not found" })
            return
        }
        res.status(200).json({ message: "message deleted successfully" })
    } catch (error) {
        console.error("Error deleting message", error)
        res.status(500).json({ message: "Internal Server Error" })
    }

})