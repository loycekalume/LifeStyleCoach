import express from 'express'
import { addRecipe, deleteRecipe, getRecipe, getRecipeById } from '../controllers/recipesController'

 const router=express.Router()

 router.post("/",addRecipe)
 router.get("/",getRecipe)
 router.get("/:id",getRecipeById)
 router.delete("/:id",deleteRecipe)


 export default router