import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes — koi bhi access kar sakta hai
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private route — sirf valid token ke saath access hoga
// "protect" middleware pehle chalega, tabhi getMe chalega
router.get("/me", protect, getMe);

export default router;
