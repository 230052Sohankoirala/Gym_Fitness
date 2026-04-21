// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  logout, 
  forgotPassword,
  verifyResetCode,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// ✅ Email verification route
router.post("/verify-email", verifyEmail);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
