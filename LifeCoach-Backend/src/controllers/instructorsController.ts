import { Request, Response } from "express"
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler"

export const addInstructor = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      specialization, // Format: {"item1", "item2"}
      website_url,
      certifications, // Format: {"item1", "item2"}
      years_of_experience,
      profile_title,
      coaching_mode, // Format: 'onsite', 'remote', or 'both'
      bio,
      available_locations // Format: {"item1", "item2"}
    } = req.body

    // 1. User validation
    const user = await pool.query("SELECT * FROM users WHERE user_id=$1", [user_id])

    if (!user.rows.length || user.rows[0].role_id !== 3) {
      return res.status(400).json({ message: "User is not an instructor" });
    }

    // 2. Define the Query and Parameters clearly
    const queryText = `
        INSERT INTO instructors(
            user_id,
            specialization,
            website_url,
            certifications,
            years_of_experience,
            profile_title,
            coaching_mode,
            bio,
            available_locations) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *
    `;

    const queryParams = [
      user_id,
      specialization,
      website_url,
      certifications,
      years_of_experience,
      profile_title,
      coaching_mode,
      bio,
      available_locations
    ];

    // 3. Execute INSERT Instructor Profile Data
    const result = await pool.query(queryText, queryParams);

    // 4. Mark the user profile as complete 
    await pool.query(
      "UPDATE users SET profile_complete = TRUE WHERE user_id = $1",
      [user_id]
    );

    res.status(200).json({
      message: "Instructor profile successfully completed and saved",
      instructor: result.rows[0]
    })

  } catch (error) {
    console.error("Error adding instructor:", error);
    res.status(500).json({ message: "Internal server error" })
  }
})

// ... (rest of the controller functions remain the same)


export const getInstructors = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM instructors ")

    res.status(200).json({
      message: "Instructors retrieved",
      instructor: result.rows
    })
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Internal server error" })
  }
})
export const getInstuctorById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM instructors WHERE instructor_id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ message: "Instructor not found" });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching instructor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const updateInstructor = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      specialization,
      website_url,
      certifications,
      years_of_experience,
      profile_title,
      coaching_mode,
      bio,
      available_locations
    } = req.body;

    //  Check if instructor exists
    const instructor = await pool.query(
      "SELECT * FROM instructors WHERE instructor_id=$1",
      [id]
    );

    if (instructor.rows.length === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Update instructor
    const result = await pool.query(
      `UPDATE instructors 
       SET 
        specialization = COALESCE($1, specialization),
        website_url = COALESCE($2, website_url),
        certifications = COALESCE($3, certifications),
        years_of_experience = COALESCE($4,years_of_experience),
        profile_title = COALESCE($5, profile_title),
        coaching_mode = COALESCE($6, coaching_mode),
        bio = COALESCE($7, bio),
        available_locations = COALESCE($8, available_locations)        
       WHERE instructor_id = $9
       RETURNING *`,
      [
        specialization,
        website_url,
        certifications,
        years_of_experience,
        profile_title,
        coaching_mode,
        bio,
        available_locations,
        id
      ]
    );

    res.status(200).json({
      message: "Instructor updated successfully",
      instructor: result.rows[0],
    });

  } catch (error) {
    console.error("Error updating instructor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const deleteInstuctor = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await pool.query(`DELETE  FROM instructors where instructor_id=$1 RETURNING *`, [id])
    if (result.rows.length === 0) {
      res.status(400).json({ message: "Instructor Not found" });
      return
    }
    res.status(200).json({ message: "instuctor successfully deleted" })
  } catch (error) {
    console.error("Error adding instuctor:", error);
    res.status(500).json({ message: "Internal server error" })
  }
})

