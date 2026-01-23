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
    // We limit to 50 to avoid sending too much text to AI at once
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
    const systemPrompt = `
        You are an assistant to a Fitness Instructor.
        Your goal is to explain why specific Clients are a good business opportunity for this Instructor.

        === INSTRUCTOR PROFILE ===
        Specialization: ${instructor.specialization}
        Locations: ${instructor.available_locations}
        Mode: ${instructor.coaching_mode}

        === CLIENT LIST ===
        ${JSON.stringify(clients.map(c => ({
            id: c.user_id,
            name: c.name,
            goal: c.weight_goal,
            loc: c.location,
            budget: c.budget
        })))}

        === RULES ===
        1. **Perspective:** Speak directly to the Instructor. Use "You" for the instructor and "This client" or "They" for the client.
        2. **Tone:** Professional, encouraging, and business-focused.
        3. **Constraint:** Only return matches with a score > 50.

        === OUTPUT FORMAT (JSON) ===
        {
            "matches": [
                { 
                    "user_id": 123, 
                    "match_score": 90, 
                    "match_reason": "This client is looking for weight loss, which is your top specialization. They are also located in your area." 
                }
            ]
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            response_format: { type: "json_object" }, // Force JSON
        });

        // 4. Parse AI Response
        const aiContent = completion.choices[0]?.message?.content || "{}";
        const parsedData = JSON.parse(aiContent);
        const aiMatches = parsedData.matches || [];

        // 5. Merge AI Scores back into Full Client Objects
        const finalResults = aiMatches.map((match: any) => {
            const originalClient = clients.find(c => c.user_id === match.user_id);
            if (!originalClient) return null;

            return {
                ...originalClient,
                match_score: match.match_score,
                match_reasons: [match.match_reason] // Standardizing as array
            };
        }).filter(Boolean);

        // Sort by score
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);

        res.json({
            message: "AI Matches found",
            data: finalResults
        });

    } catch (error) {
        console.error("AI Error:", error);
        // Fallback: Return empty or all clients if AI fails
        res.status(200).json({ message: "AI unavailable", data: clients });
    }
});


