import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";


export const assignWorkoutToClient = asyncHandler(async (req: Request, res: Response) => {
  const { client_id, workout_id, instructor_id, status, notes } = req.body;

  if (!client_id || !workout_id || !instructor_id) {
    res.status(400).json({ message: "client_id, workout_id, and instructor_id are required" });
    return;
  }

  // prevent duplicate assignment
  const existing = await pool.query(
    `SELECT * FROM client_workouts WHERE client_id = $1 AND workout_id = $2 AND instructor_id = $3`,
    [client_id, workout_id, instructor_id]
  );

  if (existing.rows.length > 0) {
    res.status(400).json({ message: "Workout already assigned to this client by this instructor" });
    return;
  }

  const result = await pool.query(
    `INSERT INTO client_workouts (client_id, workout_id, instructor_id, status, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [client_id, workout_id, instructor_id, status || "scheduled", notes || null]
  );

  res.status(201).json({
    message: "Workout assigned to client successfully",
    assignment: result.rows[0],
  });
});


export const getClientWorkouts = asyncHandler(async (req: Request, res: Response) => {
  const { client_id, instructor_id } = req.query;

  let query = `
    SELECT cw.*,
           w.plan,
           w.created_at,
           cu.name AS client_name,
           iu.name AS instructor_name
    FROM client_workouts cw
    JOIN workouts w ON cw.workout_id = w.workout_id
    JOIN clients c ON cw.client_id = c.user_id         -- ensure only real clients
    JOIN users cu ON c.user_id = cu.user_id            -- client info
    JOIN instructors i ON cw.instructor_id = i.instructor_id
    JOIN users iu ON i.user_id = iu.user_id            -- instructor info
  `;

  const values: any[] = [];
  const conditions: string[] = [];

  if (client_id) {
    values.push(client_id);
    conditions.push(`cw.client_id = $${values.length}`);
  }
  if (instructor_id) {
    values.push(instructor_id);
    conditions.push(`cw.instructor_id = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY cw.assigned_date DESC`;

  const result = await pool.query(query, values);

  res.status(200).json(result.rows);
});

export const getInstructorClients = asyncHandler(async (req: Request, res: Response) => {
  const { instructor_id } = req.params;

  const query = `
    SELECT DISTINCT 
           c.user_id AS client_id,
           u.name AS client_name,
           u.email,
           c.age,
           c.gender,
           c.weight,
           c.height,
           c.weight_goal,
           c.budget,
           c.location
    FROM client_workouts cw
    JOIN clients c ON cw.client_id = c.user_id
    JOIN users u ON c.user_id = u.user_id
    WHERE cw.instructor_id = $1
    ORDER BY u.name ASC
  `;

  const result = await pool.query(query, [instructor_id]);

  res.status(200).json(result.rows);
});





export const getClientWorkoutById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    SELECT cw.*,
           w.plan,
           w.created_at,
           cu.name AS client_name,
           iu.name AS instructor_name
    FROM client_workouts cw
    JOIN workouts w ON cw.workout_id = w.workout_id
    -- Ensure client is from clients table
    JOIN clients c ON cw.client_id = c.user_id
    JOIN users cu ON c.user_id = cu.user_id
    -- Ensure instructor is from instructors table
    JOIN instructors i ON cw.instructor_id = i.instructor_id
    JOIN users iu ON i.user_id = iu.user_id
    WHERE cw.id = $1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Client workout not found" });
  }

  res.status(200).json(result.rows[0]);
});


export const updateClientWorkoutStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  // First, make sure the workout exists and belongs to a valid client + instructor
  const checkResult = await pool.query(
    `
    SELECT cw.id
    FROM client_workouts cw
    JOIN clients c ON cw.client_id = c.user_id
    JOIN instructors i ON cw.instructor_id = i.instructor_id
    WHERE cw.id = $1
    `,
    [id]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ message: "Client workout not found or invalid client/instructor" });
  }

  // Now update
  const result = await pool.query(
    `
    UPDATE client_workouts
    SET status = COALESCE($1, status),
        notes = COALESCE($2, notes)
    WHERE id = $3
    RETURNING *
    `,
    [status, notes, id]
  );

  res.status(200).json(result.rows[0]);
});


// ✅ Delete client workout assignment
export const deleteClientWorkout = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `DELETE FROM client_workouts WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Client workout not found" });
    return;
  }

  res.status(200).json({ message: "Client workout unassigned successfully" });
});


export const getClientDashboardWorkouts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // This will be the client's user_id

  const query = `
    SELECT 
        cw.id AS assignment_id,
        cw.status,
        cw.assigned_date,
        cw.notes,
        w.workout_id,
        w.title,
        w.description,
        w.plan, 
        iu.name AS instructor_name
    FROM client_workouts cw
    JOIN workouts w ON cw.workout_id = w.workout_id
    JOIN instructors i ON cw.instructor_id = i.instructor_id
    JOIN users iu ON i.user_id = iu.user_id
    WHERE cw.client_id = $1
    ORDER BY cw.assigned_date DESC
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    // Return empty array instead of 404 so the frontend just shows "No plans"
    return res.status(200).json([]); 
  }

  res.status(200).json(result.rows);
});


export const getClientAssignedWorkoutsDetails = async (req: Request, res: Response) => {
  const { clientId } = req.params;

  try {
    const query = `
      SELECT 
        cw.id AS assignment_id,
        cw.status,
        cw.assigned_date,
        cw.notes AS instructor_notes, -- The note from the instructor
        w.title,
        w.description,
        w.plan, -- This contains the JSON list of exercises (reps, sets, etc.)
        u.name AS instructor_name
      FROM client_workouts cw
      JOIN workouts w ON cw.workout_id = w.workout_id
      JOIN instructors i ON cw.instructor_id = i.instructor_id
      JOIN users u ON i.user_id = u.user_id
      WHERE cw.client_id = $1
      ORDER BY cw.assigned_date DESC
    `;

    const result = await pool.query(query, [clientId]);
    
    // Return empty array if no workouts found (not 404)
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Error fetching client assigned workouts:", error);
    res.status(500).json({ message: "Server error fetching workouts" });
  }
};
