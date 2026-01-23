import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";
import Groq from "groq-sdk"; 


const groq = new Groq({ apiKey: process.env.DAI_API_KEY }); // Fixed typo!

export const getAiMatchedClientsForDietician = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;
    console.log(`[AI-MATCH] Starting client matching for Dietician ID: ${userId}`);

    // 1. Fetch Dietician Profile with better error handling
    const dietQuery = `
        SELECT 
            d.specialization, 
            d.specializations, 
            d.years_of_experience, 
            d.clinic_name,
            d.location,
            u.name as dietician_name
        FROM dieticians d
        JOIN users u ON d.user_id = u.user_id
        WHERE d.user_id = $1
    `;
    const dietRes = await pool.query(dietQuery, [userId]);
    
    if (dietRes.rows.length === 0) {
        console.log("[AI-MATCH] Dietician profile not found");
        return res.status(404).json({ message: "Dietician profile not found." });
    }
    
    const dietician = dietRes.rows[0];
    
    // Handle legacy 'specialization' vs new 'specializations' array
    const specs = dietician.specializations && dietician.specializations.length > 0 
        ? dietician.specializations 
        : (dietician.specialization ? [dietician.specialization] : ["General Nutrition"]);
    
    console.log(`[AI-MATCH] Dietician: ${dietician.dietician_name}, Specializations: ${specs.join(", ")}`);

    // 2. Fetch Potential Clients with better filtering
    const clientQuery = `
        SELECT 
            u.user_id, u.name, 
            c.weight_goal, c.location, c.gender, c.age, 
            c.health_conditions, c.allergies, c.budget
        FROM users u
        JOIN clients c ON u.user_id = c.user_id
        WHERE u.role_id = 5 
        AND c.health_conditions IS NOT NULL -- Prioritize clients with conditions
        ORDER BY u.created_at DESC
        LIMIT 40 
    `;
    const clientRes = await pool.query(clientQuery);
    const clients = clientRes.rows;

    console.log(`[AI-MATCH] Found ${clients.length} potential clients`);

    if (clients.length === 0) {
        return res.status(200).json({ 
            message: "No clients available for matching",
            data: [] 
        });
    }

    // 3. Enhanced AI Prompt with strict constraints
    const systemPrompt = `
You are an expert Clinical Nutrition Matchmaker AI.
Your ONLY job is to match clients to THIS specific dietician based on medical safety and expertise alignment.

=== DIETICIAN PROFILE ===
Name: ${dietician.dietician_name}
Specializations: ${specs.join(", ")}
Years of Experience: ${dietician.years_of_experience} years
Location: ${dietician.location || "Remote"}
Clinic: ${dietician.clinic_name || "Independent Practice"}

=== CLIENT LIST ===
${JSON.stringify(clients.map(c => ({
    id: c.user_id,
    name: c.name,
    age: c.age || "Not specified",
    goal: c.weight_goal || "General wellness",
    conditions: c.health_conditions || "None",
    allergies: c.allergies || "None",
    location: c.location || "Remote",
    budget: c.budget || "Standard"
})), null, 2)}

=== STRICT MATCHING RULES ===

**SCORING SYSTEM (0-100):**

1. **Medical Safety Match (0-50 points):**
   - Client condition EXACTLY matches dietician specialization = 50 points
   - Client condition is RELATED to specialization = 30 points
   - Client has NO special conditions, dietician is generalist = 25 points
   - Client condition NOT in specialization = 0-15 points (UNSAFE)

2. **Experience Level (0-20 points):**
   - 10+ years experience = 20 points
   - 5-9 years = 15 points
   - 2-4 years = 10 points
   - 0-1 years = 5 points

3. **Location Match (0-15 points):**
   - Same city/region = 15 points
   - Same country = 10 points
   - Remote/Different = 5 points

4. **Complexity Match (0-15 points):**
   - Complex case + high experience = 15 points
   - Simple case + appropriate experience = 10 points
   - Mismatch = 0 points

**MANDATORY RULES:**
- ONLY return matches with score ≥ 50 (minimum safe threshold)
- If client has multiple conditions, ALL must align with specializations
- If NO safe matches exist, return empty "matches" array
- Maximum 15 matches (top candidates only)
- Be CONSERVATIVE - patient safety over matching volume

**match_reason FORMAT:**
Write from dietician's perspective in 1-2 sentences:
"This client is a [priority level] match because [specific condition/goal] aligns with your [specific specialization]. [Additional relevant factor]."

Example: "This client is a high-priority match because their Type 2 Diabetes management need directly aligns with your Diabetes & Metabolic Health specialization. Their 5-year condition history makes your 8 years of experience ideal."

=== OUTPUT FORMAT (STRICT JSON - NO EXTRA TEXT) ===
{
    "matches": [
        { 
            "user_id": 123, 
            "match_score": 85, 
            "match_reason": "High-priority match: Client's PCOS diagnosis aligns with your Hormonal Health specialization. Their location in Nairobi matches your clinic." 
        }
    ]
}

Remember: 
- Output ONLY valid JSON
- No markdown, no explanations, no preamble
- Empty matches array if no safe matches found
- Scores must be integers between 0-100
`;

    try {
        console.log("[AI-MATCH] Sending request to Groq API...");
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: systemPrompt }], // Changed to 'user' role
            model: "llama-3.1-8b-instant",
            temperature: 0.2, // Slightly increased for better reasoning
            max_tokens: 2000, // Ensure enough space for response
            response_format: { type: "json_object" }, 
        });

        const aiContent = completion.choices[0]?.message?.content;
        
        if (!aiContent) {
            throw new Error("Empty AI response");
        }

        console.log("[AI-MATCH] AI Response received:", aiContent.substring(0, 300) + "...");

        // 4. Validate and Parse AI Response
        let parsedData;
        try {
            parsedData = JSON.parse(aiContent);
        } catch (parseError) {
            console.error("[AI-MATCH] JSON Parse Error:", parseError);
            console.error("[AI-MATCH] Raw AI Content:", aiContent);
            throw new Error("Invalid JSON response from AI");
        }

        // Validate structure
        if (!parsedData.matches || !Array.isArray(parsedData.matches)) {
            console.error("[AI-MATCH] Invalid response structure:", parsedData);
            throw new Error("AI response missing 'matches' array");
        }

        const aiMatches = parsedData.matches;
        console.log(`[AI-MATCH] AI returned ${aiMatches.length} potential matches`);

        // 5. Validate and merge results with safety checks
        const finalResults = aiMatches
            .map((match: any) => {
                // Validate match object structure
                if (!match.user_id || typeof match.match_score !== 'number' || !match.match_reason) {
                    console.warn("[AI-MATCH] Invalid match object:", match);
                    return null;
                }

                // Validate score range
                if (match.match_score < 0 || match.match_score > 100) {
                    console.warn(`[AI-MATCH] Invalid score ${match.match_score} for user ${match.user_id}`);
                    return null;
                }

                // Find original client data
                const originalClient = clients.find(c => c.user_id === match.user_id);
                if (!originalClient) {
                    console.warn(`[AI-MATCH] Client ${match.user_id} not found in original list`);
                    return null;
                }

                return {
                    ...originalClient,
                    match_score: Math.round(match.match_score), // Ensure integer
                    match_reason: match.match_reason.trim()
                };
            })
            .filter(Boolean); // Remove null entries

        // 6. Sort by score (Highest match first)
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);

        console.log(`[AI-MATCH] Returning ${finalResults.length} validated matches`);
        console.log(`[AI-MATCH] Top 3 scores: ${finalResults.slice(0, 3).map((r: any) => r.match_score).join(", ")}`);

        res.json({
            message: "AI Matching Complete",
            count: finalResults.length,
            dietician_specializations: specs, // Help frontend understand context
            data: finalResults
        });

    } catch (error: any) {
        console.error("[AI-MATCH] Error:", error.message);
        console.error("[AI-MATCH] Full error:", error);
        
        // Enhanced fallback: Return clients sorted by basic criteria
        const fallbackData = clients
            .map(c => ({
                ...c,
                match_score: 50, // Neutral score
                match_reason: "AI matching unavailable. Manual review recommended."
            }))
            .slice(0, 10); // Limit fallback results

        res.status(200).json({ 
            message: "AI temporarily unavailable - showing recent clients", 
            count: fallbackData.length,
            data: fallbackData,
            error_hint: error.message
        });
    }
});

