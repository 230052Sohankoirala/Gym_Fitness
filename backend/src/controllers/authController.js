// controllers/authController.js
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

/**
 * Google OAuth Client
 *
 * Render .env:
 * GOOGLE_CLIENT_ID=your_google_client_id
 */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT token.
 */
const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Generate 6 digit code.
 */
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash code before saving to database.
 */
const hashCode = (code) => {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
};

/**
 * Create Gmail SMTP transporter.
 *
 * Render .env:
 * EMAIL_USER=yourgmail@gmail.com
 * EMAIL_PASS=your_google_app_password
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email verification code.
 */
const sendVerificationEmail = async ({ email, fullname, code }) => {
  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: `"FitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your FitFlow account",
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 30px;">
        <div style="max-width: 520px; margin: auto; background: #ffffff; padding: 28px; border-radius: 14px; border: 1px solid #e5e7eb;">
          <h2 style="margin-top: 0; color: #111827;">Verify your email</h2>

          <p style="font-size: 15px; color: #374151;">
            Hello ${fullname || "there"},
          </p>

          <p style="font-size: 15px; color: #374151;">
            Thank you for registering with FitFlow. Please use the code below to verify your account.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; font-size: 34px; letter-spacing: 8px; font-weight: bold; color: #4f46e5; background: #eef2ff; padding: 16px 26px; border-radius: 12px;">
              ${code}
            </div>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            This code will expire in 10 minutes.
          </p>

          <p style="font-size: 14px; color: #6b7280;">
            If you did not create this account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send password reset code.
 */
const sendPasswordResetEmail = async ({ email, fullname, code }) => {
  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: `"FitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your FitFlow password",
    html: `
      <div style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 30px;">
        <div style="max-width: 520px; margin: auto; background: #ffffff; padding: 28px; border-radius: 14px; border: 1px solid #e5e7eb;">
          <h2 style="margin-top: 0; color: #111827;">Password Reset Code</h2>

          <p style="font-size: 15px; color: #374151;">
            Hello ${fullname || "there"},
          </p>

          <p style="font-size: 15px; color: #374151;">
            Use the code below to reset your FitFlow password.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; font-size: 34px; letter-spacing: 8px; font-weight: bold; color: #4f46e5; background: #eef2ff; padding: 16px 26px; border-radius: 12px;">
              ${code}
            </div>
          </div>

          <p style="font-size: 14px; color: #6b7280;">
            This code will expire in 10 minutes.
          </p>

          <p style="font-size: 14px; color: #6b7280;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * REGISTER
 *
 * Route:
 * POST /api/auth/register
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

        await sendVerificationEmail({
          email: existingUser.email,
          fullname: existingUser.fullname,
          code: plainCode,
        });

        return res.status(200).json({
          success: true,
          message:
            "Account already exists but is not verified. A new verification code has been sent.",
          requiresVerification: true,
          email: existingUser.email,
        });
      }

      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const plainCode = generateSixDigitCode();

    const user = await User.create({
      fullname: safeFullname,
      username: safeUsername,
      email: safeEmail,

      /**
       * Important:
       * Give plain password here.
       * User.js pre-save middleware will hash it.
       */
      password,

      role: "member",
      isVerified: false,
      verificationCode: hashCode(plainCode),
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendVerificationEmail({
      email: user.email,
      fullname: user.fullname,
      code: plainCode,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Verification code sent to email.",
      requiresVerification: true,
      email: user.email,
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
 * LOGIN
 *
 * Route:
 * POST /api/auth/login
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

      await sendVerificationEmail({
        email: user.email,
        fullname: user.fullname,
        code: plainCode,
      });

      return res.status(403).json({
        success: false,
        message:
          "Please verify your email first. A new verification code has been sent.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: rememberMe ? "30d" : "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toJSON(),
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
 * GOOGLE LOGIN
 *
 * Route:
 * POST /api/auth/google
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

    let user = await User.findOne({ email: safeEmail });

    if (!user) {
      const baseUsername =
        safeEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") ||
        `user${Date.now()}`;

      let username = baseUsername;

      const usernameExists = await User.findOne({ username });

      if (usernameExists) {
        username = `${baseUsername}${Date.now()}`;
      }

      user = await User.create({
        fullname,
        username,
        email: safeEmail,
        googleId,
        avatar,
        role: "member",

        /**
         * Google email is verified by Google.
         */
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }

      user.isVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpires = null;

      await user.save();
    }

    const jwtToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token: jwtToken,
      user: user.toJSON(),
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
 * VERIFY EMAIL
 *
 * Route:
 * POST /api/auth/verify-email
 *
 * Body:
 * {
 *   "email": "user@gmail.com",
 *   "code": "123456"
 * }
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
 * RESEND VERIFICATION CODE
 *
 * Route:
 * POST /api/auth/resend-verification
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

    await sendVerificationEmail({
      email: user.email,
      fullname: user.fullname,
      code: plainCode,
    });

    return res.status(200).json({
      success: true,
      message: "New verification code sent successfully.",
      requiresVerification: true,
      email: user.email,
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
 * LOGOUT
 *
 * Route:
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

/**
 * FORGOT PASSWORD
 *
 * Route:
 * POST /api/auth/forgot-password
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
      "+resetCode +resetCodeExpires +resetCodeVerified"
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

    await sendPasswordResetEmail({
      email: user.email,
      fullname: user.fullname,
      code: plainCode,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset code sent to email.",
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
 * VERIFY RESET CODE
 *
 * Route:
 * POST /api/auth/verify-reset-code
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
 * RESET PASSWORD
 *
 * Route:
 * POST /api/auth/reset-password
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

    /**
     * Important:
     * Give plain password here.
     * User.js pre-save middleware will hash it.
     */
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