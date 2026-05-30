// controllers/authController.js

import crypto from "crypto";
import jwt from "jsonwebtoken";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT token for authenticated users.
 *
 * rememberMe = true  -> 30 days
 * rememberMe = false -> 7 days
 */
const generateToken = (userId, rememberMe = false) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberMe ? "30d" : "7d",
    }
  );
};

/**
 * Generate a random six-digit verification/reset code.
 */
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash verification/reset code before storing in database.
 */
const hashCode = (code) => {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
};

/**
 * Basic HTML escaping to prevent user-provided values from breaking email HTML.
 */
const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

/**
 * Get email sender.
 *
 * Required env:
 * EMAIL_FROM=FitTrack <fittrackfitness001@gmail.com>
 */
const getEmailFrom = () => {
  return process.env.EMAIL_FROM || "FitTrack <fittrackfitness001@gmail.com>";
};

/**
 * Log Promailer/API email errors clearly.
 */
const logEmailError = (label, error) => {
  console.error(`${label} failed:`, {
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?.data,
  });
};

/**
 * Send email through Promailer API.
 *
 * Required env:
 * API_MAIL_KEY=your_promailer_api_key
 * PROMAILER_API_URL=https://mailserver.automationlounge.com/api/v1/messages/send
 */
const sendPromailerEmail = async ({ to, subject, html }) => {
  const apiUrl =
    process.env.PROMAILER_API_URL ||
    "https://mailserver.automationlounge.com/api/v1/messages/send";

  if (!process.env.API_MAIL_KEY) {
    throw new Error("Missing API_MAIL_KEY in environment variables.");
  }

  const response = await axios.post(
    apiUrl,
    {
      from: getEmailFrom(),
      to,
      subject,
      html,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.API_MAIL_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );

  return response.data;
};

/**
 * Send account verification code email.
 */
const sendVerificationEmail = async ({ email, fullname, code }) => {
  const safeName = escapeHtml(fullname || "there");
  const safeCode = escapeHtml(code);

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 30px;">
      <div style="max-width: 540px; margin: auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/649/649604.png" 
            alt="FitTrack Logo" 
            width="72" 
            height="72" 
            style="display: block; margin: auto;"
          />
        </div>

        <h2 style="margin-top: 0; color: #111827; text-align: center;">
          Verify Your FitTrack Account
        </h2>

        <p style="font-size: 15px; color: #374151;">
          Hello ${safeName},
        </p>

        <p style="font-size: 15px; color: #374151;">
          Welcome to <b>FitTrack</b>. Please use the code below to verify your account.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; font-size: 34px; letter-spacing: 8px; font-weight: bold; color: #4f46e5; background: #eef2ff; padding: 16px 26px; border-radius: 12px;">
            ${safeCode}
          </div>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          This code will expire in 10 minutes.
        </p>

        <p style="font-size: 14px; color: #6b7280;">
          If you did not create this account, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          FitTrack Fitness Management System
        </p>
      </div>
    </div>
  `;

  return sendPromailerEmail({
    to: email,
    subject: "Verify Your FitTrack Account",
    html,
  });
};

/**
 * Send password reset code email.
 */
const sendPasswordResetEmail = async ({ email, fullname, code }) => {
  const safeName = escapeHtml(fullname || "there");
  const safeCode = escapeHtml(code);

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 30px;">
      <div style="max-width: 540px; margin: auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/649/649604.png" 
            alt="FitTrack Logo" 
            width="72" 
            height="72" 
            style="display: block; margin: auto;"
          />
        </div>

        <h2 style="margin-top: 0; color: #111827; text-align: center;">
          Reset Your FitTrack Password
        </h2>

        <p style="font-size: 15px; color: #374151;">
          Hello ${safeName},
        </p>

        <p style="font-size: 15px; color: #374151;">
          Use the code below to reset your FitTrack password.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; font-size: 34px; letter-spacing: 8px; font-weight: bold; color: #dc2626; background: #fee2e2; padding: 16px 26px; border-radius: 12px;">
            ${safeCode}
          </div>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          This code will expire in 10 minutes.
        </p>

        <p style="font-size: 14px; color: #6b7280;">
          If you did not request this password reset, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          FitTrack Fitness Management System
        </p>
      </div>
    </div>
  `;

  return sendPromailerEmail({
    to: email,
    subject: "Reset Your FitTrack Password",
    html,
  });
};

/**
 * Register normal user.
 *
 * Normal registration:
 * - Creates member account
 * - Saves hashed verification code
 * - Sends verification code using Promailer API
 * - User must verify email before login
 */
export const register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const safeFullname = String(fullname).trim();
    const safeUsername = String(username).trim();
    const safeEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: safeEmail }, { username: safeUsername }],
    }).select("+verificationCode +verificationCodeExpires");

    if (existingUser) {
      if (!existingUser.isVerified && existingUser.email === safeEmail) {
        const plainCode = generateSixDigitCode();

        existingUser.verificationCode = hashCode(plainCode);
        existingUser.verificationCodeExpires = new Date(
          Date.now() + 10 * 60 * 1000
        );

        await existingUser.save();

        try {
          await sendVerificationEmail({
            email: existingUser.email,
            fullname: existingUser.fullname,
            code: plainCode,
          });
        } catch (error) {
          logEmailError("Verification email", error);

          return res.status(500).json({
            success: false,
            message:
              "Account exists but verification email could not be sent. Please try again.",
          });
        }

        return res.status(200).json({
          success: true,
          message:
            "Account exists but is not verified. A new verification code has been sent.",
          requiresVerification: true,
          email: existingUser.email,
          redirectTo: "/verify-email",
        });
      }

      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const plainCode = generateSixDigitCode();

    const user = await User.create({
      fullname: safeFullname,
      username: safeUsername,
      email: safeEmail,
      password,
      role: "member",
      isVerified: false,
      verificationCode: hashCode(plainCode),
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendVerificationEmail({
        email: user.email,
        fullname: user.fullname,
        code: plainCode,
      });
    } catch (error) {
      logEmailError("Verification email", error);

      return res.status(500).json({
        success: false,
        message:
          "Registration created, but verification email could not be sent. Please try resend verification.",
        requiresVerification: true,
        email: user.email,
        redirectTo: "/verify-email",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Verification code has been sent.",
      requiresVerification: true,
      email: user.email,
      redirectTo: "/verify-email",
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

/**
 * Normal email/password login.
 */
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const safeEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: safeEmail }).select(
      "+password +verificationCode +verificationCodeExpires"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      const plainCode = generateSixDigitCode();

      user.verificationCode = hashCode(plainCode);
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

      await user.save();

      try {
        await sendVerificationEmail({
          email: user.email,
          fullname: user.fullname,
          code: plainCode,
        });
      } catch (error) {
        logEmailError("Verification email", error);

        return res.status(500).json({
          success: false,
          message:
            "Please verify your email first, but a new verification email could not be sent.",
          requiresVerification: true,
          email: user.email,
          redirectTo: "/verify-email",
        });
      }

      return res.status(403).json({
        success: false,
        message:
          "Please verify your email first. A new verification code has been sent.",
        requiresVerification: true,
        email: user.email,
        redirectTo: "/verify-email",
      });
    }

    const token = generateToken(user._id, rememberMe);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toJSON(),
      redirectTo: "/home",
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

/**
 * Google login.
 *
 * New Google user:
 * - Create account with googleId
 * - Set isVerified = false
 * - Send FitTrack verification code
 * - Return requiresVerification = true
 *
 * Existing Google user but not verified:
 * - Send new verification code
 * - Return requiresVerification = true
 *
 * Existing verified Google user:
 * - Login normally
 */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload?.sub;
    const email = payload?.email;
    const fullname = payload?.name || "Google User";
    const avatar = payload?.picture || "";

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: "Google account information is incomplete.",
      });
    }

    const safeEmail = String(email).trim().toLowerCase();

    let user = await User.findOne({ email: safeEmail }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      const baseUsername =
        safeEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") ||
        `user${Date.now()}`;

      let username = baseUsername;

      const usernameExists = await User.findOne({ username });

      if (usernameExists) {
        username = `${baseUsername}${Date.now()}`;
      }

      const plainCode = generateSixDigitCode();

      user = await User.create({
        fullname,
        username,
        email: safeEmail,
        googleId,
        avatar,
        role: "member",
        isVerified: false,
        verificationCode: hashCode(plainCode),
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      });

      try {
        await sendVerificationEmail({
          email: user.email,
          fullname: user.fullname,
          code: plainCode,
        });
      } catch (error) {
        logEmailError("Google verification email", error);

        return res.status(500).json({
          success: false,
          message:
            "Google account created, but verification email could not be sent. Please try resend verification.",
          requiresVerification: true,
          email: user.email,
          loginProvider: "google",
          redirectTo: "/verify-email",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Google account created. Please verify your email using the code sent to your inbox.",
        requiresVerification: true,
        email: user.email,
        loginProvider: "google",
        redirectTo: "/verify-email",
      });
    }

    if (!user.googleId) {
      user.googleId = googleId;
    }

    if (!user.avatar && avatar) {
      user.avatar = avatar;
    }

    if (!user.isVerified) {
      const plainCode = generateSixDigitCode();

      user.verificationCode = hashCode(plainCode);
      user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

      await user.save();

      try {
        await sendVerificationEmail({
          email: user.email,
          fullname: user.fullname,
          code: plainCode,
        });
      } catch (error) {
        logEmailError("Google verification email", error);

        return res.status(500).json({
          success: false,
          message:
            "Google login requires email verification, but verification email could not be sent.",
          requiresVerification: true,
          email: user.email,
          loginProvider: "google",
          redirectTo: "/verify-email",
        });
      }

      return res.status(403).json({
        success: false,
        message:
          "Please verify your email first. A verification code has been sent.",
        requiresVerification: true,
        email: user.email,
        loginProvider: "google",
        redirectTo: "/verify-email",
      });
    }

    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save();

    const jwtToken = generateToken(user._id, true);

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token: jwtToken,
      user: user.toJSON(),
      redirectTo: "/userInfo",
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
};