export const getInstructorContact = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.name, u.email, u.contact, i.website_url, i.availability, i.coaching_mode FROM instructors i JOIN users u ON i.user_id = u.user_id WHERE i.instructor_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Instructor not found" });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching instructor contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
export const updateInstructorContact = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { website_url, availability, coaching_mode } = req.body;

    const result = await pool.query(
      `UPDATE instructors
       SET website_url = COALESCE($1, website_url),
       availability = COALESCE($2, availability),
       coaching_mode = COALESCE($3, coaching_mode)
       WHERE instructor_id = $4
       RETURNING *`,
      [website_url, availability, coaching_mode, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Instructor not found" });
      return;
    }

    res.status(200).json({
      message: "Instructor contact updated successfully",
      instructor: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating instructor contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Fetch instructor's specializations & certifications
export const getInstructorSpecializations = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    SELECT specialization, certifications
    FROM instructors
    WHERE instructor_id = $1
 `,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Instructor not found" });
    return;
  }

  res.status(200).json(result.rows[0]);
});

//  Get pricing for one instructor
export const getInstructorPricing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT pricing_id, session_type, price, unit 
     FROM instructor_pricing 
     WHERE instructor_id = $1`,
    [id]
  );

  res.status(200).json(result.rows);
});

//  Add a new pricing option
export const addPricingOption = asyncHandler(async (req: Request, res: Response) => {
  const { instructor_id, session_type, price, unit } = req.body;

  const result = await pool.query(
    `INSERT INTO instructor_pricing (instructor_id, session_type, price, unit)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [instructor_id, session_type, price, unit]
  );

  res.status(201).json({
    message: "Pricing option added successfully",
    pricing: result.rows[0]
  });
});

//  Update a pricing option
export const updatePricingOption = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { session_type, price, unit } = req.body;

  const result = await pool.query(
    `UPDATE instructor_pricing
     SET session_type = COALESCE($1, session_type),
         price = COALESCE($2, price),
         unit = COALESCE($3, unit)
     WHERE pricing_id = $4
     RETURNING *`,
    [session_type, price, unit, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Pricing option not found" });
  }

  res.status(200).json({
    message: "Pricing option updated successfully",
    pricing: result.rows[0]
  });
});

//  Delete a pricing option
export const deletePricingOption = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `DELETE FROM instructor_pricing WHERE pricing_id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Pricing option not found" });
  }

  res.status(200).json({ message: "Pricing option deleted" });
});

export const getInstructorProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
  
    // ✅ FIX: Consolidated query string to a single line to prevent syntax errors caused by newline/tabs
    const result = await pool.query(
      `SELECT u.name, i.profile_title, i.years_of_experience, i.available_locations, i.bio, i.coaching_mode FROM instructors i JOIN users u ON u.user_id = i.user_id WHERE i.instructor_id = $1`,
      [id] 
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.status(200).json({
      message: "Instructor profile fetched successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching instructor profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export const updateInstructorProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      profile_title,
      years_of_experience,
      available_locations,
      bio,
      coaching_mode,
    } = req.body;

    // ✅ Check if instructor exists
    const existingInstructor = await pool.query(
      `SELECT * FROM instructors WHERE instructor_id = $1`,
      [id]
    );

    if (existingInstructor.rows.length === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // ✅ Start transaction
    await pool.query("BEGIN");

    // ✅ Update users table (for name)
    await pool.query(
      `
      UPDATE users 
      SET name = COALESCE($1, name)
      WHERE user_id = (SELECT user_id FROM instructors WHERE instructor_id = $2)
      `,
      [name, id]
    );

    // ✅ Update instructors table
    await pool.query(
      `
      UPDATE instructors 
      SET 
        profile_title = COALESCE($1, profile_title),
        years_of_experience = COALESCE($2, years_of_experience),
        available_locations = COALESCE($3, available_locations),
        bio = COALESCE($4, bio),
        coaching_mode = COALESCE($5, coaching_mode)
      WHERE instructor_id = $6
      `,
      [
        profile_title,
        years_of_experience,
        available_locations,
        bio,
        coaching_mode,
        id,
      ]
    );

    // ✅ Fetch updated joined record (to include user's name)
    const updatedProfile = await pool.query(
      `
      SELECT 
        u.name,
        i.profile_title,
        i.years_of_experience,
        i.available_locations,
        i.bio,
        i.coaching_mode
      FROM instructors i
      JOIN users u ON u.user_id = i.user_id
      WHERE i.instructor_id = $1
      `,
      [id]
    );

    await pool.query("COMMIT");

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error updating instructor profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

