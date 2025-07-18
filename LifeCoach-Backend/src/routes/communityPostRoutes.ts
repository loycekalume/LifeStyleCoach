import express from "express"
import { addPost, deletePost, getPostById, getPostByUserId, getPosts } from "../controllers/communityPostController"

const router=express.Router()

router.post("/",addPost)
router.get("/",getPosts)
router.get("/:id",getPostById)
router.get("/users/:user_id",getPostByUserId)
router.delete("/:id",deletePost)

export default router;