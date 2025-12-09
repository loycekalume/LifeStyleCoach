import { Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// @desc    Create a new consultation
// @route   POST /api/consultations
export const createConsultation = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // Get dietician_id from the authenticated user
    const dieticianQuery = await pool.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    const dietician_id = dieticianQuery.rows[0].dietician_id;

    const { client_id, scheduled_date, scheduled_time, category, notes, status } = req.body;

    // Basic validation
    if (!client_id || !scheduled_date || !scheduled_time || !category) {
      return res.status(400).json({ 
        message: "Client ID, scheduled date, scheduled time, and category are required" 
      });
    }

    // Verify client exists
    const clientCheck = await pool.query(
      "SELECT user_id FROM users WHERE user_id = $1",
      [client_id]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    const newConsultation = await pool.query(
      `INSERT INTO consultations (dietician_id, client_id, scheduled_date, scheduled_time, category, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [dietician_id, client_id, scheduled_date, scheduled_time, category, notes, status || 'scheduled']
    );

    res.status(201).json({
      message: "Consultation created successfully",
      consultation: newConsultation.rows[0],
    });
  } catch (error) {
    console.error("Error creating consultation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get all consultations for the authenticated dietician
// @route   GET /api/consultations
export const getMyConsultations = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // Get dietician_id from the authenticated user
    const dieticianQuery = await pool.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    const dietician_id = dieticianQuery.rows[0].dietician_id;

    // Optional query parameters for filtering
    const { status, date, client_id } = req.query;

    let query = `
      SELECT 
        c.consultation_id as id,
        c.client_id,
        u.name as client_name,
        u.email as client_email,
        c.scheduled_date,
        c.scheduled_time,
        c.category,
        c.notes,
        c.status,
        c.created_at,
        c.updated_at
      FROM consultations c
      LEFT JOIN users u ON c.client_id = u.user_id
      WHERE c.dietician_id = $1
    `;

    const queryParams: any[] = [dietician_id];
    let paramIndex = 2;

    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (date) {
      query += ` AND c.scheduled_date = $${paramIndex}`;
      queryParams.push(date);
      paramIndex++;
    }

    if (client_id) {
      query += ` AND c.client_id = $${paramIndex}`;
      queryParams.push(client_id);
      paramIndex++;
    }

    query += ` ORDER BY c.scheduled_date DESC, c.scheduled_time DESC`;

    const result = await pool.query(query, queryParams);

    res.status(200).json({
      message: "Consultations retrieved successfully",
      consultations: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving consultations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get consultations for a specific client
// @route   GET /api/consultations/client/:clientId
export const getClientConsultations = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      `SELECT 
         c.consultation_id as id,
         c.dietician_id,
         u.name as dietician_name,
         u.email as dietician_email,
         c.scheduled_date,
         c.scheduled_time,
         c.category,
         c.notes,
         c.status,
         c.created_at,
         c.updated_at
       FROM consultations c
       LEFT JOIN dieticians d ON c.dietician_id = d.dietician_id
       LEFT JOIN users u ON d.user_id = u.user_id
       WHERE c.client_id = $1
       ORDER BY c.scheduled_date DESC, c.scheduled_time DESC`,
      [clientId]
    );

    res.status(200).json({
      message: "Client consultations retrieved successfully",
      consultations: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving client consultations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get a single consultation by ID
// @route   GET /api/consultations/:id
export const getConsultationById = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         c.consultation_id as id,
         c.dietician_id,
         du.name as dietician_name,
         du.email as dietician_email,
         c.client_id,
         cu.name as client_name,
         cu.email as client_email,
         c.scheduled_date,
         c.scheduled_time,
         c.category,
         c.notes,
         c.status,
         c.created_at,
         c.updated_at
       FROM consultations c
       LEFT JOIN dieticians d ON c.dietician_id = d.dietician_id
       LEFT JOIN users du ON d.user_id = du.user_id
       LEFT JOIN users cu ON c.client_id = cu.user_id
       WHERE c.consultation_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.status(200).json({
      message: "Consultation retrieved successfully",
      consultation: result.rows[0],
    });
  } catch (error) {
    console.error("Error retrieving consultation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Update a consultation
// @route   PUT /api/consultations/:id
export const updateConsultation = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduled_date, scheduled_time, category, notes, status } = req.body;

    const updatedConsultation = await pool.query(
      `UPDATE consultations
       SET scheduled_date = COALESCE($1, scheduled_date),
           scheduled_time = COALESCE($2, scheduled_time),
           category = COALESCE($3, category),
           notes = COALESCE($4, notes),
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE consultation_id = $6
       RETURNING 
         consultation_id as id,
         dietician_id,
         client_id,
         scheduled_date,
         scheduled_time,
         category,
         notes,
         status,
         created_at,
         updated_at`,
      [scheduled_date, scheduled_time, category, notes, status, id]
    );

    if (updatedConsultation.rowCount === 0) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.status(200).json({
      message: "Consultation updated successfully",
      consultation: updatedConsultation.rows[0],
    });
  } catch (error) {
    console.error("Error updating consultation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Update consultation status
// @route   PATCH /api/consultations/:id/status
export const updateConsultationStatus = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Validate status
    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: scheduled, completed, cancelled" 
      });
    }

    const updatedConsultation = await pool.query(
      `UPDATE consultations
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE consultation_id = $2
       RETURNING 
         consultation_id as id,
         status,
         updated_at`,
      [status, id]
    );

    if (updatedConsultation.rowCount === 0) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.status(200).json({
      message: "Consultation status updated successfully",
      consultation: updatedConsultation.rows[0],
    });
  } catch (error) {
    console.error("Error updating consultation status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Delete a consultation
// @route   DELETE /api/consultations/:id
export const deleteConsultation = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM consultations WHERE consultation_id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.status(200).json({ message: "Consultation deleted successfully" });
  } catch (error) {
    console.error("Error deleting consultation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc    Get upcoming consultations for the authenticated dietician
// @route   GET /api/consultations/upcoming
export const getUpcomingConsultations = asyncHandler(async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    // Get dietician_id from the authenticated user
    const dieticianQuery = await pool.query(
      "SELECT dietician_id FROM dieticians WHERE user_id = $1",
      [userId]
    );

    if (dieticianQuery.rows.length === 0) {
      return res.status(404).json({ message: "Dietician profile not found" });
    }

    const dietician_id = dieticianQuery.rows[0].dietician_id;

    const result = await pool.query(
      `SELECT 
         c.consultation_id as id,
         c.client_id,
         u.name as client_name,
         u.email as client_email,
         c.scheduled_date,
         c.scheduled_time,
         c.category,
         c.notes,
         c.status,
         c.created_at,
         c.updated_at
       FROM consultations c
       LEFT JOIN users u ON c.client_id = u.user_id
       WHERE c.dietician_id = $1 
         AND c.scheduled_date >= CURRENT_DATE
         AND c.status = 'scheduled'
       ORDER BY c.scheduled_date ASC, c.scheduled_time ASC`,
      [dietician_id]
    );

    res.status(200).json({
      message: "Upcoming consultations retrieved successfully",
      consultations: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving upcoming consultations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});