/**
 * Verify email for both:
 * - normal registration
 * - Google registration/login verification
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    const safeEmail = String(email).trim().toLowerCase();
    const safeCode = String(code).trim();

    const user = await User.findOne({ email: safeEmail }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Email is already verified.",
        token,
        user: user.toJSON(),
        redirectTo: user.googleId ? "/userInfo" : "/home",
      });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code.",
      });
    }

    if (user.verificationCodeExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired. Please request a new code.",
      });
    }

    const hashedInputCode = hashCode(safeCode);

    if (hashedInputCode !== user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: user.toJSON(),
      redirectTo: user.googleId ? "/userInfo" : "/home",
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during email verification.",
    });
  }
};

/**
 * Resend verification code for both normal and Google users.
 */
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const safeEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: safeEmail }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    const plainCode = generateSixDigitCode();

    user.verificationCode = hashCode(plainCode);
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    try {
      await sendVerificationEmail({
        email: user.email,
        fullname: user.fullname,
        code: plainCode,
      });
    } catch (error) {
      logEmailError("Resend verification email", error);

      return res.status(500).json({
        success: false,
        message: "Verification code created but email could not be sent.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "New verification code has been sent.",
      requiresVerification: true,
      email: user.email,
      loginProvider: user.googleId ? "google" : "normal",
      redirectTo: "/verify-email",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resending verification code.",
    });
  }
};

