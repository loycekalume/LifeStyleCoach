import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";
import Groq from "groq-sdk"; 



export const upsertClient = asyncHandler(async (req: Request, res: Response) => {
  
  const { user_id, age, weight, height, goal, gender, allergies, budget, location } = req.body;

  // 1. Insert or Update the Client details
  const result = await pool.query(
    `INSERT INTO clients (
        user_id, age, weight, height, weight_goal, gender, allergies, budget, location
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (user_id) DO UPDATE SET 
        age = EXCLUDED.age,
        weight = EXCLUDED.weight,
        height = EXCLUDED.height,
        weight_goal = EXCLUDED.weight_goal,
        gender = EXCLUDED.gender,
        allergies = EXCLUDED.allergies,
        budget = EXCLUDED.budget,
        location = EXCLUDED.location
     RETURNING *`,
    [user_id, age, weight, height, goal, gender, allergies, budget, location]
  );

  // 2. ✅ FIX: Mark the user profile as complete in the USERS table
  // This prevents the infinite redirect loop on the frontend
  await pool.query("UPDATE users SET profile_complete = TRUE WHERE user_id = $1", [user_id]);

  res.status(200).json({
    message: "Client profile saved successfully",
    client: result.rows[0],
  });
});


//  Get all clients aaaaaand
///merge
export const getClients = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        r.role_name,
        c.weight_goal, 
        c.age, 
        c.gender, 
        c.weight, 
        c.height, 
        c.health_conditions, 
        c.allergies, 
        c.budget, 
        c.location
     FROM users u
     JOIN user_roles r ON u.role_id = r.role_id
     LEFT JOIN clients c ON u.user_id = c.user_id
     WHERE u.role_id = 5`
  );

  res.status(200).json({
    message: "Clients fetched successfully",
    clients: result.rows,
  });
});




// Get client by ID
export const getClientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT clients.*, users.name, users.email, user_roles.role_name
     FROM clients
     JOIN users ON clients.user_id = users.user_id
     JOIN user_roles ON users.role_id = user_roles.role_id
     WHERE clients.user_id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Client not found" });
    return;
  }

  res.status(200).json(result.rows[0]);
});

//  Delete client by ID
export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `DELETE FROM clients WHERE user_id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Client not found or already deleted" });
    return;
  }

  res.status(200).json({
    message: "Client deleted successfully",
    deleted: result.rows[0],
  });
});

//  Update client (explicit update endpoint if you want it separate from upsert)
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { age, weight, height, goal, gender, allergies, budget, location } = req.body;

  const result = await pool.query(
    `UPDATE clients 
     SET age = $1, weight = $2, height = $3, weight_goal = $4, gender = $5, 
         allergies = $6, budget = $7, location = $8
     WHERE user_id = $9
     RETURNING *`,
    [age, weight, height, goal, gender, allergies, budget, location, id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Client not found" });
    return;
  }

  res.status(200).json({
    message: "Client updated successfully",
    client: result.rows[0],
  });
});



const groq = new Groq({ apiKey: process.env.LAI_API_KEY });

export const getMatchedClientsForInstructor = asyncHandler(async (req: Request, res: Response) => {
    // 1. Get Logged-in Instructor
    const instructorUserId = (req as any).user.user_id;

    // Fetch Instructor Profile
    const instQuery = `
        SELECT specialization, available_locations, coaching_mode, bio 
        FROM instructors WHERE user_id = $1
    `;
    const instRes = await pool.query(instQuery, [instructorUserId]);
    
    if (instRes.rows.length === 0) {
        return res.status(404).json({ message: "Instructor profile not found." });
    }
    const instructor = instRes.rows[0];

    // 2. Fetch All Clients
    const clientQuery = `
        SELECT 
            u.user_id, u.name, 
            c.weight_goal, c.location, c.gender, c.age, c.health_conditions
        FROM users u
        JOIN clients c ON u.user_id = c.user_id
        WHERE u.role_id = 5
        LIMIT 50 
    `;
    const clientRes = await pool.query(clientQuery);
    const clients = clientRes.rows;

    if (clients.length === 0) {
        return res.status(200).json({ data: [] });
    }

    // 3. Construct AI Prompt
    const systemPrompt = `You are a fitness client matching expert. Your job is to find the BEST client matches for an instructor based on strict compatibility criteria.

**INSTRUCTOR PROFILE:**
- Specialization: ${instructor.specialization}
- Available Locations: ${instructor.available_locations}
- Coaching Mode: ${instructor.coaching_mode}

**CLIENTS TO EVALUATE:**
${JSON.stringify(clients.map(c => ({
    id: c.user_id,
    name: c.name,
    weight_goal: c.weight_goal,
    location: c.location,
    gender: c.gender,
    age: c.age,
    health_conditions: c.health_conditions
})), null, 2)}

**MATCHING RULES (APPLY STRICTLY):**

1. **Specialization Match (40 points max):**
   - EXACT match between instructor specialization and client weight_goal: 40 points
   - Partial/related match (e.g., "weight loss" instructor + "fat loss" client): 25 points
   - No match: 0 points

2. **Location Match (40 points max):**
   - COACHING MODE LOGIC:
     * If instructor coaching_mode is "Online" or "Remote": Award 40 points to ALL clients (location irrelevant)
     * If instructor coaching_mode is "In-Person": Client location MUST match at least one of instructor's available_locations
       - Exact city match: 40 points
       - Same region/state: 25 points
       - Different location: 0 points
     * If instructor coaching_mode is "Both" or "Hybrid": 
       - Location match: 40 points
       - No location match but client could go online: 30 points



**SCORING:**
- Calculate total score (max 100 points)
- ONLY return matches with score ≥ 50
- Be STRICT - don't force matches that don't meet criteria

**OUTPUT FORMAT (STRICT JSON):**
{
    "matches": [
        { 
            "user_id": <number>,
            "match_score": <number 0-100>,
            "match_reason": "<2-3 sentence explanation from instructor's perspective using 'you' for instructor and 'they/this client' for client. Be specific about WHY they match.>"
        }
    ]
}

**IMPORTANT:**
- Speak directly to the instructor (use "you")
- Be professional and business-focused
- Only include scores ≥ 50
- If no matches meet criteria, return empty matches array
- Be honest - don't inflate scores artificially`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        // 4. Parse AI Response
        const aiContent = completion.choices[0]?.message?.content || "{}";
        const parsedData = JSON.parse(aiContent);
        const aiMatches = parsedData.matches || [];

        // 5. Merge AI Scores back into Full Client Objects
        const finalResults = aiMatches
            .filter((match: any) => match.match_score >= 50) // Double-check AI followed rules
            .map((match: any) => {
                const originalClient = clients.find(c => c.user_id === match.user_id);
                if (!originalClient) return null;

                return {
                    ...originalClient,
                    match_score: match.match_score,
                    match_reasons: [match.match_reason]
                };
            })
            .filter(Boolean);

        // Sort by score (highest first)
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);

        res.json({
            message: `Found ${finalResults.length} qualified matches`,
            data: finalResults
        });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ 
            message: "AI matching service unavailable", 
            data: [] 
        });
    }
});

