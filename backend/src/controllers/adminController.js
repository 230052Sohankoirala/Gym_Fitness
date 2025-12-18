// controllers/adminController.js
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Trainer from "../models/Trainer.js";
import Session from "../models/Session.js";
import Payment from "../models/Payment.js";
import bcrypt from "bcryptjs"; // only needed if your Trainer model does NOT hash automatically

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* ---------------- Dashboard stats ---------------- */
export const getAdminStats = async (req, res) => {
  try {
    const memberCount = await User.countDocuments();
    const trainerCount = await Trainer.countDocuments();
    const sessionCount = await Session.countDocuments();

    res.json({
      members: memberCount,
      trainers: trainerCount,
      sessions: sessionCount,
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Get Recent Activity ---------------- */
export const getRecentActivity = async (_req, res) => {
  try {
    const trainers = await Trainer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    const members = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullname email createdAt");

    const sessions = await Session.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("trainer", "name email")
      .select("type date createdAt");

    const activity = [
      ...trainers.map((t) => ({
        type: "trainer",
        message: `New Trainer joined: ${t.name}`,
        time: t.createdAt,
      })),
      ...members.map((m) => ({
        type: "member",
        message: `New Member registered: ${m.fullname}`,
        time: m.createdAt,
      })),
      ...sessions.map((s) => ({
        type: "session",
        message: `New Session created: ${s.type} (${s.trainer?.name || "Unknown"})`,
        time: s.createdAt,
      })),
    ];

    activity.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(activity.slice(0, 10));
  } catch (err) {
    console.error("Recent activity error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Admin Login ---------------- */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Admin login successful",
      token: generateToken(admin._id, admin.role),
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- Admin profile ---------------- */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- Revenue Dashboard ---------------- */
export const getAdminRevenue = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const payments = await Payment.find({});

    const totalRevenue = payments.reduce((sum, p) => sum + p.amountTotal, 0);
    const adminRevenue = payments.reduce((sum, p) => sum + p.adminShare, 0);
    const trainerRevenue = totalRevenue - adminRevenue;

    return res.json({
      totalRevenue,
      adminRevenue,
      trainerRevenue,
      transactions: payments.length,
    });
  } catch (err) {
    console.error("Admin Revenue Error:", err);
    return res.status(500).json({ message: "Failed to fetch revenue" });
  }
};
/* ---------------- Admin: Get all trainers ---------------- */
export const getAllTrainersAdmin = async (req, res) => {
  try {
    const trainers = await Trainer.find().select("-password").sort({ createdAt: -1 });
    return res.json(trainers);
  } catch (err) {
    console.error("Get trainers error:", err);
    return res.status(500).json({ message: "Failed to fetch trainers" });
  }
};

/* ---------------- Admin: Get one trainer ---------------- */
export const getTrainerByIdAdmin = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).select("-password");
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });
    return res.json(trainer);
  } catch (err) {
    console.error("Get trainer error:", err);
    return res.status(500).json({ message: "Failed to fetch trainer" });
  }
};

/* ---------------- Admin: Create trainer ---------------- */
export const createTrainerAdmin = async (req, res) => {
  try {
    // Basic fields (adjust names to match your Trainer schema)
    const {
      name,
      email,
      password,
      speciality,
      experience,
      bio,
      rating,
      phone,
      avatar,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const exists = await Trainer.findOne({ email });
    if (exists) return res.status(400).json({ message: "Trainer with this email already exists" });

    const trainer = await Trainer.create({
      name,
      email,
      password, // ✅ best if Trainer model hashes with pre-save
      speciality: speciality || "",
      experience: experience || "",
      bio: bio || "",
      rating: typeof rating === "number" ? rating : 0,
      phone: phone || "",
      avatar: avatar || "",
      role: "trainer", // if your schema has role
    });

    return res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        speciality: trainer.speciality,
        experience: trainer.experience,
        bio: trainer.bio,
        rating: trainer.rating,
        phone: trainer.phone,
        avatar: trainer.avatar,
        role: trainer.role,
        createdAt: trainer.createdAt,
      },
    });
  } catch (err) {
    console.error("Create trainer error:", err);
    return res.status(500).json({ message: "Failed to create trainer" });
  }
};

/* ---------------- Admin: Update trainer profile ---------------- */
export const updateTrainerAdmin = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    const {
      name,
      email,
      password, // optional reset password
      speciality,
      experience,
      bio,
      rating,
      phone,
      avatar,
      stripeAccountId, // optional admin set for Stripe
    } = req.body;

    // email unique check
    if (email && email !== trainer.email) {
      const exists = await Trainer.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already in use by another trainer" });
      trainer.email = email;
    }

    if (name !== undefined) trainer.name = name;
    if (speciality !== undefined) trainer.speciality = speciality;
    if (experience !== undefined) trainer.experience = experience;
    if (bio !== undefined) trainer.bio = bio;
    if (phone !== undefined) trainer.phone = phone;
    if (avatar !== undefined) trainer.avatar = avatar;

    if (rating !== undefined) {
      const r = Number(rating);
      trainer.rating = Number.isFinite(r) ? r : trainer.rating;
    }

    // ✅ password reset (only if provided)
    if (password && password.trim().length >= 6) {
      trainer.password = password; // if model hashes on save
    }

    // ✅ admin can set stripe account id (if you want)
    if (stripeAccountId !== undefined) {
      trainer.stripeAccountId = stripeAccountId || null;
    }

    const updated = await trainer.save();

    return res.json({
      message: "Trainer updated successfully",
      trainer: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        speciality: updated.speciality,
        experience: updated.experience,
        bio: updated.bio,
        rating: updated.rating,
        phone: updated.phone,
        avatar: updated.avatar,
        stripeAccountId: updated.stripeAccountId,
        role: updated.role,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("Update trainer error:", err);
    return res.status(500).json({ message: "Failed to update trainer" });
  }
};
/* ---------------- Admin: Delete trainer ---------------- */
export const deleteTrainerAdmin = async (req, res) => {
  try {
    const trainerId = req.params.id;

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    // ✅ Safety checks (recommended)
    const hasSessions = await Session.exists({ trainer: trainerId });
    const hasPayments = await Payment.exists({ trainer: trainerId });

    if (hasSessions || hasPayments) {
      return res.status(400).json({
        message:
          "Cannot delete trainer because they have sessions/payments. Deactivate instead.",
      });
    }

    await Trainer.deleteOne({ _id: trainerId });

    return res.json({ message: "Trainer deleted successfully" });
  } catch (err) {
    console.error("Delete trainer error:", err);
    return res.status(500).json({ message: "Failed to delete trainer" });
  }
};

export default {
  getAdminStats,
  getRecentActivity,
  adminLogin,
  getAdminProfile,
  getAdminRevenue,
  getAllTrainersAdmin,
  getTrainerByIdAdmin,
  createTrainerAdmin,
  updateTrainerAdmin,
  deleteTrainerAdmin,
};
