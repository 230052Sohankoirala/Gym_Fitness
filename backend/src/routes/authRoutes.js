// routes/authRoutes.js
import express from "express";

import {
  register,
  login,
  googleLogin,
  verifyEmail,
  resendVerificationCode,
  logout,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * Auth Routes
 *
 * Base path in server.js should be:
 * app.use("/api/auth", authRoutes);
 */

/**
 * Public authentication routes
 */
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

/**
 * Email verification routes
 */
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);

/**
 * Logout route
 */
router.post("/logout", logout);

/**
 * Password reset routes
 */
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;