/**
 * Logout.
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

/**
 * Forgot password.
 *
 * Sends reset code only to normal email/password users.
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const safeEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: safeEmail }).select(
      "+password +resetCode +resetCodeExpires +resetCodeVerified"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    const plainCode = generateSixDigitCode();

    user.resetCode = hashCode(plainCode);
    user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetCodeVerified = false;

    await user.save();

    try {
      await sendPasswordResetEmail({
        email: user.email,
        fullname: user.fullname,
        code: plainCode,
      });
    } catch (error) {
      logEmailError("Password reset email", error);

      return res.status(500).json({
        success: false,
        message: "Password reset code created but email could not be sent.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset code has been sent.",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while sending password reset code.",
    });
  }
};

/**
 * Verify password reset code.
 */
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and reset code are required.",
      });
    }

    const safeEmail = String(email).trim().toLowerCase();
    const safeCode = String(code).trim();

    const user = await User.findOne({ email: safeEmail }).select(
      "+resetCode +resetCodeExpires +resetCodeVerified"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({
        success: false,
        message: "No reset code found. Please request a new code.",
      });
    }

    if (user.resetCodeExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Reset code expired. Please request a new code.",
      });
    }

    const hashedInputCode = hashCode(safeCode);

    if (hashedInputCode !== user.resetCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code.",
      });
    }

    user.resetCodeVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Reset code verified successfully.",
      email: user.email,
    });
  } catch (error) {
    console.error("Verify reset code error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying reset code.",
    });
  }
};

/**
 * Reset password after reset code is verified.
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, password } = req.body;

    const finalPassword = newPassword || password;

    if (!email || !finalPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    if (String(finalPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const safeEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: safeEmail }).select(
      "+password +resetCode +resetCodeExpires +resetCodeVerified"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.resetCodeVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify reset code first.",
      });
    }

    user.password = finalPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    user.resetCodeVerified = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting password.",
    });
  }
};