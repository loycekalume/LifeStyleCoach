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
    // 1. Run all queries in parallel
    const [clientsRes, instructorsRes, dieticiansRes, allUsersRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role_id = 5"), // Clients
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role_id = 3"), // Instructors
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role_id = 4"), // Dieticians
      pool.query("SELECT COUNT(*) AS count FROM users")                    // All Users
    ]);

    // 2. Extract the numbers (Postgres returns counts as strings)
    const totalClients = parseInt(clientsRes.rows[0].count, 10);
    const totalInstructors = parseInt(instructorsRes.rows[0].count, 10);
    const totalDieticians = parseInt(dieticiansRes.rows[0].count, 10);
    
    // ✅ THIS FIXES THE 5.2 ISSUE:
    const totalUsers = parseInt(allUsersRes.rows[0].count, 10); 

    // 3. Send the response
    res.json({
      totalClients,
      verifiedExperts: totalInstructors,   
      pendingApprovals: totalDieticians,   
      avgStreak: totalUsers  // We map "Total Users" to this field
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

export const getUserEngagement = asyncHandler(async (req: Request, res: Response) => {
  try {
    const query = `
      WITH last_7_days AS (
          -- 1. Generate the last 7 dates
          SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS date
      ),
      daily_meals AS (
          -- 2. Count meals per day
          SELECT log_date AS date, COUNT(*) AS count 
          FROM meal_logs 
          WHERE log_date >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY log_date
      ),
      daily_workouts AS (
          -- 3. Count workouts per day
          SELECT date_completed::date AS date, COUNT(*) AS count 
          FROM workout_logs 
          WHERE date_completed >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY date_completed::date
      ),
      daily_users AS (
          -- 4. Count new signups per day
          SELECT created_at::date AS date, COUNT(*) AS count 
          FROM users 
          WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY created_at::date
      )
      -- 5. Join everything together
      SELECT 
          TO_CHAR(d.date, 'Dy') AS label,  -- Returns 'Mon', 'Tue', etc.
          COALESCE(m.count, 0) AS meal_logs,
          COALESCE(w.count, 0) AS workouts,
          COALESCE(u.count, 0) AS new_users
      FROM last_7_days d
      LEFT JOIN daily_meals m ON d.date = m.date
      LEFT JOIN daily_workouts w ON d.date = w.date
      LEFT JOIN daily_users u ON d.date = u.date
      ORDER BY d.date ASC;
    `;

    const result = await pool.query(query);

    // 6. Format the data for Chart.js (Split rows into separate arrays)
    const data = {
      labels: result.rows.map(row => row.label),
      mealLogs: result.rows.map(row => parseInt(row.meal_logs, 10)),
      workouts: result.rows.map(row => parseInt(row.workouts, 10)),
      newUsers: result.rows.map(row => parseInt(row.new_users, 10))
    };

    res.json(data);

  } catch (err) {
    console.error("Error fetching engagement stats:", err);
    res.status(500).json({ error: "Server error fetching engagement stats" });
  }
});