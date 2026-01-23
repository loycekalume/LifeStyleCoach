import { Request, Response } from "express";
import pool from "../db.config"; 
import asyncHandler from "../middlewares/asyncHandler";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });




export const getAiMatchedDieticiansForClient = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;
    console.log(`[DEBUG] Starting Match for Client ID: ${userId}`);

    // 1. Fetch Client Profile
    const clientQuery = `
        SELECT c.weight_goal, c.health_conditions, c.allergies, c.budget, c.location, 
               c.age, c.gender, u.name
        FROM clients c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.user_id = $1
    `;
    const clientRes = await pool.query(clientQuery, [userId]);
    
    if (clientRes.rows.length === 0) {
        console.log("[DEBUG] Client profile not found");
        return res.status(404).json({ message: "Client profile not found." });
    }
    const client = clientRes.rows[0];
    console.log(`[DEBUG] Client Found: ${client.name}, Conditions: ${client.health_conditions}`);

    // 2. Fetch Potential Dieticians (WITH specializations array!)
    const dieticianQuery = `
        SELECT 
            u.user_id, u.name, 
            d.dietician_id, d.specialization, d.specializations, d.years_of_experience, 
            d.location, d.clinic_name
        FROM users u
        JOIN dieticians d ON u.user_id = d.user_id
        WHERE u.role_id = 4
        LIMIT 30
    `;
    const dietRes = await pool.query(dieticianQuery);
    const dieticians = dietRes.rows;

    console.log(`[DEBUG] Dieticians Found in DB: ${dieticians.length}`);

    if (dieticians.length === 0) {
        console.log("[DEBUG] No Dieticians found. Check 'role_id' or 'dieticians' table.");
        return res.status(200).json({ data: [] });
    }

   
    
    const systemPrompt = `
        You are an expert Clinical Nutrition Matchmaker.
        Match this Client to the SAFEST and most qualified Dieticians.

        === CLIENT PROFILE ===
        Name: ${client.name}
        Age: ${client.age || "Not specified"}
        Goal: ${client.weight_goal || "General wellness"}
        Medical Conditions: ${client.health_conditions || "None"}
        Allergies: ${client.allergies || "None"}
        Location: ${client.location || "Remote"}
        Budget: ${client.budget || "Not specified"}

        === DIETICIAN LIST ===
        ${JSON.stringify(dieticians.map(d => {
            // Handle legacy single specialization vs new array
            const specs = d.specializations || [d.specialization];
            return {
                id: d.user_id,
                name: d.name,
                specializations: specs, // CRITICAL: Must match conditions
                experience: d.years_of_experience,
                location: d.location || "Remote",
                clinic: d.clinic_name
            };
        }))}

        === MATCHING RULES (PRIORITY ORDER) ===
        1. **SAFETY FIRST:** If the client has medical conditions (Diabetes, PCOS, Heart Disease, etc.), 
           the dietician MUST have that condition in their specializations. 
           No specialization match = score < 30.
        
        2. **Experience Matters:** For complex conditions, prioritize 5+ years experience.
        
        3. **Location:** Same city/region is a bonus (+10-15 points), but remote is acceptable.
        
        4. **Budget Alignment:** Consider if experience level matches budget tier.

        5. **Threshold:** Only return dieticians with score > 50.

        === OUTPUT FORMAT (STRICT JSON) ===
        {
            "matches": [
                { 
                    "user_id": 101, 
                    "match_score": 92, 
                    "match_reason": "Excellent match: Specializes in Diabetes management (your primary condition). 8 years experience with similar cases. Located in your city." 
                }
            ]
        }

        IMPORTANT: 
        - Write match_reason from the CLIENT'S perspective ("This dietician is good for YOU because...")
        - Be specific about WHY they match (mention conditions, specializations, experience)
        - If no good matches exist (all scores < 50), return empty matches array
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            response_format: { type: "json_object" }, 
        });

        const aiContent = completion.choices[0]?.message?.content || "{}";
      

        const parsedData = JSON.parse(aiContent);
        const aiMatches = parsedData.matches || [];

      

        // 4. Merge AI scores with full dietician data
        const finalResults = aiMatches.map((match: any) => {
            const originalDietician = dieticians.find(d => d.user_id === match.user_id);
            if (!originalDietician) return null;

            // Handle specializations for frontend display
            const specs = originalDietician.specializations || [originalDietician.specialization];

            return {
                ...originalDietician,
                specializations: specs, // Send array to frontend
                match_score: match.match_score,
                match_reason: match.match_reason
            };
        }).filter(Boolean);

        // Sort by score (Best matches first)
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);


        res.json({
            message: "Dietician Matching Complete",
            count: finalResults.length,
            data: finalResults
        });

    } catch (error) {
        console.error("[DEBUG] AI Error:", error);
        res.status(200).json({ 
            message: "AI unavailable, showing available dieticians", 
            data: dieticians.map(d => ({
                ...d,
                specializations: d.specializations || [d.specialization]
            }))
        });
    }
});