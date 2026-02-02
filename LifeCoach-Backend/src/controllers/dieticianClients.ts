import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";
import Groq from "groq-sdk"; 


const groq = new Groq({ apiKey: process.env.DAI_API_KEY }); // Fixed typo!

export const getAiMatchedClientsForDietician = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.user_id;
    console.log(`[AI-MATCH] Starting client matching for Dietician ID: ${userId}`);

    // 1. Fetch Dietician Profile
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
    
    // ✅ Normalize specializations to always be an array
    const specs = Array.isArray(dietician.specializations) && dietician.specializations.length > 0
        ? dietician.specializations 
        : (dietician.specialization ? [dietician.specialization] : ["General Nutrition"]);
    
    console.log(`[AI-MATCH] Dietician: ${dietician.dietician_name}, Specializations: ${specs.join(", ")}`);

    // 2. Fetch Potential Clients - prioritize those with health conditions
    const clientQuery = `
        SELECT 
            u.user_id, u.name, u.email, u.contact,
            c.weight_goal, c.location, c.gender, c.age, 
            c.health_conditions, c.allergies, c.budget
        FROM users u
        JOIN clients c ON u.user_id = c.user_id
        WHERE u.role_id = 5 
        AND u.active = true
        AND NOT EXISTS (
            SELECT 1 FROM dietician_clients dc 
            WHERE dc.client_id = u.user_id 
            AND dc.dietician_id = $1 
            AND dc.status = 'Active'
        )
        ORDER BY 
            CASE WHEN c.health_conditions IS NOT NULL THEN 0 ELSE 1 END,
            u.created_at DESC
        LIMIT 50
    `;
    const clientRes = await pool.query(clientQuery, [userId]);
    const clients = clientRes.rows;

    console.log(`[AI-MATCH] Found ${clients.length} potential clients`);

    if (clients.length === 0) {
        return res.status(200).json({ 
            message: "No new clients available for matching",
            data: [] 
        });
    }

    // ✅ Prepare clean client data for AI
    const clientsForAI = clients.map(c => ({
        id: c.user_id,
        name: c.name,
        age: c.age || "Not specified",
        gender: c.gender || "Not specified",
        goal: c.weight_goal || "General wellness",
        conditions: Array.isArray(c.health_conditions) 
            ? c.health_conditions.join(", ") 
            : (c.health_conditions || "None"),
        allergies: Array.isArray(c.allergies)
            ? c.allergies.join(", ")
            : (c.allergies || "None"),
        location: c.location || "Kenya",
        budget: c.budget || "Medium"
    }));

    // ✅ IMPROVED: More precise and structured prompt
    const systemPrompt = `
You are an expert Clinical Nutrition Matchmaker AI. Match clients to this dietician based on medical expertise alignment and safety.

=== DIETICIAN PROFILE ===
Name: ${dietician.dietician_name}
Specializations: ${specs.join(", ")}
Years of Experience: ${dietician.years_of_experience || 0} years
Location: ${dietician.location || "Kenya"}
Clinic: ${dietician.clinic_name || "Independent Practice"}

=== AVAILABLE CLIENTS ===
${JSON.stringify(clientsForAI, null, 2)}

=== MATCHING CRITERIA (WEIGHTED SCORING 0-100) ===

**1. SPECIALIZATION-CONDITION ALIGNMENT (50 points max) - CRITICAL**
${specs.length > 0 && !specs.includes("General Nutrition") ? `
This dietician has specific specializations: ${specs.join(", ")}

Scoring Rules:
- Client condition EXACTLY matches one of your specializations: 50 points
  Example: Client has "Diabetes" and you specialize in "Diabetes Management"
- Client condition is CLOSELY RELATED to your specialization: 35-40 points
  Example: Client has "Insulin Resistance" and you specialize in "Diabetes"
- Client has MULTIPLE conditions, ALL match your specializations: 50 points
- Client has MULTIPLE conditions, SOME match: 25-35 points
- Client condition DOES NOT match your specializations: 0-15 points (NOT RECOMMENDED)
- Client has NO medical conditions (general wellness): 20 points (acceptable but not priority)
` : `
This dietician is a GENERALIST (General Nutrition or no specific specialization)

