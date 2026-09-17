import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

// .env file ki values process.env me load karo
dotenv.config();

// Database se connect karo
connectDB();

const app = express();

// Middlewares
app.use(cors()); // frontend (alag port) ko backend se baat karne do
app.use(express.json()); // incoming JSON request body ko parse karo

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

// Simple test route — check karne ke liye ki server chal raha hai
app.get("/", (req, res) => {
  res.send("CareerForge AI Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
