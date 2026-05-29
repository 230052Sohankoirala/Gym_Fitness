// src/controllers/authController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import nodemailer from "nodemailer";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ---------------- JWT Helper ---------------- */

const generateToken = (id, role, rememberMe = false) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : "1d",
  });
};

/* ---------------- Mail Transport Helper ---------------- */

const createMailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE) === "true",
    requireTLS: String(process.env.EMAIL_SECURE) !== "true",
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* ---------------- Email Helper: Verification ---------------- */

const sendVerificationEmail = async (email, code, fullname) => {
  try {
    const transporter = createMailTransporter();

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"FitTrack Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your FitTrack Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px; border:1px solid #eee; border-radius:10px; max-width:600px;">
          <h2 style="color:#4f46e5;">Hello ${fullname || "User"},</h2>

          <p>Welcome to <b>FitTrack</b> — your fitness journey starts here.</p>

          <p>Use the following code to verify your account:</p>

          <div style="text-align:center; margin:20px 0;">
            <span style="display:inline-block; font-size:24px; font-weight:bold; background:#4f46e5; color:white; padding:12px 24px; border-radius:8px; letter-spacing:4px;">
              ${code}
            </span>
          </div>

          <p>This code will expire in <b>15 minutes</b>.</p>

          <p>If you did not request this, you can safely ignore this email.</p>

          <hr style="margin:25px 0;" />

          <p>Stay strong,<br/>The FitTrack Team</p>
        </div>
      `,
    });

    console.log(`✅ Verification email sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error("Failed to send verification email. Try again later.");
  }
};

/* ---------------- Email Helper: Reset Password ---------------- */

const sendResetPasswordEmail = async (email, code, fullname) => {
  try {
    const transporter = createMailTransporter();

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"FitTrack Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your FitTrack Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px; border:1px solid #eee; border-radius:10px; max-width:600px;">
          <h2 style="color:#4f46e5;">Hello ${fullname || "User"},</h2>

          <p>We received a request to reset your <b>FitTrack</b> password.</p>

          <p>Use the following code to continue:</p>

          <div style="text-align:center; margin:20px 0;">
            <span style="display:inline-block; font-size:24px; font-weight:bold; background:#4f46e5; color:white; padding:12px 24px; border-radius:8px; letter-spacing:4px;">
              ${code}
            </span>
          </div>

          <p>This code will expire in <b>10 minutes</b>.</p>

          <p>If you did not request this password reset, you can safely ignore this email.</p>

          <hr style="margin:25px 0;" />

          <p>FitTrack Support Team</p>
        </div>
      `,
    });

    console.log(`✅ Reset password email sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Reset password email failed:", error.message);
    throw new Error("Failed to send reset password email. Try again later.");
  }
};

/* ---------------- Register User ---------------- */

export const register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({
        message: "Full name, username, email, and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing && !existing.isVerified) {
      const code = crypto.randomInt(100000, 999999).toString();

      existing.verificationCode = code;
      existing.verificationCodeExpires = Date.now() + 15 * 60 * 1000;

      await existing.save();

      res.status(200).json({
        message: "Verification code resent. Please verify your email.",
        requiresVerification: true,
        isNewUser: true,
        email: existing.email,
        user: {
          id: existing._id,
          fullname: existing.fullname,
          email: existing.email,
          username: existing.username,
          role: existing.role,
          isVerified: existing.isVerified,
        },
      });

      sendVerificationEmail(existing.email, code, existing.fullname).catch(
        (emailError) => {
          console.error("❌ Verification email failed:", emailError.message);
        }
      );

      return;
    }

    if (existing && existing.isVerified) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const code = crypto.randomInt(100000, 999999).toString();

    const user = await User.create({
      fullname,
      username,
      email: normalizedEmail,
      password,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: Date.now() + 15 * 60 * 1000,
      resetCode: null,
      resetCodeExpires: null,
      resetCodeVerified: false,
    });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      isNewUser: true,
      requiresVerification: true,
      email: user.email,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });

    sendVerificationEmail(user.email, code, fullname).catch((emailError) => {
      console.error("❌ Verification email failed:", emailError.message);
    });

    return;
  } catch (error) {
    console.error("❌ Register error:", error);

    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

/* ---------------- Verify Email ---------------- */

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and code are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      const token = generateToken(user._id, user.role, true);

      return res.json({
        message: "Email already verified",
        verified: true,
        token,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          username: user.username,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    }

    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired code",
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save();

    const token = generateToken(user._id, user.role, true);

    return res.json({
      message: "Email verified successfully",
      verified: true,
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("❌ Verify email error:", error);

    return res.status(500).json({
      message: "Server error during verification",
    });
  }
};

/* ---------------- Forgot Password: Send Code ---------------- */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found with this email.",
      });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();

    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    user.resetCodeVerified = false;

    await user.save();

    await sendResetPasswordEmail(user.email, resetCode, user.fullname);

    return res.status(200).json({
      message: "Password reset code sent to your email.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);

    return res.status(500).json({
      message:
        error.message || "Server error while sending reset code.",
    });
  }
};

