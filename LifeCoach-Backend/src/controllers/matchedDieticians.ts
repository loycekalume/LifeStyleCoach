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

    // 2. Fetch Potential Dieticians
    const dieticianQuery = `
        SELECT 
            u.user_id, u.name, u.email, u.contact,
            d.dietician_id, d.specialization, d.specializations, 
            d.years_of_experience, d.location, d.clinic_name,
            d.consultation_fee, d.session_fee, d.monthly_fee
        FROM users u
        JOIN dieticians d ON u.user_id = d.user_id
        WHERE u.role_id = 4 AND u.active = true
        ORDER BY d.years_of_experience DESC
        LIMIT 50
    `;
    const dietRes = await pool.query(dieticianQuery);
    const dieticians = dietRes.rows;

    console.log(`[DEBUG] Dieticians Found in DB: ${dieticians.length}`);

    if (dieticians.length === 0) {
        console.log("[DEBUG] No Dieticians found");
        return res.status(200).json({ 
            message: "No dieticians available at the moment",
            data: [] 
        });
    }

    // ✅ Prepare clean data for AI
    const clientConditions = client.health_conditions || [];
    const clientAllergies = client.allergies || [];
    const hasHealthConditions = clientConditions.length > 0;
    
    const dieticiansForAI = dieticians.map(d => {
        // Normalize specializations to always be an array
        const specs = Array.isArray(d.specializations) 
            ? d.specializations 
            : (d.specializations ? [d.specializations] : [d.specialization].filter(Boolean));
        
        return {
            id: d.user_id,
            name: d.name,
            specializations: specs,
            experience_years: d.years_of_experience || 0,
            location: d.location || "Remote",
            clinic: d.clinic_name || "Private Practice",
            fees: {
                consultation: d.consultation_fee || 0,
                session: d.session_fee || 0,
                monthly: d.monthly_fee || 0
            }
        };
    });

    // ✅ IMPROVED: Structured and precise system prompt
    const systemPrompt = `
You are an expert Clinical Nutrition Matchmaker AI. Your job is to match clients with the MOST QUALIFIED and SAFEST dieticians based on their health needs.

=== CLIENT PROFILE ===
Name: ${client.name}
Age: ${client.age || "Not specified"}
Gender: ${client.gender || "Not specified"}
Weight Goal: ${client.weight_goal || "General wellness"}
Health Conditions: ${clientConditions.length > 0 ? clientConditions.join(', ') : "None"}
Allergies: ${clientAllergies.length > 0 ? clientAllergies.join(', ') : "None"}
Location: ${client.location || "Kenya"}
Budget: ${client.budget || "Medium"}

=== AVAILABLE DIETICIANS ===
${JSON.stringify(dieticiansForAI, null, 2)}

=== MATCHING CRITERIA (WEIGHTED SCORING) ===

**1. SPECIALIZATION MATCH (40 points max) - MOST CRITICAL**
${hasHealthConditions ? `
- Client HAS medical conditions: ${clientConditions.join(', ')}
- REQUIRED: Dietician MUST have at least ONE matching specialization
- Perfect match (all conditions covered): 40 points
- Partial match (some conditions covered): 20-35 points
- NO specialization match: 0 points (REJECT - unsafe match)
` : `
- Client has NO medical conditions
- General wellness dieticians acceptable: 30 points
- Specialized in weight management/nutrition: 40 points
`}

**2. EXPERIENCE LEVEL (25 points max)**
- 10+ years: 25 points
- 5-9 years: 20 points
- 3-4 years: 15 points
- 1-2 years: 10 points
- <1 year: 5 points
${hasHealthConditions ? "- For medical conditions, prefer 5+ years experience" : ""}

**3. LOCATION PROXIMITY (20 points max)**
- Same city/town: 20 points
- Same region/county: 15 points
- Same country: 10 points
- Remote/Different country: 5 points

**4. BUDGET ALIGNMENT (15 points max)**
Budget Level: ${client.budget}
- Low budget: Prefer consultation fee < 2000 KES (15 points if match)
- Medium budget: Fees 2000-5000 KES acceptable (15 points if match)
- High budget: Premium fees acceptable (15 points if match)
- Budget mismatch: 5-10 points

=== SCORING RULES ===
1. Calculate total score (max 100 points)
2. **MINIMUM THRESHOLD: 50 points**
3. If client has health conditions and dietician has NO matching specialization → Automatic score 0 (unsafe)
4. Return TOP 10 matches only, sorted by score (highest first)
5. If ALL scores < 50, return empty array

=== OUTPUT FORMAT (STRICT JSON) ===
{
    "matches": [
        {
            "user_id": 123,
            "match_score": 85,
            "match_reason": "Excellent match for you: Dr. [Name] specializes in [specific condition from your profile], has [X] years of experience treating similar cases, and is located in [location]. Their expertise in [condition] makes them highly qualified to help with your [goal]."
        }
    ]
}

**IMPORTANT RULES:**
- Write match_reason in 2nd person ("for YOU", "your condition", "your goal")
- Be SPECIFIC: mention actual conditions, specializations, and experience
- Explain WHY this dietician is safe and qualified for THIS client
- If score < 50, DO NOT include in matches array
- Maximum 10 matches in response
- Sort matches by score (highest first)

Generate the matches now:
    `.trim();

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate the best dietician matches for this client." }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2, // ✅ Lower for more consistent scoring
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        const aiContent = completion.choices[0]?.message?.content || "{}";
        console.log("[DEBUG] AI Response:", aiContent);

        const parsedData = JSON.parse(aiContent);
        const aiMatches = parsedData.matches || [];

        console.log(`[DEBUG] AI Returned ${aiMatches.length} matches`);

        // ✅ Filter and validate matches
        const validMatches = aiMatches.filter((match: any) => {
            return match.match_score >= 50 && match.user_id && match.match_reason;
        });

        console.log(`[DEBUG] Valid Matches (score >= 50): ${validMatches.length}`);

        // 4. Merge AI scores with full dietician data
        const finalResults = validMatches.map((match: any) => {
            const originalDietician = dieticians.find(d => d.user_id === match.user_id);
            if (!originalDietician) return null;

            // Normalize specializations
            const specs = Array.isArray(originalDietician.specializations)
                ? originalDietician.specializations
                : (originalDietician.specializations 
                    ? [originalDietician.specializations] 
                    : [originalDietician.specialization].filter(Boolean));

            return {
                user_id: originalDietician.user_id,
                name: originalDietician.name,
                email: originalDietician.email,
                contact: originalDietician.contact,
                dietician_id: originalDietician.dietician_id,
                specializations: specs,
                years_of_experience: originalDietician.years_of_experience,
                location: originalDietician.location,
                clinic_name: originalDietician.clinic_name,
                consultation_fee: originalDietician.consultation_fee,
                session_fee: originalDietician.session_fee,
                monthly_fee: originalDietician.monthly_fee,
                match_score: match.match_score,
                match_reason: match.match_reason
            };
        }).filter(Boolean);

        // ✅ Sort by score (Best matches first)
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);

        // ✅ Limit to top 10
        const topMatches = finalResults.slice(0, 10);

        console.log(`[DEBUG] Final Results: ${topMatches.length} dieticians with score >= 50`);

        res.json({
            message: topMatches.length > 0 
                ? "Dietician matching complete" 
                : "No suitable matches found. Consider updating your profile or trying again.",
            count: topMatches.length,
            client_has_conditions: hasHealthConditions,
            data: topMatches
        });

    } catch (error: any) {
        console.error("[DEBUG] AI Error:", error);
        
        // ✅ Fallback: Basic filtering by specialization if AI fails
        const fallbackMatches = dieticians
            .filter(d => {
                if (!hasHealthConditions) return true;
                
                const specs = Array.isArray(d.specializations)
                    ? d.specializations
                    : [d.specialization].filter(Boolean);
                
                return clientConditions.some(condition => 
                    specs.some(spec => 
                        spec?.toLowerCase().includes(condition.toLowerCase())
                    )
                );
            })
            .slice(0, 10)
            .map(d => ({
                ...d,
                specializations: Array.isArray(d.specializations) 
                    ? d.specializations 
                    : [d.specialization].filter(Boolean),
                match_score: 60,
                match_reason: "Basic match based on specialization"
            }));

        res.status(200).json({ 
            message: "AI temporarily unavailable. Showing filtered results.", 
            count: fallbackMatches.length,
            data: fallbackMatches
        });
    }
});