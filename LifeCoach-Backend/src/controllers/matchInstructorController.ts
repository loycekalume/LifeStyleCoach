import { Request, Response } from "express";
import pool from "../db.config";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes"; 

dotenv.config();

const groq = new Groq({ apiKey: process.env.IAI_API_KEY });

export const getMatchedInstructors = asyncHandler(async (req: UserRequest, res: Response) => {
    // 1. Get the logged-in user's ID
    const userId = req.user?.user_id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // 2. Fetch Client Profile
    const clientQuery = `
        SELECT 
            weight_goal, 
            health_conditions, 
            budget, 
            location, 
            gender
        FROM clients 
        WHERE user_id = $1
    `;
    const clientRes = await pool.query(clientQuery, [userId]);

    if (clientRes.rows.length === 0) {
        return res.status(404).json({ message: "Client profile not found. Please complete your profile first." });
    }
    const client = clientRes.rows[0];

    // 3. Fetch All Instructors
    const instructorQuery = `
        SELECT 
            i.instructor_id,
            u.name as full_name,
            i.specialization,
            i.coaching_mode,
            i.available_locations,
            i.years_of_experience,
            i.bio,
            i.website_url,
            i.profile_title
        FROM instructors i
        JOIN users u ON i.user_id = u.user_id
    `;
    const instructorsRes = await pool.query(instructorQuery);
    const instructors = instructorsRes.rows;

    if (instructors.length === 0) {
        return res.status(200).json({ message: "No instructors available yet", data: [] });
    }

    // 4. Construct AI Prompt
    const systemPrompt = `You are a fitness instructor matching expert. Your job is to find the BEST instructor matches for a client based on strict compatibility criteria.

**CLIENT PROFILE:**
- Fitness Goal: ${client.weight_goal}
- Health Conditions: ${client.health_conditions ? client.health_conditions.join(', ') : 'None'}
- Location: ${client.location}
- Budget: ${client.budget}

**INSTRUCTORS TO EVALUATE:**
${JSON.stringify(instructors.map(i => ({
    id: i.instructor_id,
    name: i.full_name,
    specialization: i.specialization,
    coaching_mode: i.coaching_mode,
    available_locations: i.available_locations,
    years_of_experience: i.years_of_experience,
    bio: i.bio
})), null, 2)}

**MATCHING RULES (APPLY STRICTLY):**

1. **Specialization Match (60 points max):**
   - EXACT match between instructor specialization and client fitness goal: 60 points
   - Partial/related match (e.g., "weight loss" specialization + "fat loss" goal): 40 points
   - Loosely related (e.g., "strength training" + "muscle gain"): 25 points
   - No match: 0 points

2. **Location & Coaching Mode Match (40 points max):**
   - COACHING MODE LOGIC:
     * If instructor coaching_mode is "Online" or "Remote": Award 40 points to this client (location irrelevant)
     * If instructor coaching_mode is "In-Person" or "Onsite": Client location MUST appear in instructor's available_locations array
       - Exact match: 40 points
       - Same region/state: 25 points
       - No match: 0 points
     * If instructor coaching_mode is "Both" or "Hybrid":
       - Location match: 40 points
       - No location match but can work online: 30 points

3. **Health Conditions Consideration (Bonus +10 points):**
   - If client has health conditions AND instructor bio mentions experience with rehab/therapy/injury/medical conditions: +10 bonus points
   - Otherwise: 0 bonus points

**SCORING:**
- Calculate total score (max 110 points with bonus)
- ONLY return matches with score ≥ 50
- Be STRICT - don't force matches that don't meet criteria

**OUTPUT FORMAT (STRICT JSON):**
{
    "matches": [
        { 
            "instructor_id": <number>,
            "match_score": <number 0-110>,
            "match_reason": "<2-3 sentence explanation from client's perspective using 'you' for client and 'this instructor/they' for instructor. Be specific about WHY this is a good match based on specialization and location/mode compatibility.>"
        }
    ]
}

**IMPORTANT:**
- Speak directly to the client (use "you")
- Be professional and encouraging
- Only include scores ≥ 50
- If no matches meet criteria, return empty matches array
- Be honest - don't inflate scores artificially
- Focus explanation on how instructor's specialization aligns with client's goal and location/mode works`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        const aiContent = completion.choices[0]?.message?.content || "{}";
        
        // Parse AI Response
        const firstBrace = aiContent.indexOf('{');
        const lastBrace = aiContent.lastIndexOf('}');
        
        let matches = [];

        if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonString = aiContent.substring(firstBrace, lastBrace + 1);
            const parsedData = JSON.parse(jsonString);
            
            matches = Array.isArray(parsedData) ? parsedData : (parsedData.matches || []);
        } else {
            matches = [];
        }

        // 5. Merge AI Results with Full DB Data
        const finalResults = matches
            .filter((match: any) => match.match_score > 50)
            .map((match: any) => {
                const originalInstructor = instructors.find(i => i.instructor_id === match.instructor_id);
                if (!originalInstructor) return null;
                
                return {
                    ...originalInstructor,
                    match_score: match.match_score,
                    match_reason: match.match_reason
                };
            })
            .filter(Boolean);

        // Sort by score descending
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