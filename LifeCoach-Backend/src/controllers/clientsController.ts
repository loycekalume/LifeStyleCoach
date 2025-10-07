import { Request, Response } from "express";
import pool from "../db.config";
import asyncHandler from "../middlewares/asyncHandler";


export const upsertClient = asyncHandler(async (req: Request, res: Response) => {
 
  const { user_id, age, weight, height, goal, gender, allergies, budget, location } = req.body;

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

  res.status(200).json({
    message: "Client profile saved successfully",
    client: result.rows[0],
  });
});


//  Get all clients
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