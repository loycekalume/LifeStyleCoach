import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";
import Groq from "groq-sdk";

// Initialize Groq
const groq = new Groq({ apiKey: process.env.LAI_API_KEY });

export const upsertClient = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, age, weight, height, goal, gender, allergies, health_conditions, budget, location } = req.body;

  // 1. Insert or Update the Client details
  const result = await pool.query(
    `INSERT INTO clients (
        user_id, age, weight, height, weight_goal, gender, allergies, health_conditions, budget, location
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (user_id) DO UPDATE SET 
        age = EXCLUDED.age,
        weight = EXCLUDED.weight,
        height = EXCLUDED.height,
        weight_goal = EXCLUDED.weight_goal,
        gender = EXCLUDED.gender,
        allergies = EXCLUDED.allergies,
        health_conditions = EXCLUDED.health_conditions,
        budget = EXCLUDED.budget,
        location = EXCLUDED.location
     RETURNING *`,
    [user_id, age, weight, height, goal, gender, allergies, health_conditions, budget, location]
  );

  // 2. Mark the user profile as complete in the USERS table
  await pool.query("UPDATE users SET profile_complete = TRUE WHERE user_id = $1", [user_id]);

 
  await pool.query(
    `INSERT INTO weight_logs (user_id, weight, log_date)
     VALUES ($1, $2, CURRENT_DATE)
     ON CONFLICT (user_id, log_date) DO NOTHING`,
    [user_id, weight]
  );

  res.status(200).json({
    message: "Client profile saved successfully",
    client: result.rows[0],
  });
});


// Get all clients
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

// Delete client by ID
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

