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

    // Normalize client location for comparison
    const clientLocationNorm = client.location ? client.location.toLowerCase().trim() : "";

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
    let allInstructors = instructorsRes.rows;

    if (allInstructors.length === 0) {
        return res.status(200).json({ message: "No instructors available yet", data: [] });
    }

    // =================================================================================
    // 🚀 STEP 3.5: STRICT PRE-FILTERING (The Logic Fix)
    // We filter strictly in code before asking AI. This guarantees the location rule works.
    // =================================================================================
    const validInstructors = allInstructors.filter(inst => {
        const mode = inst.coaching_mode ? inst.coaching_mode.toLowerCase() : "";
        
        // Ensure locations is an array and normalize strings
        let instLocs = [];
        if (Array.isArray(inst.available_locations)) {
            instLocs = inst.available_locations.map((l: string) => l.toLowerCase().trim());
        } else if (typeof inst.available_locations === 'string') {
            // Handle Postgres array literal string format like "{Nairobi,Kisumu}" if raw query returns it
            instLocs = inst.available_locations.replace(/[{"}]/g, "").split(',').map(l => l.trim().toLowerCase());
        }

        const isOnline = mode.includes('remote') || mode.includes('online');
        const isHybrid = mode.includes('both') || mode.includes('hybrid');
        const isOnsite = mode.includes('onsite') || mode.includes('person');

        // RULE 1: If Online/Remote or Hybrid, they match EVERYONE (Location irrelevant)
        if (isOnline || isHybrid) return true;

        // RULE 2: If Strictly Onsite, they MUST match the client's location exactly
        if (isOnsite) {
            return instLocs.includes(clientLocationNorm);
        }

        return false; // Fallback
    });

    if (validInstructors.length === 0) {
        return res.status(200).json({ 
            message: "No instructors found matching your location or offering online coaching.", 
            data: [] 
        });
    }

    // 4. Construct AI Prompt with ONLY the Valid Instructors
    const systemPrompt = `You are a fitness instructor matching expert.
    
    **CLIENT PROFILE:**
    - Goal: ${client.weight_goal}
    - Location: ${client.location}
    - Health Conditions: ${client.health_conditions ? client.health_conditions.join(', ') : 'None'}

    **CANDIDATES (Already pre-filtered for location/mode availability):**
    ${JSON.stringify(validInstructors.map(i => ({
        id: i.instructor_id,
        name: i.full_name,
        specialization: i.specialization, // This is an Array or String
        bio: i.bio,
        coaching_mode: i.coaching_mode
    })), null, 2)}

    **YOUR TASK:**
    Score these candidates primarily on **Specialization Match**.

    **SCORING RULES:**
    1. **Specialization (0-100 pts):** - 90-100: Specialization explicitly targets the client's goal (e.g., Client wants "Weight Loss", Instructor does "Fat Loss/Weight Mgmt").
       - 70-89: Specialization is highly complementary (e.g., Client wants "Muscle", Instructor does "Strength & Conditioning").
       - 40-69: Specialization is somewhat related (e.g., Client wants "Weight Loss", Instructor does "Yoga/Pilates").
       - < 40: Mismatch.

    2. **Health Bonus (+10 pts):** Add points if instructor bio mentions rehab/medical handling IF client has conditions.

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "matches": [
            { 
                "instructor_id": <number>,
                "match_score": <number>,
                "match_reason": "<Speak to the client ('You'). Explain why this specific instructor fits their goal. Mention explicitly if they are Online or Local based on the data.>"
            }
        ]
    }
    `;

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
        }

        // 5. Merge AI Results with Full DB Data
        const finalResults = matches
            .filter((match: any) => match.match_score >= 50) // Filter weak specialization matches
            .map((match: any) => {
                const originalInstructor = validInstructors.find(i => i.instructor_id === match.instructor_id);
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