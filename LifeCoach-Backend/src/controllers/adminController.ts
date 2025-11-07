import { Request, Response } from 'express'
import pool from "../db.config"
import asyncHandler from '../middlewares/asyncHandler'
// Get all admins
export const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM Admins')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error while fetching admins' })
  }
})
// Get a single admin by ID
export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM Admins WHERE id = $1', [id])
    if (result.rows.length === 0) {
       res.status(404).json({ error: 'Admin not found' })
       return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Create new admin
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, permissions, last_login } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO Admins (user_id, permissions, last_login) VALUES ($1, $2, $3) RETURNING *',
      [user_id, permissions, last_login]
    )
    res.status(201).json(result.rows[0])
  } catch (err: any) {
    console.error(err)
    if (err.code === '23505') {
      res.status(400).json({ error: 'Admin with this user_id already exists' })
    } else {
      res.status(500).json({ error: 'Server error while creating admin' })
    }
  }
})

// Update admin
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { permissions, last_login } = req.body
  try {
    const result = await pool.query(
      'UPDATE Admins SET permissions = $1, last_login = $2 WHERE id = $3 RETURNING *',
      [permissions, last_login, id]
    )
    if (result.rows.length === 0) {
       res.status(404).json({ error: 'Admin not found' })
       return
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error while updating admin' })
  }
})

// Delete admin
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM Admins WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
     res.status(404).json({ error: 'Admin not found' })
     return
    }
    res.json({ message: 'Admin deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error while deleting admin' })
  }
})


export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    // Run all queries in parallel
    const [clients, instructors, dieticians] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total_clients FROM users WHERE role_id = 5"),
      pool.query("SELECT COUNT(*) AS total_instructors FROM users WHERE role_id = 3"),
      pool.query("SELECT COUNT(*) AS total_dieticians FROM users WHERE role_id = 4"),
    ]);

    // Combine instructor + dietician counts as "verified experts"
    const totalClients = parseInt(clients.rows[0].total_clients, 10);
    const verifiedExperts =
      parseInt(instructors.rows[0].total_instructors, 10) +
      parseInt(dieticians.rows[0].total_dieticians, 10);

    // If you have an approval column (e.g., is_verified / approved)
    // use it here; otherwise simulate for now:
    const pendingApprovals = 7;

    // If you don’t have workout streak tracking, we’ll simulate this too:
    const avgWorkoutStreak = 5.2;

    res.json({
      totalClients,
      verifiedExperts,
      pendingApprovals,
      avgStreak: avgWorkoutStreak,
    });
  } catch (err) {
    console.error("Error fetching overview stats:", err);
    res.status(500).json({ error: "Server error fetching stats" });
  }
};


// ✅ Get all users (for admin dashboard)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
          user_id, 
          name, 
          email, 
          role_id, 
          profile_complete, 
          created_at
       FROM users
       ORDER BY created_at DESC
        LIMIT 5`
      
    );

    const users = result.rows.map((u) => ({
      id: u.user_id,
      name: u.name,
      email: u.email,
      role:
        u.role_id === 3
          ? "Instructor"
          : u.role_id === 4
          ? "Dietician"
          : u.role_id === 5
          ? "Client"
          : "Other",
      status: u.profile_complete ? "Verified" : "Pending",
      joined: new Date(u.created_at).toISOString().split("T")[0],
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
