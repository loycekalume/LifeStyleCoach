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
        return res.status(404).json({ message: "Dietician profile not found." });
    }
    
    const dietician = dietRes.rows[0];
    
    const specs = Array.isArray(dietician.specializations) && dietician.specializations.length > 0
        ? dietician.specializations 
        : (dietician.specialization ? [dietician.specialization] : ["General Nutrition"]);
    
    console.log(`[AI-MATCH] Dietician: ${dietician.dietician_name}, Specializations: ${specs.join(", ")}`);

    // 2. Fetch Potential Clients
    const clientQuery = `
        SELECT 
            u.user_id, u.name, u.email, u.contact,
            c.weight_goal, c.location, c.gender, c.age, 
            
          
            c.weight, 
            c.height,
            
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

    if (clients.length === 0) {
        return res.status(200).json({ 
            message: "No new clients available for matching",
            data: [] 
        });
    }

    // Prepare clean client data for AI
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

   
    const systemPrompt = `
You are an expert Clinical Nutrition Matchmaker AI. Match clients to this dietician based on medical expertise alignment and safety.

=== DIETICIAN PROFILE ===
Name: ${dietician.dietician_name}
Specializations: ${specs.join(", ")}
Years of Experience: ${dietician.years_of_experience || 0} years
Location: ${dietician.location || "Kenya"}

=== AVAILABLE CLIENTS ===
${JSON.stringify(clientsForAI, null, 2)}

=== MATCHING CRITERIA (WEIGHTED SCORING 0-100) ===

**1. SPECIALIZATION-CONDITION ALIGNMENT (50 points max)**
${specs.length > 0 && !specs.includes("General Nutrition") ? `
This dietician has specific specializations: ${specs.join(", ")}

Scoring Rules:
- EXACT match: 50 points
- CLOSELY RELATED match: 40 points
- NO match but client has common condition (Diabetes, BP): 
  - If experience > 5 years: 40 points (Manageable)
  - If experience < 3 years: 20 points (Refer out)
` : `
This dietician is a GENERALIST.
- General wellness/weight loss: 50 points
- Common conditions (Type 2 Diabetes, Hypertension, Cholesterol): 50 points (Generalists handle these).
- Complex conditions (Kidney Failure, Cancer, Eating Disorders): 15 points (Refer to specialist).
`}

**2. EXPERIENCE (25 points)**
- > 5 years: +25 points
- 2-5 years: +20 points
- < 2 years: +10 points

**3. LOCATION (15 points)**
**4. GOAL (10 points)**

=== MANDATORY RULES ===
1. **MINIMUM THRESHOLD: 50 points** 2. **SAFETY**: If client has *highly complex* conditions (e.g. Renal Failure) and dietician is Generalist -> Score < 30.
3. **Diabetes/Hypertension**: These are common. If dietician is Generalist, SCORE THEM HIGH (50+).

=== OUTPUT FORMAT (STRICT JSON ONLY) ===
{
    "matches": [
        { "user_id": 123, "match_score": 85, "match_reason": "..." }
    ]
}
    `.trim();

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a precise medical matching AI. Always return valid JSON." },
                { role: "user", content: systemPrompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const aiContent = completion.choices[0]?.message?.content || "{}";
        const parsedData = JSON.parse(aiContent);
        const aiMatches = parsedData.matches || [];

        const validMatches = aiMatches
            .filter((match: any) => {
                if (!match.user_id || typeof match.match_score !== 'number') return false;
                return match.match_score >= 50; 
            });

        // 5. Merge with original client data
        const finalResults = validMatches
            .map((match: any) => {
                const originalClient = clients.find(c => c.user_id === match.user_id);
                if (!originalClient) return null;

                return {
                    user_id: originalClient.user_id,
                    name: originalClient.name,
                    email: originalClient.email,
                    contact: originalClient.contact,
                    age: originalClient.age,
                    gender: originalClient.gender,
                    weight_goal: originalClient.weight_goal,
                    
                    // ✅ ADDED: Explicitly map height and weight
                    weight: originalClient.weight,
                    height: originalClient.height,
                    
                    health_conditions: originalClient.health_conditions,
                    allergies: originalClient.allergies,
                    location: originalClient.location,
                    budget: originalClient.budget,
                    match_score: Math.round(match.match_score),
                    match_reason: match.match_reason.trim()
                };
            })
            .filter(Boolean);

        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);
        const topMatches = finalResults.slice(0, 15);

        res.json({
            message: topMatches.length > 0 ? "AI matching complete" : "No suitable matches found",
            count: topMatches.length,
            data: topMatches
        });

    } catch (error: any) {
        console.error("[AI-MATCH] Error:", error.message);
        res.status(200).json({ message: "AI unavailable", data: [] });
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