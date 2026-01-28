import { Request, Response } from "express";
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

export const addDietician = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      specialization,
      years_of_experience,
      clinic_name,
      clinic_address,
      certification,
    } = req.body;

    console.log("[ADD DIETICIAN] Received data:", {
      user_id,
      specialization,
      certification,
      types: {
        specialization: typeof specialization,
        certification: typeof certification
      }
    });

    // ✅ Verify user exists and is actually a dietician (role_id = 4)
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);

    if (!user.rows.length || user.rows[0].role_id !== 4) {
      return res.status(400).json({ message: "User is not a dietician" });
    }

    // ✅ Handle specialization array
    let specializationArray;
    if (Array.isArray(specialization) && specialization.length > 0) {
      specializationArray = specialization;
    } else if (typeof specialization === 'string' && specialization.trim()) {
      // If it comes as string like "{Diabetes,Weight Loss}", parse it
      specializationArray = specialization.replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    } else {
      specializationArray = [];
    }

    // ✅ Handle certification array (same logic)
    let certificationArray;
    if (Array.isArray(certification) && certification.length > 0) {
      certificationArray = certification;
    } else if (typeof certification === 'string' && certification.trim()) {
      // Split by comma if multiple certifications like "RDN, LD"
      certificationArray = certification.split(',').map(c => c.trim()).filter(Boolean);
    } else {
      certificationArray = [];
    }

    console.log("[ADD DIETICIAN] Processed arrays:", {
      specializationArray,
      certificationArray
    });

    // Clean up clinic_address input
    const cleanClinicAddress = clinic_address?.trim() || null;

    // ✅ Insert the dietician profile
    const newDietician = await pool.query(
      `INSERT INTO dieticians (
        user_id, specialization, years_of_experience, clinic_name, clinic_address, certification
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        user_id, 
        specializationArray,      // ✅ Now an array
        years_of_experience, 
        clinic_name, 
        cleanClinicAddress, 
        certificationArray        // ✅ Now an array
      ]
    );

    // Mark user profile as complete
    await pool.query("UPDATE users SET profile_complete = TRUE WHERE user_id = $1", [user_id]);

    console.log("[ADD DIETICIAN] Success:", newDietician.rows[0]);

    res.status(200).json({
      message: "Dietician profile successfully completed and saved",
      dietician: newDietician.rows[0],
    });
  } catch (error: any) {
    console.error("[ADD DIETICIAN] Error:", error);
    console.error("[ADD DIETICIAN] Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
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


export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    // 1. Get the User ID (Used for 'dietician_clients' table)
    const userId = (req as any).user.user_id;

    // 2. Get the Dietician Profile ID (Used for 'meal_plans' & 'consultations' tables)
    const dieticianQuery = await pool.query("SELECT dietician_id FROM dieticians WHERE user_id = $1", [userId]);
    
    if (dieticianQuery.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
    }
    
    const dieticianId = dieticianQuery.rows[0].dietician_id;

    console.log(`[STATS] User ID: ${userId}, Dietician ID: ${dieticianId}`);

    // 3. Run Counts using the CORRECT ID for each table
    const statsQuery = `
        SELECT
            -- 1. Active Clients (Linked via User ID in 'dietician_clients')
            (SELECT COUNT(*) FROM dietician_clients WHERE dietician_id = $2) as active_clients,
            
            -- 2. Meal Plans (Linked via Dietician ID in 'meal_plans')
            (SELECT COUNT(*) FROM meal_plans WHERE dietician_id = $1) as total_meal_plans,
            
            -- 3. Today's Sessions (Linked via Dietician ID in 'consultations')
            (SELECT COUNT(*) FROM consultations WHERE dietician_id = $1 AND scheduled_date = CURRENT_DATE) as today_sessions
    `;

    
    const result = await pool.query(statsQuery, [dieticianId, userId]);
    const stats = result.rows[0];

    res.json({
        data: {
            active_clients: Number(stats.active_clients),
            total_meal_plans: Number(stats.total_meal_plans),
            today_sessions: Number(stats.today_sessions)
        }
    });
});
