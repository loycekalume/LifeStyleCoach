import { Request, Response } from "express";
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";
import Groq from "groq-sdk"; 

export const addDietician = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      specialization,
      years_of_experience,
      clinic_name,
      clinic_address,
      certification, // ✅ Added field
    } = req.body;

    // ✅ Verify user exists and is actually a dietician (role_id = 4)
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);

    if (!user.rows.length || user.rows[0].role_id !== 4) {
      return res.status(400).json({ message: "User is not a dietician" });
    }

    // ✅ Handle empty or missing specialization gracefully
    const specializationArray =
      Array.isArray(specialization) && specialization.length > 0
        ? specialization
        : "{}"; // fallback to empty Postgres array

    //  Clean up clinic_address input
    const cleanClinicAddress = clinic_address?.trim() || null;

    //  Insert the dietician profile
    const newDietician = await pool.query(
      `INSERT INTO dieticians (
        user_id, specialization, years_of_experience, clinic_name, clinic_address, certification
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [user_id, specializationArray, years_of_experience, clinic_name, cleanClinicAddress, certification]
    );

    //  Mark user profile as complete
    await pool.query("UPDATE users SET profile_complete = TRUE WHERE user_id = $1", [user_id]);

    res.status(200).json({
      message: "Dietician profile successfully completed and saved",
      dietician: newDietician.rows[0],
    });
  } catch (error) {
    console.error("Error adding dietician:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getDietician=asyncHandler(async(req:Request,res:Response)=>{
    try {
         const result=await pool.query(`SELECT * FROM dieticians`)
       
         res.status(200).json({
            message:"Dieticians retrieved",
            dietician:result.rows
        })
    } catch (error) {

        console.error("Error adding dietician", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})
// dieticianController.ts
export const getDieticianProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const result = await pool.query(
        "SELECT user_id, name, email, contact FROM users WHERE user_id = $1",
        [userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.rows[0]);
});

export const updateDieticianProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { name, email, contact } = req.body;

    const updated = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             contact = COALESCE($3, contact)
         WHERE user_id = $4
         RETURNING user_id, name, email, contact`,
        [name || null, email || null, contact || null, userId]
    );

    res.status(200).json({ message: "Profile updated", user: updated.rows[0] });
});

export const getDieticianById=asyncHandler(async(req:Request,res:Response)=>{
    try {
        const{id}=req.params
         const result=await pool.query(`SELECT * FROM dieticians WHERE dietician_id=$1`,[id])
        if(result.rowCount===0){
            res.status(400).json({message:"Dietician Not Found"})

        }
         res.status(200).json({
            message:"Dieticians retrieved",
            dietician:result.rows
        })
    } catch (error) {

        console.error("Error adding dietician", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const deleteDietician=asyncHandler(async(req:Request,res:Response)=>{
    try {
         const{id}=req.params
    const result=await pool.query(`DELETE FROM dietician WHERE dietician_id=$1`,[id])

    res.status(200).json({message:"Dietician deleted"})
    } catch (error) {
       console.error("Error deleting dietician", error)
        res.status(500).json({ message: "Internal Server Error" })  
    }
   
})

// Get dietician specialization info
export const getDieticianSpecialization = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const result = await pool.query(
        "SELECT specialization, years_of_experience, clinic_name, clinic_address FROM dieticians WHERE user_id = $1",
        [userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Specialization info not found" });
    }

    res.status(200).json(result.rows[0]);
});

// Update dietician specialization
export const updateDieticianSpecialization = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { specialization, years_of_experience, clinic_name, clinic_address } = req.body;

    const updated = await pool.query(
        `UPDATE dieticians 
         SET specialization = COALESCE($1, specialization),
             years_of_experience = COALESCE($2, years_of_experience),
             clinic_name = COALESCE($3, clinic_name),
             clinic_address = COALESCE($4, clinic_address),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5
         RETURNING specialization, years_of_experience, clinic_name, clinic_address`,
        [specialization || null, years_of_experience || null, clinic_name || null, clinic_address || null, userId]
    );

    if (updated.rows.length === 0) {
        return res.status(404).json({ message: "Dietician profile not found" });
    }

    res.status(200).json({ message: "Specialization updated", data: updated.rows[0] });
});

// Get dietician pricing info
export const getDieticianPricing = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const result = await pool.query(
        "SELECT consultation_fee, session_fee, monthly_fee FROM dieticians WHERE user_id = $1",
        [userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Pricing info not found" });
    }

    res.status(200).json(result.rows[0]);
});

// Update dietician pricing
export const updateDieticianPricing = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { consultation_fee, session_fee, monthly_fee } = req.body;

    // Validate pricing values
    const validatePrice = (price: any, name: string) => {
        if (price !== null && price !== undefined && price !== "") {
            const numPrice = parseFloat(price);
            if (isNaN(numPrice) || numPrice < 0) {
                throw new Error(`Invalid ${name} value`);
            }
            return numPrice;
        }
        return null;
    };

    try {
        const validatedConsultation = validatePrice(consultation_fee, "consultation fee");
        const validatedSession = validatePrice(session_fee, "session fee");
        const validatedMonthly = validatePrice(monthly_fee, "monthly fee");

        const updated = await pool.query(
            `UPDATE dieticians 
             SET consultation_fee = COALESCE($1, consultation_fee),
                 session_fee = COALESCE($2, session_fee),
                 monthly_fee = COALESCE($3, monthly_fee),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4
             RETURNING consultation_fee, session_fee, monthly_fee`,
            [validatedConsultation, validatedSession, validatedMonthly, userId]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ message: "Dietician profile not found" });
        }

        res.status(200).json({ message: "Pricing updated", data: updated.rows[0] });
    } catch (error: any) {
        return res.status(400).json({ message: error.message || "Invalid pricing values" });
    }
});


