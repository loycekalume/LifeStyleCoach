import { Request, Response } from "express";
import pool from "../db.config";

export const startConversation = async (req: Request, res: Response) => {
    // Client ID comes from logged in user
    const client_id = (req as any).user.user_id; 
    // Instructor ID comes from the button click
    const { instructor_id } = req.body; 

    try {
        // 1. Check if conversation exists
        const checkQuery = `SELECT conversation_id FROM conversations WHERE client_id = $1 AND instructor_id = $2`;
        const existing = await pool.query(checkQuery, [client_id, instructor_id]);

        if (existing.rows.length > 0) {
            return res.json({ conversationId: existing.rows[0].conversation_id });
        }

        // 2. Create new conversation
        const insertQuery = `INSERT INTO conversations (client_id, instructor_id) VALUES ($1, $2) RETURNING conversation_id`;
        const newConv = await pool.query(insertQuery, [client_id, instructor_id]);

        res.json({ conversationId: newConv.rows[0].conversation_id });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};