Scoring Rules:
- Clients with general wellness goals: 40 points
- Clients with mild/simple conditions: 35 points
- Clients with complex medical conditions: 15 points (refer to specialist)
`}

**2. EXPERIENCE-COMPLEXITY MATCH (25 points max)**
Your Experience: ${dietician.years_of_experience || 0} years

- Complex case (multiple conditions) + 7+ years experience: 25 points
- Moderate case + 4-6 years experience: 20 points
- Simple case + 2-3 years experience: 18 points
- Simple case + any experience: 15 points
- Complex case + low experience: 10 points (risky)

**3. LOCATION PROXIMITY (15 points max)**
Your Location: ${dietician.location || "Kenya"}

- Same city/town as client: 15 points
- Same county/region: 12 points
- Same country: 10 points
- Remote/International: 5 points

**4. GOAL ALIGNMENT (10 points max)**
- Client's weight goal matches your common cases: 10 points
- Moderately aligned: 7 points
- Not aligned but manageable: 5 points

=== MANDATORY RULES ===
1. **MINIMUM THRESHOLD: 50 points** - Only return matches scoring 50+
2. **SAFETY FIRST**: If client has serious conditions (Diabetes, PCOS, Heart Disease, etc.) and dietician does NOT specialize in that area → Score must be < 30
3. **Maximum 15 matches** - Return only top candidates
4. **Sort by score** - Highest matches first
5. If NO clients score ≥ 50, return empty matches array

=== MATCH REASON FORMAT ===
Write from the dietician's perspective (addressing them as "you"):

Template: "High-priority match: This client's [specific condition/goal] directly aligns with your [specific specialization]. [Additional benefit: location/experience/complexity match]."

Good Example: "High-priority match: This client's Type 2 Diabetes and weight loss goal directly align with your Diabetes Management and Weight Control specializations. Located in Nairobi like your clinic, making in-person consultations convenient."

Bad Example: "Good match for your practice." (Too vague)

=== OUTPUT FORMAT (STRICT JSON ONLY) ===
{
    "matches": [
        {
            "user_id": 123,
            "match_score": 85,
            "match_reason": "High-priority match: This client's PCOS diagnosis and hormonal imbalance align perfectly with your Hormonal Health specialization. Your 8 years of experience is ideal for their complex case."
        }
    ]
}

**CRITICAL:**
- Output ONLY valid JSON
- No markdown formatting
- No explanatory text before or after JSON
- Integer scores only (0-100)
- If no matches ≥ 50, return {"matches": []}

Generate matches now:
    `.trim();

    try {
        console.log("[AI-MATCH] Sending request to Groq API...");
        
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a precise medical matching AI. Always return valid JSON." },
                { role: "user", content: systemPrompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            max_tokens: 2500,
            response_format: { type: "json_object" }
        });

        const aiContent = completion.choices[0]?.message?.content;
        
        if (!aiContent) {
            throw new Error("Empty AI response");
        }

        console.log("[AI-MATCH] AI Response received (first 200 chars):", aiContent.substring(0, 200));

        // 4. Parse and validate AI response
        let parsedData;
        try {
            parsedData = JSON.parse(aiContent);
        } catch (parseError) {
            console.error("[AI-MATCH] JSON Parse Error:", parseError);
            console.error("[AI-MATCH] Raw AI Content:", aiContent);
            throw new Error("Invalid JSON response from AI");
        }

        if (!parsedData.matches || !Array.isArray(parsedData.matches)) {
            console.error("[AI-MATCH] Invalid response structure:", parsedData);
            throw new Error("AI response missing 'matches' array");
        }

        const aiMatches = parsedData.matches;
        console.log(`[AI-MATCH] AI returned ${aiMatches.length} potential matches`);

        // ✅ Validate matches and filter by threshold
        const validMatches = aiMatches
            .filter((match: any) => {
                // Basic validation
                if (!match.user_id || typeof match.match_score !== 'number' || !match.match_reason) {
                    console.warn("[AI-MATCH] Invalid match object:", match);
                    return false;
                }

                // Score validation
                if (match.match_score < 50 || match.match_score > 100) {
                    console.log(`[AI-MATCH] Filtered out match with score ${match.match_score} (below threshold or invalid)`);
                    return false;
                }

                return true;
            });

        console.log(`[AI-MATCH] ${validMatches.length} matches passed validation (score >= 50)`);

        // 5. Merge with original client data
        const finalResults = validMatches
            .map((match: any) => {
                const originalClient = clients.find(c => c.user_id === match.user_id);
                if (!originalClient) {
                    console.warn(`[AI-MATCH] Client ${match.user_id} not found in original list`);
                    return null;
                }

                return {
                    user_id: originalClient.user_id,
                    name: originalClient.name,
                    email: originalClient.email,
                    contact: originalClient.contact,
                    age: originalClient.age,
                    gender: originalClient.gender,
                    weight_goal: originalClient.weight_goal,
                    health_conditions: originalClient.health_conditions,
                    allergies: originalClient.allergies,
                    location: originalClient.location,
                    budget: originalClient.budget,
                    match_score: Math.round(match.match_score),
                    match_reason: match.match_reason.trim()
                };
            })
            .filter(Boolean);

        // 6. Sort by score and limit to top 15
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);
        const topMatches = finalResults.slice(0, 15);

        console.log(`[AI-MATCH] Returning ${topMatches.length} top matches`);
        if (topMatches.length > 0) {
            console.log(`[AI-MATCH] Score range: ${topMatches[0].match_score} - ${topMatches[topMatches.length - 1].match_score}`);
        }

        res.json({
            message: topMatches.length > 0 
                ? "AI matching complete - showing top candidates"
                : "No suitable client matches found (all scored below 50%)",
            count: topMatches.length,
            dietician_specializations: specs,
            min_score_threshold: 50,
            data: topMatches
        });

    } catch (error: any) {
        console.error("[AI-MATCH] Error:", error.message);
        
        // ✅ Smarter fallback - basic filtering by conditions
        const hasSpecializations = specs.length > 0 && !specs.includes("General Nutrition");
        
        const fallbackData = clients
            .filter(c => {
                if (!hasSpecializations) return true; // Generalist accepts all
                
                const clientConditions = Array.isArray(c.health_conditions) 
                    ? c.health_conditions 
                    : (c.health_conditions ? [c.health_conditions] : []);
                
                // Check if any client condition matches dietician specializations
                return clientConditions.some(condition => 
                    specs.some(spec => 
                        spec.toLowerCase().includes(condition.toLowerCase()) ||
                        condition.toLowerCase().includes(spec.toLowerCase())
                    )
                );
            })
            .slice(0, 10)
            .map(c => ({
                ...c,
                match_score: 55,
                match_reason: "AI temporarily unavailable. Basic specialization match detected."
            }));

        res.status(200).json({ 
            message: "AI matching temporarily unavailable - showing filtered results", 
            count: fallbackData.length,
            data: fallbackData,
            note: "Manual review recommended"
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

export const getClientProgress = asyncHandler(async (req: Request, res: Response) => {
    const { clientId } = req.params;

    // 1. Fetch Client Profile (For Goal & Current Weight)
    const clientQuery = await pool.query(
        "SELECT name, weight, weight_goal FROM clients JOIN users ON clients.user_id = users.user_id WHERE clients.user_id = $1",
        [clientId]
    );

    if (clientQuery.rows.length === 0) {
        return res.status(404).json({ message: "Client not found" });
    }
    const client = clientQuery.rows[0];

    // 2. Fetch Meal Logs for the last 30 days
    const logsQuery = await pool.query(
        `SELECT log_date, SUM(calories) as daily_calories, 
                SUM(protein) as daily_protein, 
                SUM(carbs) as daily_carbs, 
                SUM(fats) as daily_fats
         FROM meal_logs 
         WHERE user_id = $1 AND log_date > CURRENT_DATE - INTERVAL '30 days'
         GROUP BY log_date 
         ORDER BY log_date ASC`,
        [clientId]
    );

    const dailyLogs = logsQuery.rows;

    // 3. Calculate Averages & Consistency
    const totalDaysLogged = dailyLogs.length;
    const consistency = Math.round((totalDaysLogged / 30) * 100);

    let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;

    dailyLogs.forEach(log => {
        totalCals += Number(log.daily_calories);
        totalP += Number(log.daily_protein);
        totalC += Number(log.daily_carbs);
        totalF += Number(log.daily_fats);
    });

    const averages = totalDaysLogged > 0 ? {
        calories: Math.round(totalCals / totalDaysLogged),
        protein: Math.round(totalP / totalDaysLogged),
        carbs: Math.round(totalC / totalDaysLogged),
        fats: Math.round(totalF / totalDaysLogged),
    } : { calories: 0, protein: 0, carbs: 0, fats: 0 };

    res.json({
        client_name: client.name,
        current_weight: client.weight,
        weight_goal: client.weight_goal,
        consistency: consistency,
        averages: averages,
        logs: dailyLogs 
    });
});