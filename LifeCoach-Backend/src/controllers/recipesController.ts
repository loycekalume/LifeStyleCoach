import { Request, Response } from "express";
import pool from "../db.config"
import asyncHandler from "../middlewares/asyncHandler";


export const addRecipe = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { name, ingredients, instructions, calories, cuisine_type, suitable_for } = req.body
        const result = await pool.query(
            `INSERT INTO recipes(name,ingredients,instructions,calories,cuisine_type,suitable_for)
            VALUES($1,$2,$3,$4,$5,$6) RETURNING *`, [name, ingredients, instructions, calories, cuisine_type, suitable_for])

        res.status(201).json({
            message: "Recipe created successfully",
            recipe: result.rows[0]
        })
    } catch (error) {
        console.error("Error creating recipe", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})

export const getRecipe= asyncHandler(async(req:Request,res:Response)=>{
    try {
        const result=await pool.query(`SELECT * FROM recipes`)
      
        res.status(200).json(result.rows)
    } catch (error) {
         console.error("Error getting recipes", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})
export const getRecipeById= asyncHandler(async(req:Request,res:Response)=>{
    try {
        const {id}=req.params
        const result=await pool.query(`SELECT * FROM recipes WHERE recipe_id=$1`,[id])
        if(result.rows.length ===0){
            res.status(400).json({message:"Recipe not found"})
        }
        res.status(200).json(result.rows[0])
    } catch (error) {
         console.error("Error creating recipe", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})

export const deleteRecipe = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const result = await pool.query("DELETE FROM recipes where recipe_id=$1 RETURNING *", [id])
        if (result.rows.length === 0) {
            res.status(400).json({ message: "recipe not found" })
        }
        res.status(200).json({ message: "recipe deleted" })
    } catch (error) {
        console.error("Error deleting recipe")
        res.status(500).json({message:"Internal server error"})
    }
})