// ✅ 1. HIRE A CLIENT
export const hireClient = asyncHandler(async (req: Request, res: Response) => {
    const dieticianId = (req as any).user.user_id;
    const { client_user_id } = req.body; // Matches frontend payload

    if (!client_user_id) {
        return res.status(400).json({ message: "Client ID is required" });
    }

    // Insert into dietician_clients table
    const query = `
        INSERT INTO dietician_clients (dietician_id, client_id)
        VALUES ($1, $2)
        ON CONFLICT (dietician_id, client_id) DO NOTHING
        RETURNING *
    `;
    const result = await pool.query(query, [dieticianId, client_user_id]);

    if (result.rows.length === 0) {
        return res.json({ message: "Client is already in your roster." });
    }

    res.json({ message: "Client hired successfully!", relationship: result.rows[0] });
});

// ✅ 2. GET ROSTER (Hired Clients)
export const getDieticianRoster = asyncHandler(async (req: Request, res: Response) => {
    const dieticianId = (req as any).user.user_id;

    // Join dietician_clients with users and clients table to get full details
    const query = `
        SELECT 
            u.user_id, 
            u.name, 
            u.email, 
            c.weight_goal,
            c.location,
            c.age,
            c.health_conditions,
            dc.status,
            dc.hired_at
        FROM dietician_clients dc
        JOIN users u ON dc.client_id = u.user_id
        LEFT JOIN clients c ON u.user_id = c.user_id
        WHERE dc.dietician_id = $1
        ORDER BY dc.hired_at DESC
    `;

    const result = await pool.query(query, [dieticianId]);
    res.json({ data: result.rows });
});

