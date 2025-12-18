// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  logout,   // ✅ import new controller
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// ✅ Email verification route
router.post("/verify-email", verifyEmail);
router.post("/logout", logout);

export default router;
