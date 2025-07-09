import express from "express";
import {
  createRecipe,
  getAllRecipes,
  getSingleRecipe,
  updateRecipe,
  deleteRecipe
} from "../controllers/recipeController";

const router = express.Router();

router.post("/", createRecipe);
router.get("/", getAllRecipes);
router.get("/:recipe_id", getSingleRecipe);
router.put("/:recipe_id", updateRecipe);
router.delete("/:recipe_id", deleteRecipe);

export default router;
