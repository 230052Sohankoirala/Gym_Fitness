// routes/authRoutes.js
import express from "express";
import axios from "axios";

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
 * Temporary Promailer test route
 *
 * Visit:
 * https://gym-fitness-hgq7.onrender.com/api/auth/test-promailer
 */
router.get("/test-promailer", async (req, res) => {
  try {
    const response = await axios.post(
      process.env.PROMAILER_API_URL ||
        "https://mailserver.automationlounge.com/api/v1/messages/send",
      {
        to: "koiralam613@gmail.com",
        subject: "FitTrack Promailer Test Email",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>FitTrack Test Email</h2>
            <p>If you received this email, Promailer API is working.</p>
          </div>
        `,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_MAIL_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    console.log("PROMAILER TEST SUCCESS:", response.data);

    return res.status(200).json({
      success: true,
      message: "Promailer test request sent.",
      data: response.data,
    });
  } catch (error) {
    console.error("PROMAILER TEST ERROR:", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    return res.status(500).json({
      success: false,
      message: "Promailer test failed.",
      error: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
  }
});

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