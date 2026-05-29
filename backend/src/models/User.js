// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Schema for FitFlow
 *
 * Supports:
 *  - Normal registration
 *  - Google login
 *  - Role-based access
 *  - Profile details
 *  - Trainer assignment
 *  - Email verification using code
 *  - Password reset using code
 */
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },

    googleId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["member", "trainer", "admin"],
      default: "member",
    },

    avatar: {
      type: String,
      default: "",
    },

    weight: {
      type: Number,
    },

    age: {
      type: Number,
    },

    height: {
      type: Number,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },

    goals: [
      {
        type: String,
      },
    ],

    /**
     * Assigned trainer for member users.
     */
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /**
     * Email verification status.
     * For normal signup, this stays false until user enters email code.
     * For Google login, you can set this true because Google email is already verified.
     */
    isVerified: {
      type: Boolean,
      default: false,
    },

    /**
     * 6-digit email verification code.
     * Keep hidden from normal queries.
     */
    verificationCode: {
      type: String,
      default: null,
      select: false,
    },

    /**
     * Verification code expiry time.
     */
    verificationCodeExpires: {
      type: Date,
      default: null,
      select: false,
    },

    /**
     * Password reset code.
     */
    resetCode: {
      type: String,
      default: null,
      select: false,
    },

    /**
     * Password reset code expiry time.
     */
    resetCodeExpires: {
      type: Date,
      default: null,
      select: false,
    },

    /**
     * Tracks whether reset code was verified before allowing password change.
     */
    resetCodeVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Password Hash Middleware
 *
 * This automatically hashes password before saving.
 * Important:
 * Do not hash password manually in controller if using this middleware.
 */
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password") || !this.password) {
      return next();
    }

    if (typeof this.password !== "string") {
      return next(new Error("Password must be a string"));
    }

    this.password = await bcrypt.hash(this.password, 10);

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Compare entered password with hashed password.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Clean JSON output.
 */
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;

    delete ret.verificationCode;
    delete ret.verificationCodeExpires;

    delete ret.resetCode;
    delete ret.resetCodeExpires;
    delete ret.resetCodeVerified;

    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;