// Get dietician certifications
export const getDieticianCertification = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const result = await pool.query(
        "SELECT certification FROM dieticians WHERE user_id = $1",
        [userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Certification info not found" });
    }

    // Return array of certifications (or empty array if null)
    res.status(200).json({ 
        certification: result.rows[0].certification || [] 
    });
});

// Update dietician certifications
export const updateDieticianCertification = asyncHandler(async (req: UserRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const { certification } = req.body;

    // Validate that certification is an array
    if (!Array.isArray(certification)) {
        return res.status(400).json({ message: "Certification must be an array" });
    }

    // Filter out empty strings and trim
    const cleanedCerts = certification
        .filter(cert => cert && cert.trim() !== "")
        .map(cert => cert.trim());

    const updated = await pool.query(
        `UPDATE dieticians 
         SET certification = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING certification`,
        [cleanedCerts, userId]
    );

    if (updated.rows.length === 0) {
        return res.status(404).json({ message: "Dietician profile not found" });
    }

    res.status(200).json({ message: "Certifications updated", data: updated.rows[0] });
});

const groq = new Groq({ apiKey: process.env.DAI_API_KEY }); // Make sure this is in your .env

export const getAiMatchedClientsForDietician = asyncHandler(async (req: Request, res: Response) => {
    // 1. Get Logged-in Dietician
    const userId = (req as any).user.user_id;

    // Fetch Dietician Profile
    // We get specializations (Array) and experience to help AI judge authority
    const dietQuery = `
        SELECT specialization, specializations, years_of_experience, clinic_name 
        FROM dieticians WHERE user_id = $1
    `;
    const dietRes = await pool.query(dietQuery, [userId]);
    
    if (dietRes.rows.length === 0) {
        return res.status(404).json({ message: "Dietician profile not found." });
    }
    const dietician = dietRes.rows[0];

    // Handle legacy 'specialization' vs new 'specializations' array
    const specs = dietician.specializations || [dietician.specialization];

    // 2. Fetch Potential Clients
    // We filter for clients who haven't been assigned yet (optional) or just 50 recent active ones
    const clientQuery = `
        SELECT 
            u.user_id, u.name, 
            c.weight_goal, c.location, c.gender, c.age, 
            c.health_conditions, c.allergies, c.budget
        FROM users u
        JOIN clients c ON u.user_id = c.user_id
        WHERE u.role_id = 5 -- Assuming 5 is Client Role
        LIMIT 40 
    `;
    const clientRes = await pool.query(clientQuery);
    const clients = clientRes.rows;

    if (clients.length === 0) {
        return res.status(200).json({ data: [] });
    }

    // 3. Construct AI Prompt
    // We emphasize SAFETY matches (Conditions vs Specializations)
    const systemPrompt = `
        You are an expert Clinical Nutrition Matchmaker.
        Your goal is to match Clients to a Dietician based on medical safety and goals.

        === DIETICIAN PROFILE ===
        Specializations: ${specs.join(", ")}
        Experience: ${dietician.years_of_experience} years
        Clinic: ${dietician.clinic_name}

        === CLIENT LIST ===
        ${JSON.stringify(clients.map(c => ({
            id: c.user_id,
            name: c.name,
            goal: c.weight_goal,
            conditions: c.health_conditions, // Critical for Dieticians
            allergies: c.allergies,          // Critical for Dieticians
            budget: c.budget
        })))}

        === RULES ===
        1. **Safety First:** If a client has a medical condition (e.g. Diabetes) that is NOT in the Dietician's specialization, give a LOW score (< 20).
        2. **Reasoning:** Explain the match from the Dietician's perspective. "You are a great fit because..."
        3. **Tone:** Professional and clinical.
        4. **Threshold:** Only return matches with a score > 40.

        === OUTPUT FORMAT (JSON) ===
        {
            "matches": [
                { 
                    "user_id": 123, 
                    "match_score": 95, 
                    "match_reason": "High Priority: Client has Diabetes, which is your primary specialization. Their budget also aligns with your senior rate." 
                }
            ]
        }
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "llama-3.1-8b-instant", // Fast and good at JSON
            temperature: 0.1, // Low temp = more deterministic/safe results
            response_format: { type: "json_object" }, 
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
                match_reason: match.match_reason // The "Why" is the most valuable part
            };
        }).filter(Boolean);

        // Sort by score (Highest match first)
        finalResults.sort((a: any, b: any) => b.match_score - a.match_score);

        res.json({
            message: "AI Analysis Complete",
            count: finalResults.length,
            data: finalResults
        });

    } catch (error) {
        console.error("AI Error:", error);
        // Fallback: If AI fails, return clients sorted by matching location or random
        res.status(200).json({ 
            message: "AI unavailable, showing recent clients", 
            data: clients 
        });
    }
});