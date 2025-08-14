
import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRoutes from "../src/routes/usersRoutes"
import MealLogRoutes from "../src/routes/mealLogRoutes"
import recipeRoutes from "../src/routes/recipesRoutes"
import instructorRoutes from "../src/routes/instructorRoutes"
import workoutRoutes from "../src/routes/workoutRoutes"
import progressLogRoutes from "../src/routes/progressLogsRoutes"
import messageRoutes from "../src/routes/messagesRoutes"
import chatHistoryRoutes from "../src/routes/chatHistoryRoutes"
import communityPostRoutes from "../src/routes/communityPostRoutes"
import adminRoutes from "../src/routes/adminRoutes"
import notificationRoutes from "../src/routes/notificationRoutes"
import authRoutes from "../src/routes/authRoutes"
import dieticianRoutes from "../src/routes/dieticianRoutes"
import chatRoutes from "../src/routes/chatRoutes"



//configure the dotenv
dotenv.config()

//instance of express
const app=express()

//middlewares
app.use(express.json())//for parsing application/json3
app.use(express.urlencoded({extended:true}))// for parsing application/x-www-form-urlencoded
app.use(cookieParser()) || 3000

//CORS configuration
app.use(cors({
    origin:"http://localhost:5173",
    methods:"GET,PUT,DELETE",
    credentials:true
}))


app.use("/auth",authRoutes)
app.use("/users",userRoutes);
app.use("/mealLogs",MealLogRoutes)
app.use("/recipes",recipeRoutes)
app.use("/instructors",instructorRoutes)
app.use("/workout",workoutRoutes)
app.use("/progress",progressLogRoutes)
app.use("/messages",messageRoutes)
app.use("/chathistory",chatHistoryRoutes)
app.use("/posts",communityPostRoutes)
app.use("/admin",adminRoutes)
app.use("/notification",notificationRoutes)
app.use("/dietician",dieticianRoutes)
app.use("/chat",chatRoutes)

const port =process.env.PORT 

app.listen(port ,()=>{
    console.log(`Server is running on port ${port}`)
})