/* ---------------- Forgot Password: Verify Code ---------------- */

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and code are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({
        message: "No reset code found. Please request a new one.",
      });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({
        message: "Invalid verification code.",
      });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({
        message: "Verification code has expired.",
      });
    }

    user.resetCodeVerified = true;

    await user.save();

    return res.status(200).json({
      message: "Reset code verified successfully.",
    });
  } catch (error) {
    console.error("❌ Verify reset code error:", error);

    return res.status(500).json({
      message: "Server error while verifying reset code.",
    });
  }
};

/* ---------------- Forgot Password: Reset Password ---------------- */

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        message: "Email, code, and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!user.resetCode || !user.resetCodeExpires) {
      return res.status(400).json({
        message: "No password reset request found.",
      });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({
        message: "Invalid reset code.",
      });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({
        message: "Reset code has expired.",
      });
    }

    if (!user.resetCodeVerified) {
      return res.status(400).json({
        message: "Please verify the reset code first.",
      });
    }

    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    user.resetCodeVerified = false;

    await user.save();

    return res.status(200).json({
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);

    return res.status(500).json({
      message: "Server error while resetting password.",
    });
  }
};

/* ---------------- Login ---------------- */

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({
        message:
          "This account was created with Google. Please login using Google Sign-In.",
      });
    }

    if (!user.password) {
      return res.status(500).json({
        message:
          "Password missing for this user in database. Please reset password or recreate user.",
      });
    }

    const isMatch = await bcrypt.compare(String(password), String(user.password));

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, user.role, rememberMe);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

/* ---------------- Google OAuth ---------------- */

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google token payload",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      email_verified,
    } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account email not found",
      });
    }

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Your Google email is not verified.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      const code = crypto.randomInt(100000, 999999).toString();

      user = await User.create({
        fullname: name || "Google User",
        username: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId,
        isVerified: false,
        verificationCode: code,
        verificationCodeExpires: Date.now() + 15 * 60 * 1000,
        resetCode: null,
        resetCodeExpires: null,
        resetCodeVerified: false,
      });

      res.status(201).json({
        success: true,
        message: "New Google account created. Please verify your email.",
        isNewUser: true,
        requiresVerification: true,
        email: user.email,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          username: user.username,
          role: user.role,
          isVerified: user.isVerified,
        },
      });

      sendVerificationEmail(user.email, code, user.fullname).catch(
        (emailError) => {
          console.error(
            "❌ Google verification email failed:",
            emailError.message
          );
        }
      );

      return;
    }

    if (!user.isVerified) {
      const code = crypto.randomInt(100000, 999999).toString();

      user.googleId = user.googleId || googleId;
      user.verificationCode = code;
      user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Please verify your email before continuing.",
        isNewUser: true,
        requiresVerification: true,
        email: user.email,
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          username: user.username,
          role: user.role,
          isVerified: user.isVerified,
        },
      });

      sendVerificationEmail(user.email, code, user.fullname).catch(
        (emailError) => {
          console.error(
            "❌ Google verification email failed:",
            emailError.message
          );
        }
      );

      return;
    }

    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const jwtToken = generateToken(user._id, user.role, true);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      isNewUser: false,
      requiresVerification: false,
      token: jwtToken,
      email: user.email,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("❌ Google login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during Google login",
    });
  }
};

/* ---------------- Logout ---------------- */

export const logout = (req, res) => {
  return res.json({
    message: "Logout successful",
  });
};