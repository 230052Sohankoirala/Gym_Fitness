// models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },

    // optional cached stats
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

adminSchema.methods.matchPassword = async function (enteredPw) {
  return bcrypt.compare(enteredPw, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
