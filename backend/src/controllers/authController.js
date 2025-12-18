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

/* ---------------- Email Helper ---------------- */
const sendVerificationEmail = async (email, code, fullname) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password only!
      },
    });

    const info = await transporter.sendMail({
      from: `"FitTrack Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Verify Your FitTrack Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px; border:1px solid #eee; border-radius:10px; max-width:600px;">
          <h2 style="color:#4f46e5;">👋 Hello ${fullname},</h2>
          <p>Welcome to <b>FitTrack</b> — your fitness journey starts here!</p>
          <p>Use the following code to verify your account:</p>
          <div style="text-align:center; margin:20px 0;">
            <span style="display:inline-block; font-size:22px; font-weight:bold; background:#4f46e5; color:white; padding:10px 20px; border-radius:6px; letter-spacing:3px;">
              ${code}
            </span>
          </div>
          <p>This code will expire in <b>15 minutes</b>.</p>
          <p>If you didn’t request this, just ignore this email.</p>
          <hr style="margin:25px 0;">
          <p>💪 Stay strong,<br>The FitTrack Team</p>
        </div>
      `,
    });

    console.log(`✅ Verification email sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error("Failed to send verification email. Try again later.");
  }
};

/* ---------------- Register User ---------------- */
export const register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const existing = await User.findOne({ email });

    // Case 1: User exists but not verified → resend code
    if (existing && !existing.isVerified) {
      const code = crypto.randomInt(100000, 999999).toString();
      existing.verificationCode = code;
      existing.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
      await existing.save();

      await sendVerificationEmail(email, code, existing.fullname);

      return res.status(200).json({
        message: "Verification code resent. Please verify your email.",
        requiresVerification: true,
      });
    }

    // Case 2: Fully verified existing user → block duplicate
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Case 3: Create new user
    const code = crypto.randomInt(100000, 999999).toString();
    const user = await User.create({
      fullname,
      username,
      email,
      password,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: Date.now() + 15 * 60 * 1000,
    });

    await sendVerificationEmail(email, code, fullname);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      isNewUser: true,
      requiresVerification: true,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/* ---------------- Verify Email ---------------- */
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.json({ message: "Email already verified" });

    if (
      user.verificationCode !== code ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // ✅ Mark as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // ✅ Generate token so frontend can navigate without being logged out
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Email verified successfully",
      verified: true,
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Verify email error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};
/* ---------------- Login ---------------- */
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role, rememberMe);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/* ---------------- Google OAuth ---------------- */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ message: "Google token required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    // Case 1️⃣: User already exists but not verified → resend code
    if (user && !user.isVerified) {
      const code = crypto.randomInt(100000, 999999).toString();
      user.verificationCode = code;
      user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      await sendVerificationEmail(email, code, user.fullname);

      return res.json({
        message: "Verification code sent to your email. Please verify to continue.",
        requiresVerification: true,
      });
    }

    // Case 2️⃣: New Google user → create unverified account and send email
    if (!user) {
      const code = crypto.randomInt(100000, 999999).toString();
      user = await User.create({
        fullname: name,
        username: email.split("@")[0],
        email,
        googleId,
        isVerified: false,
        verificationCode: code,
        verificationCodeExpires: Date.now() + 15 * 60 * 1000,
      });
      isNewUser = true;

      await sendVerificationEmail(email, code, name);

      return res.json({
        message: "New Google user. Verification email sent.",
        isNewUser,
        requiresVerification: true,
      });
    }

    // Case 3️⃣: Existing verified user → normal login
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before login." });
    }

    const jwtToken = generateToken(user._id, user.role);

    res.json({
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      isNewUser,
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    res.status(500).json({ message: "Server error during Google login" });
  }
};
/* ---------------- Logout ---------------- */
export const logout = (req, res) => {
  res.json({ message: "Logout successful" });
};
