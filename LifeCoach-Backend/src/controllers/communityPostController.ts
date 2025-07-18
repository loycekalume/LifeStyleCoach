import { Request, Response } from "express";
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler";

export const addPost = asyncHandler( async (req: Request, res: Response) => {
    try {
        const { user_id, title, body, likes, tags } = req.body
        const result = await pool.query(`INSERT INTO CommunityPosts
        (user_id,title,body,likes,tags)VALUES($1,$2,$3,$4,$5) RETURNING *`,
            [user_id, title, body, likes, tags])
        res.status(200).json({
            message: "Post added successfully",
            post: result.rows[0]
        })
    } catch (error) {
        console.error("Error adding post")
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
    try {

        const result = await pool.query(`SELECT * FROM CommunityPosts`)
        res.status(200).json({
            message: "Posts Retrieved",
            posts: result.rows
        })
    } catch (error) {
        console.error("Error retrieving post")
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
    try {

        const { id } = req.params
        const result = await pool.query(`SELECT * FROM CommunityPosts WHERE id=$1`, [id])
        if (result.rowCount === 0) {
            res.status(400).json({ message: "Post not found" })
        }
        res.status(200).json({
            message: "Post Retrieved",
            post: result.rows[0]
        })

    } catch (error) {
        console.error("Error retrieving post")
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const getPostByUserId =asyncHandler( async (req: Request, res: Response) => {
    try {

        const { user_id } = req.params
        const result = await pool.query(`SELECT * FROM CommunityPosts WHERE user_id=$1`, [user_id])
        if (result.rowCount === 0) {
            res.status(400).json({ message: "Post not found" })
        }
        res.status(200).json({
            message: "Post Retrieved",
            post: result.rows[0]
        })

    } catch (error) {
        console.error("Error retrieving post")
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query(`DELETE FROM CommunityPosts WHERE id=$1`, [id])

        if (result.rowCount === 0) {
            res.status(400).json({ message: "Post not found" })
        }
        res.status(200).json({
            message: "post deleted",
            post: result.rows[0]
        })
    } catch (error) {
        console.error("Error deleting post")
        res.status(500).json({ message: "Internal Server Error" })
    }
})