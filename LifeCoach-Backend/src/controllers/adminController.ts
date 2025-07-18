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
