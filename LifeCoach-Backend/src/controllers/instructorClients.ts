import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";

// ✅ NEW: Hire a Client
export const hireClient = async (req: Request, res: Response) => {
    const instructorId = (req as any).user.user_id;
    const { client_id } = req.body;

    if (!client_id) {
        return res.status(400).json({ message: "Client ID is required" });
    }

    try {
        const query = `
            INSERT INTO instructor_clients (instructor_id, client_id)
            VALUES ($1, $2)
            ON CONFLICT (instructor_id, client_id) DO NOTHING
            RETURNING *
        `;
        const result = await pool.query(query, [instructorId, client_id]);

        if (result.rows.length === 0) {
            return res.json({ message: "Client is already in your roster." });
        }

        res.json({ message: "Client hired successfully!", relationship: result.rows[0] });
    } catch (err) {
        console.error("Hire Client Error:", err);
        res.status(500).json({ message: "Server error hiring client" });
    }
};

// ✅ UPDATE: Get My Clients (Now fetches from instructor_clients table)
export const getInstructorClients = async (req: Request, res: Response) => {
    const instructorId = (req as any).user.user_id;

    try {
        const query = `
            SELECT 
                u.user_id, 
                u.name, 
                u.email, 
                c.weight_goal,
                c.location,
                ic.status,
                ic.hired_at,
                -- We still try to find their conversation ID to link back to chat
                (SELECT conversation_id FROM conversations 
                 WHERE instructor_id = $1 AND client_id = u.user_id LIMIT 1) as conversation_id
            FROM instructor_clients ic
            JOIN users u ON ic.client_id = u.user_id
            LEFT JOIN clients c ON u.user_id = c.user_id
            WHERE ic.instructor_id = $1
            ORDER BY ic.hired_at DESC
        `;

        const result = await pool.query(query, [instructorId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching roster:", err);
        res.status(500).json({ message: "Server error fetching clients" });
    }
};


// ... imports

// ✅ NEW: Get Leads (Active Conversations)
export const getInstructorLeads = async (req: Request, res: Response) => {
    const instructorId = (req as any).user.user_id;
    try {
        // Fetch clients who have a conversation but are NOT yet hired
        const query = `
            SELECT DISTINCT
                u.user_id, u.name, u.email, 
                c.weight_goal, c.location, c.age, c.gender, c.budget,
                conv.conversation_id,
                MAX(m.sent_at) as last_message
            FROM conversations conv
            JOIN users u ON conv.client_id = u.user_id
            LEFT JOIN clients c ON u.user_id = c.user_id
            LEFT JOIN messages m ON conv.conversation_id = m.conversation_id
            LEFT JOIN instructor_clients ic ON (ic.client_id = u.user_id AND ic.instructor_id = $1)
            WHERE conv.instructor_id = $1 AND ic.relationship_id IS NULL -- Exclude already hired
            GROUP BY u.user_id, c.weight_goal, c.location, c.age, c.gender, c.budget, conv.conversation_id
            ORDER BY last_message DESC NULLS LAST
        `;
        const result = await pool.query(query, [instructorId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching leads:", err);
        res.status(500).json({ message: "Server error fetching leads" });
    }
};

