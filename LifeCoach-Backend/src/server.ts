import express from "express";
import http from "http"; // 1. IMPORT HTTP
import { Server } from "socket.io"; // 2. IMPORT SOCKET.IO
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import pool from "./db.config";

// Routes imports
import userRoutes from "./routes/usersRoutes";
import MealLogRoutes from "./routes/mealLogRoutes";
import recipeRoutes from "./routes/recipesRoutes";
import instructorRoutes from "./routes/instructorRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import progressLogRoutes from "./routes/progressLogsRoutes";
import messageRoutes from "./routes/messagesRoutes";
import chatHistoryRoutes from "./routes/chatHistoryRoutes";
import communityPostRoutes from "./routes/communityPostRoutes";
import adminRoutes from "./routes/adminRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import authRoutes from "./routes/authRoutes";
import dieticianRoutes from "./routes/dieticianRoutes";
import chatRoutes from "./routes/chatRoutes";
import clientWorkoutRoutes from "./routes/clientWorkoutRoutes";
import clientRoutes from "./routes/clientRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import mealplanRoutes from "./routes/mealplanRoutes";
import dieticianSchedules from "./routes/dieticianSchedules";
import recommendedWorkoutRoutes from "./routes/recommendedWorkoutRoutes";
import workoutLogRoutes from "./routes/workoutLogRoutes";
import recommendedMealplans from "./routes/recommendedMealplans";
import recommendedMeal from "./routes/recommendedMeal";
import matchInstructorRoutes from "./routes/matchInstructorRoutes";
import chatui from "./routes/chatui";
import instructorClients from "./routes/instructorClients"
// Configure dotenv
dotenv.config();

// Instance of express
const app = express();

// 3. CREATE HTTP SERVER (Wraps Express)
const server = http.createServer(app);
app.use(express.urlencoded({ extended: true }));
// 4. INITIALIZE SOCKET.IO
const io = new Server(server, {
    cors: {
        origin: [
        "http://localhost:5173",             // Local Frontend
        "https://life-style-coach.vercel.app" // Production Frontend
    ], // Your frontend URL
        methods:"GET,PUT,DELETE,POST,PATCH",
        credentials: true
    }
});

// Middlewares
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration (For REST API)
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,PUT,DELETE,POST,PATCH",
    credentials: true
}));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/mealLogs", MealLogRoutes);
app.use("/recipes", recipeRoutes);
app.use("/instructorClients", instructorClients);
app.use("/instructors", instructorRoutes);
app.use("/matchinstructor", matchInstructorRoutes);
app.use("/workout", workoutRoutes);
app.use("/progress", progressLogRoutes);
app.use("/chathistory", chatHistoryRoutes);
app.use("/posts", communityPostRoutes);
app.use("/admin", adminRoutes);
app.use("/notification", notificationRoutes);
app.use("/dietician", dieticianRoutes);
app.use("/chat", chatRoutes);
app.use("/messages", chatui);

app.use("/client", clientRoutes);

app.use("/clientWorkouts", clientWorkoutRoutes);
app.use("/sessions", sessionRoutes);
app.use("/meal-plans", mealplanRoutes);
app.use("/recommendedmeals", recommendedMeal);
app.use("/consultations", dieticianSchedules);
app.use("/recommendedWorkouts", recommendedWorkoutRoutes);
app.use("/workoutLogs", workoutLogRoutes);
app.use("/mealPlans", recommendedMealplans);

// 5. SOCKET.IO CONNECTION LOGIC
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    // ✅ UPDATED: Save message to DB then Emit
    socket.on("send_message", async (data) => {
        // data = { room, author, message, senderId, time }
        
        try {
            // 1. Save to Database
            // Assuming table 'messages' has columns: conversation_id, sender_id, content
            const saveQuery = `
                INSERT INTO messages (conversation_id, sender_id, content) 
                VALUES ($1, $2, $3)
            `;
            await pool.query(saveQuery, [data.room, data.senderId, data.message]);

            // 2. Emit to others in room
            socket.to(data.room).emit("receive_message", data);
            
            console.log("Message saved and sent:", data.message);

        } catch (err) {
            console.error("Socket Message Save Error:", err);
            // Optional: Emit an error back to sender
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});
const port = process.env.PORT || 5000;

// 6. LISTEN WITH 'server' INSTEAD OF 'app'
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});