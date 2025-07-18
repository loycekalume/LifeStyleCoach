import { Request, Response } from "express";
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler";

export const addNotification = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { user_id, type, title, message, is_read } = req.body
        const result = await pool.query(`INSERT INTO Notifications(user_id,type,title,message,is_read)
            VALUES($1,$2,$3,$4,$5) RETURNING *`, [user_id, type, title, message, is_read])
        res.status(200).json({
            message: "Notification added",
            notification: result.rows
        })

    } catch (error) {
        console.error("Error adding Notification", error)
        res.status(500).json({ message: "Internal server Error" })
    }
})
export const getAllNotificationsForUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
})

export const getAllNotifications=asyncHandler(async(req:Request,res:Response)=>{
    try {
        const result=await pool.query("SELECT * FROM Notifications ")
        res.status(200).json({
            message:"Notifications Retrieved",
            notify:result.rows
        })
    } catch (error) {
          console.error("Error retrieving Notification", error)
        res.status(500).json({ message: "Internal server Error" })
    }
})
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE Notifications SET is_read = true WHERE id = $1',
      [id]
    );
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
})
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    try {
    const { id } = req.params
    const result=await pool.query("DELETE FROM Notifications where id=$1 RETURNING *",[id])

    res.status(200).json({
        message:"Notification deleted",
        notify:result.rows[0]
    })
} catch (error) {
         console.error("Error adding Notification", error)
        res.status(500).json({ message: "Internal server Error" })
    }
})