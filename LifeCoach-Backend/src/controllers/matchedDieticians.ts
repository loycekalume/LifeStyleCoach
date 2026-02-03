import { Request, Response } from "express";
import pool from "../db.config"; 
import asyncHandler from "../middlewares/asyncHandler";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });




export const getAiMatchedDieticiansForClient = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;

    // 1. Fetch Client Profile
    const clientQuery = `
        SELECT c.weight_goal, c.health_conditions, c.location, u.name
        FROM clients c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.user_id = $1
    `;
    const clientRes = await pool.query(clientQuery, [userId]);
    if (clientRes.rows.length === 0) return res.status(404).json({ message: "Profile not found." });
    
    const client = clientRes.rows[0];

    // ✅ FIX: Clean the PostgreSQL array format {Condition1,Condition2}
    const rawConditions = client.health_conditions;
    const clientConditions = Array.isArray(rawConditions) 
        ? rawConditions 
        : (typeof rawConditions === 'string' 
            ? rawConditions.replace(/{|}/g, '').split(',').map(s => s.trim()) 
            : []);

    // 2. Fetch Dieticians
    const dieticianQuery = `
        SELECT u.user_id, u.name, d.specialization, d.specializations, d.location
        FROM users u
        JOIN dieticians d ON u.user_id = d.user_id
        WHERE u.role_id = 4 AND u.active = true
    `;
    const dietRes = await pool.query(dieticianQuery);
    
    // ✅ FIX: Aggregate specializations so AI sees everything
    const dieticiansForAI = dietRes.rows.map(d => {
        const specs = [
            ...(Array.isArray(d.specializations) ? d.specializations : []),
            d.specialization
        ].filter(Boolean);

        return {
            user_id: d.user_id,
            name: d.name,
            specializations: specs.length > 0 ? specs : ["General Nutrition"],
            location: d.location || "Remote"
        };
    });

    const systemPrompt = `
You are a Clinical Matchmaker. Match this client to dieticians based STICKLY on health conditions and location (Remote is acceptable).

=== CLIENT ===
Name: ${client.name}
Conditions: ${clientConditions.join(", ")}
Location: ${client.location}

=== RULES ===
1. SPECIALIZATION (80 pts): If dietician specializes in ${clientConditions.join(", ")}, score 80. 
2. LOCATION (20 pts): 
   - If Dietician is in "${client.location}", score 20.
   - If Dietician is "Remote", score 15.
   - Otherwise, score 0.

=== CRITICAL INSTRUCTION ===
If a Dietician specializes in the client's condition, they MUST be included, even if they are Remote. Total score must be >= 50.

=== DIETICIANS ===
${JSON.stringify(dieticiansForAI)}

RETURN JSON: {"matches": [{"user_id": 1, "match_score": 95, "match_reason": "..."}]}`.trim();

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const aiContent = JSON.parse(completion.choices[0]?.message?.content || '{"matches":[]}');
        
        // Merge with full details for response
        const finalData = aiContent.matches
            .map((match: any) => {
                const d = dietRes.rows.find(diet => diet.user_id === match.user_id);
                return d ? { ...d, match_score: match.match_score, match_reason: match.match_reason } : null;
            })
            .filter((m: any) => m && m.match_score >= 50);

        res.json({ count: finalData.length, data: finalData });
    } catch (error) {
        res.status(500).json({ message: "Match error" });
    }
});