import { Request, Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes"; 

dotenv.config();

const groq = new Groq({ apiKey: process.env.IAI_API_KEY });



export const getMatchedInstructors = asyncHandler(async (req: Request, res: Response) => {
    // 1. Get Logged-in Instructor ID from Token
    const instructorUserId = (req as any).user.user_id;

    // 2. Fetch Instructor Profile (Specialization, Location, Mode, Bio)
    const instQuery = `
        SELECT specialization, available_locations, coaching_mode, bio 
        FROM instructors WHERE user_id = $1
    `;
    const instRes = await pool.query(instQuery, [instructorUserId]);

    if (instRes.rows.length === 0) {
        return res.status(404).json({ message: "Instructor profile not found." });
    }
    const instructor = instRes.rows[0];

    // 3. Fetch All Potential Clients (Limit 100 to ensure we catch enough candidates)
    const clientQuery = `
        SELECT 
            u.user_id, u.name, u.email,
            c.weight_goal, c.location, c.gender, c.age, 
            c.height, c.weight, c.budget
        FROM users u
        JOIN clients c ON u.user_id = c.user_id
        WHERE u.role_id = 5
        LIMIT 100
    `;
    const clientRes = await pool.query(clientQuery);
    const allClients = clientRes.rows;

    if (allClients.length === 0) {
        return res.status(200).json({ message: "No clients found in the system yet.", data: [] });
    }

    // =================================================================================
    // 🚀 STEP 4: STRICT CODE-LEVEL FILTERING (Location & Mode Logic)
    // =================================================================================
    
    // Normalize Instructor Mode & Locations
    const mode = instructor.coaching_mode ? instructor.coaching_mode.toLowerCase() : "";
    let instLocs: string[] = [];

    // Handle Postgres Array or String format safely
    if (Array.isArray(instructor.available_locations)) {
        instLocs = instructor.available_locations.map((l: string) => l.toLowerCase().trim());
    } else if (typeof instructor.available_locations === 'string') {
        instLocs = instructor.available_locations.replace(/[{"}]/g, "").split(',').map(l => l.trim().toLowerCase());
    }

    // Determine strict mode flags
    const isOnline = mode.includes('remote') || mode.includes('online');
    const isHybrid = mode.includes('both') || mode.includes('hybrid');
    const isOnsite = mode.includes('onsite') || mode.includes('person');

    // Filter Clients: Keep only those reachable by this instructor
    const validClients = allClients.filter(client => {
        // CASE A: If Instructor is Online or Hybrid -> They can coach ANYONE.
        if (isOnline || isHybrid) return true;

        // CASE B: If Instructor is strictly Onsite -> Client MUST match location.
        if (isOnsite) {
            const clientLoc = client.location ? client.location.toLowerCase().trim() : "";
            
            // Check if locations overlap (e.g. "Nairobi" inside "Westlands, Nairobi")
            const isLocationMatch = instLocs.some(loc => 
                clientLoc.includes(loc) || loc.includes(clientLoc)
            );
            return isLocationMatch;
        }

        return false; // Fallback if mode is undefined
    });

    if (validClients.length === 0) {
        return res.status(200).json({ 
            message: "No clients found matching your location or coaching mode.", 
            data: [] 
        });
    }

    // =================================================================================
    // 🚀 STEP 5: AI SCORING (Strict Specialization vs. Weight Goal)
    // =================================================================================
    
    const systemPrompt = `You are a fitness business expert matching clients to an instructor based PURELY on fitness goals.

    **INSTRUCTOR PROFILE:**
    - Specialization: ${instructor.specialization}
    - Bio: ${instructor.bio}

    **CANDIDATE CLIENTS:**
    ${JSON.stringify(validClients.map(c => ({
        id: c.user_id,
        name: c.name,
        goal: c.weight_goal, // Crucial Field
        budget: c.budget
    })), null, 2)}

    **YOUR TASK:**
    Score each client from 0-100 based on how well the Instructor's Specialization matches the Client's Goal.

    **SCORING RULES:**
    - **90-100 (Perfect Match):** Instructor specializes exactly in what the client wants.
      (e.g., Instructor: "Hypertrophy/Bodybuilding" -> Client: "Muscle Gain")
      (e.g., Instructor: "Weight Management" -> Client: "Weight Loss")
    - **70-89 (Strong Match):** Specialization is highly relevant.
      (e.g., Instructor: "General Fitness" -> Client: "Weight Loss")
    - **50-69 (Possible Match):** Loosely related.
    - **< 50 (Mismatch):** Completely unrelated fields (e.g., Yoga vs. Powerlifting).

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "matches": [
            { 
                "user_id": <number>,
                "match_score": <number>,
                "match_reason": "<Short explanation for the instructor. Example: 'Client wants muscle gain, which aligns perfectly with your Bodybuilding specialization.'>"
            }
        ]
    }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1, // Keep low for consistent results
            response_format: { type: "json_object" },
        });

        // Parse AI Response
        const aiContent = completion.choices[0]?.message?.content || "{}";
        const firstBrace = aiContent.indexOf('{');
        const lastBrace = aiContent.lastIndexOf('}');
        
        let aiMatches = [];
        if (firstBrace !== -1 && lastBrace !== -1) {
             const jsonString = aiContent.substring(firstBrace, lastBrace + 1);
             const parsedData = JSON.parse(jsonString);
             aiMatches = parsedData.matches || [];
        }

        // 6. Merge AI Scores back into Full Client Objects
        const finalResults = aiMatches
            .filter((match: any) => match.match_score >= 50) // Filter out weak matches
            .map((match: any) => {
                const originalClient = validClients.find(c => c.user_id === match.user_id);
                if (!originalClient) return null;

                return {
                    ...originalClient,
                    match_score: match.match_score,
                    match_reason: match.match_reason 
                };
            })
            .filter(Boolean);

        // Sort by score descending (Best matches first)
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);

        res.status(200).json({
            message: `Found ${finalResults.length} qualified matches`,
            data: finalResults
        });

    } catch (error) {
        console.error("AI Matching Error:", error);
        res.status(500).json({
            message: "AI matching service unavailable",
            data: []
        });
    }
});