// Update client (explicit update endpoint)
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // ✅ Added health_conditions here
  const { age, weight, height, goal, gender, allergies, health_conditions, budget, location } = req.body;

  const result = await pool.query(
    `UPDATE clients 
      SET age = $1, weight = $2, height = $3, weight_goal = $4, gender = $5, 
          allergies = $6, health_conditions = $7, budget = $8, location = $9
      WHERE user_id = $10
      RETURNING *`,
    [age, weight, height, goal, gender, allergies, health_conditions, budget, location, id]
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


// ------------------------------------------------------------------
// AI MATCHING CONTROLLER
// ------------------------------------------------------------------



export const getMatchedClientsForInstructor = asyncHandler(async (req: Request, res: Response) => {
    // 1. Get Logged-in Instructor ID from Token
    const instructorUserId = (req as any).user.user_id;

    // 2. Fetch Instructor Profile (Specialization, Location, Mode, Bio)
    const instQuery = `
        SELECT specialization, available_locations, coaching_mode, bio 
        FROM instructors WHERE user_id = $1
    `;
    const instRes = await pool.query(instQuery, [instructorUserId]);

    if (instRes.rows.length === 0) {
        return res.status(404).json({ message: "Instructor profile not found." });
    }
    const instructor = instRes.rows[0];

    // 3. Fetch All Potential Clients (Limit 100 to ensure we catch enough candidates)
    const clientQuery = `
        SELECT 
            u.user_id, u.name, u.email,
            c.weight_goal, c.location, c.gender, c.age, 
            c.height, c.weight, c.budget
        FROM users u
        JOIN clients c ON u.user_id = c.user_id
        WHERE u.role_id = 5
        LIMIT 100
    `;
    const clientRes = await pool.query(clientQuery);
    const allClients = clientRes.rows;

    if (allClients.length === 0) {
        return res.status(200).json({ message: "No clients found in the system yet.", data: [] });
    }

    // =================================================================================
    // 🚀 STEP 4: STRICT CODE-LEVEL FILTERING (Location & Mode Logic)
    // =================================================================================
    
    // Normalize Instructor Mode & Locations
    const mode = instructor.coaching_mode ? instructor.coaching_mode.toLowerCase() : "";
    let instLocs: string[] = [];

    // Handle Postgres Array or String format safely
    if (Array.isArray(instructor.available_locations)) {
        instLocs = instructor.available_locations.map((l: string) => l.toLowerCase().trim());
    } else if (typeof instructor.available_locations === 'string') {
        instLocs = instructor.available_locations.replace(/[{"}]/g, "").split(',').map(l => l.trim().toLowerCase());
    }

    // Determine strict mode flags
    const isOnline = mode.includes('remote') || mode.includes('online');
    const isHybrid = mode.includes('both') || mode.includes('hybrid');
    const isOnsite = mode.includes('onsite') || mode.includes('person');

    // Filter Clients: Keep only those reachable by this instructor
    const validClients = allClients.filter(client => {
        // CASE A: If Instructor is Online or Hybrid -> They can coach ANYONE.
        if (isOnline || isHybrid) return true;

        // CASE B: If Instructor is strictly Onsite -> Client MUST match location.
        if (isOnsite) {
            const clientLoc = client.location ? client.location.toLowerCase().trim() : "";
            
            // Check if locations overlap (e.g. "Nairobi" inside "Westlands, Nairobi")
            const isLocationMatch = instLocs.some(loc => 
                clientLoc.includes(loc) || loc.includes(clientLoc)
            );
            return isLocationMatch;
        }

        return false; // Fallback if mode is undefined
    });

    if (validClients.length === 0) {
        return res.status(200).json({ 
            message: "No clients found matching your location or coaching mode.", 
            data: [] 
        });
    }

    // =================================================================================
    // 🚀 STEP 5: AI SCORING (Strict Specialization vs. Weight Goal)
    // =================================================================================
    
    const systemPrompt = `You are a fitness business expert matching clients to an instructor based PURELY on fitness goals.

    **INSTRUCTOR PROFILE:**
    - Specialization: ${instructor.specialization}
    - Bio: ${instructor.bio}

    **CANDIDATE CLIENTS:**
    ${JSON.stringify(validClients.map(c => ({
        id: c.user_id,
        name: c.name,
        goal: c.weight_goal, // Crucial Field
        budget: c.budget
    })), null, 2)}

    **YOUR TASK:**
    Score each client from 0-100 based on how well the Instructor's Specialization matches the Client's Goal.

    **SCORING RULES:**
    - **90-100 (Perfect Match):** Instructor specializes exactly in what the client wants.
      (e.g., Instructor: "Hypertrophy/Bodybuilding" -> Client: "Muscle Gain")
      (e.g., Instructor: "Weight Management" -> Client: "Weight Loss")
    - **70-89 (Strong Match):** Specialization is highly relevant.
      (e.g., Instructor: "General Fitness" -> Client: "Weight Loss")
    - **50-69 (Possible Match):** Loosely related.
    - **< 50 (Mismatch):** Completely unrelated fields (e.g., Yoga vs. Powerlifting).

    **OUTPUT FORMAT (JSON ONLY):**
    {
        "matches": [
            { 
                "user_id": <number>,
                "match_score": <number>,
                "match_reason": "<Short explanation for the instructor. Example: 'Client wants muscle gain, which aligns perfectly with your Bodybuilding specialization.'>"
            }
        ]
    }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1, // Keep low for consistent results
            response_format: { type: "json_object" },
        });

        // Parse AI Response
        const aiContent = completion.choices[0]?.message?.content || "{}";
        const firstBrace = aiContent.indexOf('{');
        const lastBrace = aiContent.lastIndexOf('}');
        
        let aiMatches = [];
        if (firstBrace !== -1 && lastBrace !== -1) {
             const jsonString = aiContent.substring(firstBrace, lastBrace + 1);
             const parsedData = JSON.parse(jsonString);
             aiMatches = parsedData.matches || [];
        }

        // 6. Merge AI Scores back into Full Client Objects
        const finalResults = aiMatches
            .filter((match: any) => match.match_score >= 50) // Filter out weak matches
            .map((match: any) => {
                const originalClient = validClients.find(c => c.user_id === match.user_id);
                if (!originalClient) return null;

                return {
                    ...originalClient,
                    match_score: match.match_score,
                    match_reason: match.match_reason 
                };
            })
            .filter(Boolean);

        // Sort by score descending (Best matches first)
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


// ------------------------------------------------------------------
// CLIENT MEAL PLANS (For the Client Dashboard)
// ------------------------------------------------------------------

export const getMyMealPlans = asyncHandler(async (req: Request, res: Response) => {
  
  // 1. Get the logged-in client's User ID
  const userId = (req as any).user.user_id;

  const query = `
    SELECT 
      mp.meal_plan_id,
      mp.title,
      mp.category,
      mp.description,
      
      -- Calculate total calories for the plan from meal_items
      (
        SELECT COALESCE(SUM(calories), 0) 
        FROM meal_items mi 
        WHERE mi.meal_plan_id = mp.meal_plan_id
      ) as calories,

      cda.status,
      cda.assigned_date as start_date, 
      cda.custom_notes as dietician_notes,
      
      -- Fetch Dietician's name for context
      u.name as dietician_name
    
    FROM client_diet_assignments cda
    JOIN meal_plans mp ON cda.meal_plan_id = mp.meal_plan_id
    JOIN dieticians d ON cda.dietician_id = d.dietician_id
    JOIN users u ON d.user_id = u.user_id
    
    -- ✅ Filter directly by the Client's User ID
    WHERE cda.client_id = $1 
    AND cda.status = 'active'
    
    ORDER BY cda.assigned_date DESC
  `;

  const result = await pool.query(query, [userId]);

  // Format calories to include units
  const formattedPlans = result.rows.map(plan => ({
    ...plan,
    calories: plan.calories ? `${plan.calories} kcal` : 'N/A'
  }));

  res.json({
    message: "Plans retrieved",
    mealPlans: formattedPlans
  });
});


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

  // 2. Fetch Actual Meal Items
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