// 3. GET LEADS (People chatted with but NOT hired)
export const getDieticianLeads = asyncHandler(async (req: Request, res: Response) => {
    // 1. Get the User ID (Used for auth and checking the hired list)
    const dieticianUserId = (req as any).user.user_id;

    // 2. Get the Dietician Profile ID (Used to find conversations)
    const dieticianIdQuery = `
        SELECT dietician_id FROM dieticians WHERE user_id = $1
    `;
    const dieticianIdResult = await pool.query(dieticianIdQuery, [dieticianUserId]);
    
    if (dieticianIdResult.rows.length === 0) {
        return res.status(404).json({ message: "Dietician profile not found" });
    }
    
    const dieticianProfileId = dieticianIdResult.rows[0].dietician_id;

    const query = `
        SELECT DISTINCT 
            u.user_id, 
            u.name, 
            c.location, 
            c.weight_goal, 
            c.age,
            c.gender,
            c.health_conditions,
            c.allergies,
            c.budget,
            MAX(m.sent_at) as last_interaction,
            COUNT(m.message_id) as message_count,
            
            -- ✅ FIX: Check using the correct ID logic
            CASE 
                WHEN dc.client_id IS NOT NULL THEN true 
                ELSE false 
            END as is_hired,
            
            CASE 
                WHEN dc.client_id IS NOT NULL THEN 1 
                ELSE 0 
            END as hired_sort

        FROM conversations conv
        JOIN users u ON conv.client_id = u.user_id
        LEFT JOIN clients c ON u.user_id = c.user_id
        LEFT JOIN messages m ON m.conversation_id = conv.conversation_id
        
        -- ✅ FIX: Join using 'dieticianUserId' ($2), not 'dieticianProfileId' ($1)
        -- Assuming your 'hireClient' endpoint uses req.user.user_id to save the relationship
        LEFT JOIN dietician_clients dc ON (
            dc.client_id = u.user_id AND dc.dietician_id = $2
        )

        WHERE conv.dietician_id = $1      -- Conversations use Profile ID
        AND u.role_id = 5                 -- Only clients
        
        GROUP BY u.user_id, u.name, c.location, c.weight_goal, c.age, 
                 c.gender, c.health_conditions, c.allergies, c.budget, dc.client_id
        
        HAVING COUNT(m.message_id) > 0    
        ORDER BY hired_sort ASC, last_interaction DESC 
    `;

    // ✅ PASS BOTH IDs: [Profile ID for Convos, User ID for Hired Check]
    const result = await pool.query(query, [dieticianProfileId, dieticianUserId]);
    
    console.log(`[LEADS] Found ${result.rows.length} leads.`);
    console.log(`[LEADS] Hired: ${result.rows.filter(r => r.is_hired).length}`);
    
    res.json({ 
        message: "Leads retrieved successfully",
        count: result.rows.length,
        hired_count: result.rows.filter(r => r.is_hired).length,
        data: result.rows 
    });
});