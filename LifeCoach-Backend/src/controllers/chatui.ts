import { Request, Response } from "express";
import pool from "../db.config";

export const startConversation = async (req: Request, res: Response) => {
    const myId = (req as any).user.user_id;
    let { target_user_id } = req.body;

    // Look up user_id from instructor_id
    if (!target_user_id && req.body.instructor_id) {
        try {
            const query = `SELECT user_id FROM instructors WHERE instructor_id = $1`;
            const result = await pool.query(query, [req.body.instructor_id]);
            
            if (result.rows.length > 0) {
                target_user_id = result.rows[0].user_id;
            }
        } catch (err) {
            console.error("Error looking up instructor:", err);
        }
    }

    // Use client_id directly as user_id
    if (!target_user_id && req.body.client_id) {
        target_user_id = req.body.client_id;
    }

    if (!target_user_id) {
        return res.status(400).json({ message: "Target user ID is required" });
    }

    try {
        // A. Determine Roles
        const roleQuery = `
            SELECT u.user_id, r.role_name 
            FROM users u 
            JOIN user_roles r ON u.role_id = r.role_id 
            WHERE u.user_id IN ($1, $2)
        `;
        const roleRes = await pool.query(roleQuery, [myId, target_user_id]);
        
        if (roleRes.rows.length < 2) {
            return res.status(404).json({ message: "One or both users not found" });
        }

        const userA = roleRes.rows.find((u: any) => u.user_id === myId);
        const userB = roleRes.rows.find((u: any) => u.user_id === target_user_id);

        let clientId, instructorId;

        if (userA.role_name === 'Client') {
            clientId = myId;
            instructorId = target_user_id;
        } else if (userB.role_name === 'Client') {
            clientId = target_user_id;
            instructorId = myId;
        } else {
            // Fallback: treat the initiator as client
            clientId = myId;
            instructorId = target_user_id;
        }

        // ✅ B. Check for Existing Conversation (IMPROVED - checks both ways)
        const checkQuery = `
            SELECT conversation_id 
            FROM conversations 
            WHERE (client_id = $1 AND instructor_id = $2)
               OR (client_id = $2 AND instructor_id = $1)
            LIMIT 1
        `;
        const existing = await pool.query(checkQuery, [clientId, instructorId]);

        if (existing.rows.length > 0) {
            console.log(`✅ Found existing conversation: ${existing.rows[0].conversation_id}`);
            return res.json({ conversationId: existing.rows[0].conversation_id });
        }

        // C. Create New Conversation
        console.log(`✨ Creating new conversation between client ${clientId} and instructor ${instructorId}`);
        const insertQuery = `
            INSERT INTO conversations (client_id, instructor_id) 
            VALUES ($1, $2) 
            RETURNING conversation_id
        `;
        const newConv = await pool.query(insertQuery, [clientId, instructorId]);

        res.json({ conversationId: newConv.rows[0].conversation_id });

    } catch (err) {
        console.error("Start Chat Error:", err);
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ message: "Server Error", error: message });
    }
};
// 2. Fetch Chat History
export const getChatHistory = async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    try {
        const query = `
            SELECT 
                m.message_id,
                m.sender_id,
                m.content,
                m.sent_at, -- Ensure your DB has sent_at 
                u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.conversation_id = $1
            ORDER BY m.sent_at_at ASC
        `;
        const result = await pool.query(query, [conversationId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching history");
    }
};

export const getChatuiHistory = async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        return res.status(400).json({ message: "Conversation ID is required" });
    }

    try {
        // Fetch messages and join with users table to get the sender's name
        // We order by 'sent_at' (or 'created_at') ASCENDING so oldest messages are at the top
        const query = `
            SELECT 
                m.message_id,
                m.conversation_id,
                m.sender_id,
                m.content,
                m.is_read,
                m.sent_at,   -- NOTE: Check your DB column name. It might be 'created_at' depending on your CREATE TABLE SQL.
                u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.conversation_id = $1
            ORDER BY m.sent_at ASC
        `;

        const result = await pool.query(query, [conversationId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Server error fetching messages" });
    }
};

// chatui.ts - Add this controller

export const markMessagesAsRead = async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = (req as any).user.user_id;

    if (!conversationId) {
        return res.status(400).json({ message: "Conversation ID is required" });
    }

    try {
        // Mark all messages in this conversation as read
        // Only mark messages where:
        // 1. They're in this conversation
        // 2. They were NOT sent by the current user
        // 3. They're currently unread
        await pool.query(
            `UPDATE messages 
             SET is_read = TRUE 
             WHERE conversation_id = $1 
               AND sender_id != $2 
               AND is_read = FALSE`,
            [conversationId, userId]
        );

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ message: "Error updating messages" });
    }
};

// chatui.ts - Add this if you don't have it

// chatui.ts - Fix the getUserConversations function

// chatui.ts - Fix getUserConversations to match your table schema

export const getUserConversations = async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;

    try {
        const query = `
            SELECT 
                c.conversation_id,
                c.client_id,
                c.instructor_id,
                c.created_at,
                -- Get the OTHER person's details with COALESCE for safety
                COALESCE(
                    CASE 
                        WHEN c.client_id = $1 THEN i_user.name
                        ELSE c_user.name
                    END,
                    'Unknown User'
                ) as other_person_name,
                CASE 
                    WHEN c.client_id = $1 THEN i_user.user_id
                    ELSE c_user.user_id
                END as other_person_id,
                -- Get last message
                COALESCE(
                    (
                        SELECT content 
                        FROM messages m 
                        WHERE m.conversation_id = c.conversation_id 
                        ORDER BY m.sent_at DESC 
                        LIMIT 1
                    ),
                    'No messages yet'
                ) as last_message,
                -- Get last message time - CHANGED TO sent_at
                (
                    SELECT sent_at 
                    FROM messages m 
                    WHERE m.conversation_id = c.conversation_id 
                    ORDER BY m.sent_at DESC 
                    LIMIT 1
                ) as last_message_time,
                -- Count unread messages
                COALESCE(
                    (
                        SELECT COUNT(*)::int
                        FROM messages m 
                        WHERE m.conversation_id = c.conversation_id 
                          AND m.sender_id != $1 
                          AND m.is_read = FALSE
                    ),
                    0
                ) as unread_count
            FROM conversations c
            LEFT JOIN users c_user ON c.client_id = c_user.user_id
            LEFT JOIN users i_user ON c.instructor_id = i_user.user_id
            WHERE c.client_id = $1 OR c.instructor_id = $1
            ORDER BY last_message_time DESC NULLS LAST
        `;

        const result = await pool.query(query, [userId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        const errMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: "Error fetching conversations", error: errMsg });
    }
};