import dotenv from 'dotenv'
dotenv.config()
import express from 'express'

// import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import mealLogsRoutes from './routes/mealLogsRoutes'








const app = express()


app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 

// app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    methods: "POST,GET, PUT,PATCH,DELETE",
    credentials: true 
}))


//4. routes 
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/mealLogs", mealLogsRoutes)
// app.use("/api/v1/borrows", borrowRoutes)
// app.use("/api/v1/summary", bookSummaryRoutes)
// app.use("/api/v1/bookCopies", copiesRoutes)





const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`🚀🚀 server is running on port - ${PORT}`)
})
