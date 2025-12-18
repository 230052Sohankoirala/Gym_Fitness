// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Schema for FitFlow
 * Supports:
 *  - Normal registration & Google login
 *  - Role-based access (member/trainer/admin)
 *  - Profile details (avatar, weight, age, height, gender, goals)
 *  - Trainer assignment
 *  - Email verification system
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
        return !this.googleId; // password required unless Google login
      },
      minlength: 6,
      select: false, // hide from queries by default
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
    avatar: { type: String },
    weight: { type: Number },
    age: { type: Number },
    height: { type: Number },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    goals: [{ type: String }],

    // 👇 Assign members to trainers
    assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 👇 Email verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

/**
 * Password Hash Middleware
 * Runs before saving a user if the password was modified
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  if (typeof this.password !== "string") {
    return next(new Error("Password must be a string"));
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/**
 * Compare entered password with hashed password
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Clean JSON output (hide sensitive fields)
 */
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    delete ret.verificationCode; // don't expose verification code
    delete ret.verificationCodeExpires;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
