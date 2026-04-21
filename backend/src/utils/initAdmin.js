import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

dotenv.config();

export const initAdmin = async () => {
    try {
        console.log("🚀 Starting admin initialization...");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");

        const existingAdmin = await Admin.findOne({ email: "admin@fittrack.com" });

        if (existingAdmin) {
            console.log("✅ Admin already exists");
            process.exit(0);
        }

        const hashedPw = await bcrypt.hash("Admin@fittrack01", 10);

        await Admin.create({
            email: "admin@fittrack.com",
            password: hashedPw,
            role: "admin",
        });

        console.log("✅ Default Admin created");
        console.log("📧 Email: admin@fittrack.com");
        console.log("🔑 Password: Admin@fittrack01");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating admin:", error.message);
        process.exit(1);
    }
};

// 🔥 THIS WAS MISSING
initAdmin();