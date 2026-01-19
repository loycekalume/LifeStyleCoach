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
            gender, 
            age 
        FROM clients 
        WHERE user_id = $1
    `;
    const clientRes = await pool.query(clientQuery, [userId]);

    if (clientRes.rows.length === 0) {
        return res.status(404).json({ message: "Client profile not found. Please complete your profile first." });
    }
    const client = clientRes.rows[0];

    // 3. Fetch All Instructors (with Name from Users table)
    // We join with 'users' to get the actual name of the instructor
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

    // 4. Construct the AI Prompt
    // We specifically ask the AI to handle the "Location" logic (Onsite vs Remote)
    // ... inside getMatchedInstructors ...

    // UPDATE THE PROMPT OUTPUT INSTRUCTION
    // We ask for an object { "matches": [] } because it is more stable in JSON mode than a raw array.
    const systemPrompt = `
        You are an expert AI Fitness Consultant. 
        Your task is to match a Client to the best Instructors based on the data provided.

        === CLIENT PROFILE ===
        Goal: ${client.weight_goal}
        Health Conditions: ${client.health_conditions ? client.health_conditions.join(', ') : 'None'}
        Location: ${client.location}
        Budget: ${client.budget}
        Age/Gender: ${client.age} / ${client.gender}

        === INSTRUCTOR LIST ===
        ${JSON.stringify(instructors.map(i => ({
            id: i.instructor_id,
            name: i.full_name,
            specialization: i.specialization,
            mode: i.coaching_mode,
            locations: i.available_locations,
            bio: i.bio,
            exp: i.years_of_experience
        })))}

        === MATCHING RULES ===
        1. **Specialization Match:** Align instructor specialization with client goal.
        2. **Location Logic:** If 'onsite', instructor locations MUST include client location.
        3. **Condition Match:** Prioritize rehab/therapy exp for health issues.

        === OUTPUT FORMAT ===
        Return a valid JSON object with a key "matches" containing the array.
        Example:
        {
            "matches": [
                { 
                    "instructor_id": 123, 
                    "match_score": 95, 
                    "match_reason": "Reason here" 
                }
            ]
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            
            // FIX 1: Force JSON mode (Supported by Llama 3.1 on Groq)
            response_format: { type: "json_object" }, 
        });

        const aiContent = completion.choices[0]?.message?.content || "{}";
        
        // FIX 2: Robust Extraction
        // Even with JSON mode, we safeguard against any stray text by finding the first '{' and last '}'
        const firstBrace = aiContent.indexOf('{');
        const lastBrace = aiContent.lastIndexOf('}');
        
        let matches = [];

        if (firstBrace !== -1 && lastBrace !== -1) {
            const jsonString = aiContent.substring(firstBrace, lastBrace + 1);
            const parsedData = JSON.parse(jsonString);
            
            // Handle cases where AI returns { "matches": [...] } or just [...]
            matches = Array.isArray(parsedData) ? parsedData : (parsedData.matches || []);
        } else {
             // Fallback if parsing fails totally
            matches = []; 
        }

        // 5. Merge AI Results with Full DB Data
        const finalResults = matches.map((match: any) => {
            const originalInstructor = instructors.find(i => i.instructor_id === match.instructor_id);
            if (!originalInstructor) return null;
            
            return {
                ...originalInstructor,
                match_score: match.match_score,
                match_reason: match.match_reason
            };
        }).filter(Boolean);

        // Sort by score descending
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);

        res.status(200).json({
            message: "Matches found",
            data: finalResults
        });

    } catch (error) {
        console.error("AI Matching Error:", error);
        res.status(200).json({
            message: "AI matching unavailable, showing all instructors",
            data: instructors.map(i => ({ ...i, match_score: 0, match_reason: "AI unavailable" }))
        });
    }
});