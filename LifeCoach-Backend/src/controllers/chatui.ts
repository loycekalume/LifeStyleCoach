import { Request, Response } from "express";
import pool from "../db.config";

export const startConversation = async (req: Request, res: Response) => {
    const myId = (req as any).user.user_id;
    let { target_user_id, instructor_id, dietician_id } = req.body;

    // 1. Resolve profile IDs to user IDs if needed
    if (!target_user_id) {
        try {
            if (instructor_id) {
                const r = await pool.query(`SELECT user_id FROM instructors WHERE instructor_id = $1`, [instructor_id]);
                if (r.rows.length) target_user_id = r.rows[0].user_id;
            } else if (dietician_id) {
                const r = await pool.query(`SELECT user_id FROM dieticians WHERE dietician_id = $1`, [dietician_id]);
                if (r.rows.length) target_user_id = r.rows[0].user_id;
            }
        } catch (err) { 
            console.error("Lookup error:", err); 
        }
    }

    // Legacy support
    if (!target_user_id && req.body.client_id) target_user_id = req.body.client_id;
    if (!target_user_id) return res.status(400).json({ message: "Target user ID required" });

    try {
        // 2. Identify Roles for both users
        const roleQuery = `
            SELECT u.user_id, r.role_name 
            FROM users u JOIN user_roles r ON u.role_id = r.role_id 
            WHERE u.user_id IN ($1, $2)
        `;
        const roleRes = await pool.query(roleQuery, [myId, target_user_id]);
        
        const userA = roleRes.rows.find((u: any) => u.user_id === myId);
        const userB = roleRes.rows.find((u: any) => u.user_id === target_user_id);

        if (!userA || !userB) return res.status(404).json({ message: "User not found" });

        // ✅ FIX: Variables to hold the final IDs
        let finalClientId = null;      // user_id of the client
        let finalInstructorId = null;  // user_id of the instructor (NOT instructor_id!)
        let finalDieticianId = null;   // dietician_id from dieticians table

        // Helper to process a user based on their role
        const processUser = async (user: any) => {
            const role = (user.role_name || "").toLowerCase().trim();
            
            if (role === 'client') {
                // ✅ Client ID is the user_id
                finalClientId = user.user_id;
            } 
            else if (role === 'instructor') {
                // ✅ FIX: Instructor ID in conversations table is the user_id, NOT instructor_id
                finalInstructorId = user.user_id;
            } 
            else if (role === 'dietician') {
                // ✅ Dietician ID must be fetched from dieticians table
                const r = await pool.query(`SELECT dietician_id FROM dieticians WHERE user_id = $1`, [user.user_id]);
                if (r.rows.length > 0) finalDieticianId = r.rows[0].dietician_id;
            }
        };

        // Process both users
        await processUser(userA);
        await processUser(userB);

        // Fallback: If roles are ambiguous, treat initiator as client
        if (!finalClientId && !finalInstructorId && !finalDieticianId) {
             finalClientId = myId;
        }

        // Safety Check
        if (!finalInstructorId && !finalDieticianId) {
            return res.status(400).json({ 
                message: "Chat must include at least one Professional (Instructor or Dietician)." 
            });
        }

        console.log(`✨ Chat IDs -> Client: ${finalClientId}, Instructor: ${finalInstructorId}, Dietician: ${finalDieticianId}`);

        // 3. Check for Existing Conversation
        const checkQuery = `
            SELECT conversation_id FROM conversations 
            WHERE (client_id = $1 AND instructor_id = $2)
               OR (client_id = $1 AND dietician_id = $3)
            LIMIT 1
        `;
        const existing = await pool.query(checkQuery, [finalClientId, finalInstructorId, finalDieticianId]);

        if (existing.rows.length > 0) {
            return res.json({ conversationId: existing.rows[0].conversation_id });
        }

        // 4. Create New Conversation
        const insertQuery = `
            INSERT INTO conversations (client_id, instructor_id, dietician_id) 
            VALUES ($1, $2, $3) 
            RETURNING conversation_id
        `;
        const newConv = await pool.query(insertQuery, [finalClientId, finalInstructorId, finalDieticianId]);

        res.json({ conversationId: newConv.rows[0].conversation_id });

    } catch (err) {
        console.error("Start Chat Error:", err);
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ message: "Server Error", detail: message });
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
                c.dietician_id,
                c.created_at,
                
                -- 1. Determine ROLE
                CASE 
                    WHEN c.client_id = $1 THEN 
                        CASE 
                            WHEN c.instructor_id IS NOT NULL THEN 'Instructor' 
                            ELSE 'Dietician' 
                        END
                    ELSE 'Client' 
                END as other_person_role,

                -- 2. Determine NAME (FIXED!)
                CASE 
                    WHEN c.client_id = $1 THEN 
                        -- I am the client, get the instructor or dietician name
                        COALESCE(instructor_user.name, dietician_user.name, 'Unknown User')
                    ELSE 
                        -- I am the instructor/dietician, get the client name
                        COALESCE(client_user.name, 'Unknown User')
                END as other_person_name,

                -- 3. Determine ID
                CASE 
                    WHEN c.client_id = $1 THEN 
                        COALESCE(c.instructor_id, dietician_data.user_id)
                    ELSE 
                        c.client_id
                END as other_person_id,

                -- 4. Last Message info
                (
                    SELECT content 
                    FROM messages m 
                    WHERE m.conversation_id = c.conversation_id 
                    ORDER BY m.sent_at DESC 
                    LIMIT 1
                ) as last_message,
                
                (
                    SELECT sent_at 
                    FROM messages m 
                    WHERE m.conversation_id = c.conversation_id 
                    ORDER BY m.sent_at DESC 
                    LIMIT 1
                ) as last_message_time,
                
                (
                    SELECT COUNT(*)::int 
                    FROM messages m 
                    WHERE m.conversation_id = c.conversation_id 
                      AND m.sender_id != $1 
                      AND m.is_read = FALSE
                ) as unread_count

            FROM conversations c
            
            -- ✅ FIX: Join client directly (client_id IS user_id)
            LEFT JOIN users client_user ON c.client_id = client_user.user_id
            
            -- ✅ FIX: Join instructor directly (instructor_id IS user_id, NOT from instructors table)
            LEFT JOIN users instructor_user ON c.instructor_id = instructor_user.user_id
            
            -- ✅ FIX: Join dietician through dieticians table (dietician_id IS from dieticians table)
            LEFT JOIN dieticians dietician_data ON c.dietician_id = dietician_data.dietician_id
            LEFT JOIN users dietician_user ON dietician_data.user_id = dietician_user.user_id

            -- Filter: Show conversations where I'm involved
            WHERE c.client_id = $1 
               OR c.instructor_id = $1 
               OR dietician_data.user_id = $1
            
            ORDER BY last_message_time DESC NULLS LAST
        `;

        const result = await pool.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Error fetching conversations" });
    }
};