export const getMyMealPlans = asyncHandler(async (req: Request, res: Response) => {
    const clientId = (req as any).user.user_id;

    const query = `
        SELECT 
            mp.meal_plan_id,
            mp.title,
            mp.category,
            mp.description,
            
            -- ✅ CALCULATE CALORIES (Assuming 'meal_items' table exists)
            -- If you don't have meal_items yet, change this line to: 'N/A' as calories,
            (
                SELECT COALESCE(SUM(calories), 0) 
                FROM meal_items mi 
                WHERE mi.meal_plan_id = mp.meal_plan_id
            ) as calories,

            cda.status,
            
            -- ✅ FIX: Use 'assigned_date' instead of 'start_date'
            cda.assigned_date as start_date, 
            
            cda.custom_notes as dietician_notes,
            u.name as dietician_name,
            d.specialization
        FROM client_diet_assignments cda
        JOIN meal_plans mp ON cda.meal_plan_id = mp.meal_plan_id
        JOIN dieticians d ON cda.dietician_id = d.dietician_id
        JOIN users u ON d.user_id = u.user_id
        WHERE cda.client_id = $1 AND cda.status = 'active'
        ORDER BY cda.assigned_date DESC
    `;

    const result = await pool.query(query, [clientId]);

    // Format the response
    const formattedPlans = result.rows.map(plan => ({
        ...plan,
        // Ensure calories is a string with "kcal" appended
        calories: plan.calories ? `${plan.calories} kcal` : 'N/A'
    }));

    res.json({
        message: "Plans retrieved",
        plans: formattedPlans
    });
});

// ... existing imports

// GET /client/plans/:planId/details
export const getMealPlanDetails = asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    // 1. Fetch Plan Metadata
    const planQuery = `
        SELECT 
            mp.meal_plan_id, mp.title, mp.category, mp.description,
            u.name as dietician_name,
            cda.custom_notes
        FROM meal_plans mp
        JOIN client_diet_assignments cda ON mp.meal_plan_id = cda.meal_plan_id
        JOIN dieticians d ON cda.dietician_id = d.dietician_id
        JOIN users u ON d.user_id = u.user_id
        WHERE mp.meal_plan_id = $1
    `;
    const planResult = await pool.query(planQuery, [planId]);

    if (planResult.rows.length === 0) {
        return res.status(404).json({ message: "Plan not found" });
    }

    // 2. Fetch Actual Meal Items from 'meal_items' table
    // Assumes columns: item_id, meal_type (Breakfast, etc.), item_name, calories, portion
    const itemsQuery = `
        SELECT * FROM meal_items 
        WHERE meal_plan_id = $1 
        ORDER BY 
            CASE 
                WHEN meal_type = 'Breakfast' THEN 1
                WHEN meal_type = 'Lunch' THEN 2
                WHEN meal_type = 'Snack' THEN 3
                WHEN meal_type = 'Dinner' THEN 4
                ELSE 5
            END
    `;
    const itemsResult = await pool.query(itemsQuery, [planId]);

    res.json({
        plan: planResult.rows[0],
        items: itemsResult.rows
    });
});