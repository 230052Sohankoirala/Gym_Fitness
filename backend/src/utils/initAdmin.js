import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

export const initAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: "admin@fittrack.com" });

        if (existingAdmin) {
            console.log("✅ Admin already exists");
            return;
        }

        const hashedPw = await bcrypt.hash("Admin@fittrack01", 10);

        await Admin.create({
            email: "admin@fittrack.com",
            password: hashedPw,
            role: "admin",
        });

        console.log("✅ Default Admin created (admin@fittrack.com / Admin@fittrack01)");
    } catch (error) {
        console.error("❌ Error creating admin:", error.message);
    }
};
