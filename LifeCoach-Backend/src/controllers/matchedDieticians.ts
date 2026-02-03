import { Request, Response } from "express";
import pool from "../db.config"; 
import asyncHandler from "../middlewares/asyncHandler";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });




export const getAiMatchedDieticiansForClient = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;

    const clientQuery = `
        SELECT c.weight_goal, c.health_conditions, c.allergies, c.location, u.name
        FROM clients c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.user_id = $1
    `;
    const clientRes = await pool.query(clientQuery, [userId]);
    if (clientRes.rows.length === 0) return res.status(404).json({ message: "Profile not found." });
    
    const client = clientRes.rows[0];
    const clientConditions = Array.isArray(client.health_conditions) ? client.health_conditions : [];

    const dieticianQuery = `
        SELECT u.user_id, u.name, d.specialization, d.specializations, d.years_of_experience, d.location
        FROM users u
        JOIN dieticians d ON u.user_id = d.user_id
        WHERE u.role_id = 4 AND u.active = true
        LIMIT 50
    `;
    const dietRes = await pool.query(dieticianQuery);
    const dieticians = dietRes.rows;

    const dieticiansForAI = dieticians.map(d => ({
        user_id: d.user_id,
        name: d.name,
        specializations: Array.isArray(d.specializations) ? d.specializations : [d.specialization].filter(Boolean),
        experience: d.years_of_experience || 0,
        location: d.location || "Remote"
    }));

    const systemPrompt = `
You are a Clinical Nutrition Matchmaker. Your goal is to find the best dietician for a client.

=== CLIENT PROFILE ===
Conditions: ${clientConditions.length > 0 ? clientConditions.join(', ') : "General Wellness"}
Goal: ${client.weight_goal}
Location: ${client.location}

=== DIETICIAN LIST ===
${JSON.stringify(dieticiansForAI, null, 2)}

=== SCORING MATRIX (STRICT ADHERENCE REQUIRED) ===

1. CLINICAL MATCH (60 Points Max):
   - EXACT MATCH: (e.g., Client has "Diabetes", Dietician lists "Diabetes") = 60 points.
   - SEMANTIC/FUZZY MATCH: (e.g., "PCOS" vs "Hormonal Health", "Diabetes" vs "Metabolic Health/Endocrinology", "Hypertension" vs "Cardiovascular Nutrition") = 50-55 points.
   - PARTIAL MATCH: (e.g., Client has 3 conditions, Dietician specializes in 1) = 30 points.
   - NO MATCH: 0 points. 

2. EXPERIENCE (30 Points Max):
   - 10+ years: 30 points.
   - 5-9 years: 20 points.
   - 2-4 years: 10 points.

3. LOCATION (10 Points Max):
   - Same location: 10 points.
   - Remote: 5 points.

=== RULES ===
- If a client has medical conditions, ONLY return dieticians with at least a PARTIAL CLINICAL MATCH.
- THRESHOLD: Only return matches with a total score of 50 or higher.
- Write "match_reason" in the 2nd person (e.g., "This dietician is a great match for your ${clientConditions[0] || 'needs'}...").

OUTPUT ONLY VALID JSON:
{
    "matches": [
        { "user_id": 123, "match_score": 85, "match_reason": "..." }
    ]
}
`.trim();

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1, // Keep it low for deterministic scoring
            response_format: { type: "json_object" }
        });

        const aiContent = JSON.parse(completion.choices[0]?.message?.content || '{"matches":[]}');
        
        const finalData = aiContent.matches.map((match: any) => {
            const d = dieticians.find(diet => diet.user_id === match.user_id);
            return d ? { ...d, match_score: match.match_score, match_reason: match.match_reason } : null;
        }).filter(Boolean);

        res.json({ count: finalData.length, data: finalData });
    } catch (error) {
        res.status(500).json({ message: "Matching service error" });
    }
});