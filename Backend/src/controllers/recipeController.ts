import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// CREATE RECIPE
export const createRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { name, ingredients, instructions, calories, cuisine_type, suitable_for } = req.body;

  if (!name || !ingredients || !instructions) {
    return res.status(400).json({ message: "Please provide name, ingredients, and instructions" });
  }

  const result = await pool.query(
    `INSERT INTO recipes (name, ingredients, instructions, calories, cuisine_type, suitable_for)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, ingredients, instructions, calories, cuisine_type, suitable_for]
  );

  res.status(201).json({ message: "Recipe created successfully", recipe: result.rows[0] });
});

// GET ALL RECIPES
export const getAllRecipes = asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query(`SELECT * FROM recipes ORDER BY created_at DESC`);
  res.status(200).json({ count: result.rows.length, recipes: result.rows });
});

// GET SINGLE RECIPE
export const getSingleRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { recipe_id } = req.params;

  const result = await pool.query(`SELECT * FROM recipes WHERE recipe_id = $1`, [recipe_id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  res.status(200).json({ recipe: result.rows[0] });
});

// UPDATE RECIPE
export const updateRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { recipe_id } = req.params;
  const { name, ingredients, instructions, calories, cuisine_type, suitable_for } = req.body;

  const result = await pool.query(
    `UPDATE recipes
     SET name = $1, ingredients = $2, instructions = $3, calories = $4, cuisine_type = $5, suitable_for = $6
     WHERE recipe_id = $7
     RETURNING *`,
    [name, ingredients, instructions, calories, cuisine_type, suitable_for, recipe_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  res.status(200).json({ message: "Recipe updated successfully", recipe: result.rows[0] });
});

// DELETE RECIPE
export const deleteRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { recipe_id } = req.params;

  const result = await pool.query(`DELETE FROM recipes WHERE recipe_id = $1 RETURNING *`, [recipe_id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Recipe not found" });
  }

  res.status(200).json({ message: "Recipe deleted successfully" });
});
