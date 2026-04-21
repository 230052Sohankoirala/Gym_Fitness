import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

import Trainer from "../models/Trainer.js";
import Session from "../models/Session.js";
import Message from "../models/Message.js";
import TrainerTask from "../models/TrainerTask.js";

/* ---------------- JWT helper ---------------- */
const generateToken = (id, role = "trainer") =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d",
  });

/* ---------------- Trainer avatar upload setup ---------------- */
const trainerAvatarDir = path.join(process.cwd(), "uploads", "trainer-avatars");
fs.mkdirSync(trainerAvatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, trainerAvatarDir),
  filename: (req, file, cb) => {
    const targetId = req.params?.id || req.user?._id || "trainer";
    cb(
      null,
      `trainer-${targetId}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (!allowedExt.includes(ext)) {
    return cb(new Error("Only JPG, JPEG, PNG, and WEBP files are allowed"));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ---------------- helper ---------------- */
const sanitizeTrainerResponse = (trainer) => ({
  id: trainer._id,
  name: trainer.name,
  email: trainer.email,
  role: trainer.role,
  speciality: trainer.speciality,
  experience: trainer.experience,
  bio: trainer.bio,
  rating: trainer.rating,
  avatar: trainer.avatar || "",
});

/* =================================================================== */
/*                            ADMIN / AUTH                              */
/* =================================================================== */

export const createTrainer = async (req, res) => {
  try {
    const { name, email, password, speciality, experience, bio, rating } = req.body;

    const cleanEmail = (email || "").trim().toLowerCase();

    if (!name || !cleanEmail || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const exists = await Trainer.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(400).json({ message: "Trainer already exists" });
    }

    const avatarPath = req.file
      ? `/uploads/trainer-avatars/${req.file.filename}`
      : "";

    const trainer = await Trainer.create({
      name: String(name).trim(),
      email: cleanEmail,
      password,
      role: "trainer",
      createdByAdmin: true,
      speciality: speciality || "",
      experience: experience ? Number(experience) : 0,
      bio: bio || "",
      rating: rating !== undefined && rating !== "" ? Number(rating) : 0,
      avatar: avatarPath,
    });

    return res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        role: trainer.role,
        speciality: trainer.speciality,
        experience: trainer.experience,
        bio: trainer.bio,
        rating: trainer.rating,
        avatar: trainer.avatar || "",
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const trainerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    const trainer = await Trainer.findOne({ email: cleanEmail });
    if (!trainer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await trainer.matchPassword(password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(trainer._id, trainer.role);

    return res.json({
      message: "Login successful",
      token,
      trainer: sanitizeTrainerResponse(trainer),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getTrainerProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.user._id).select("-password");
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    return res.json(sanitizeTrainerResponse(trainer));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllTrainers = async (_req, res) => {
  try {
    const trainers = await Trainer.find().select("-password");
    return res.json(trainers);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPublicTrainers = async (_req, res) => {
  try {
    const trainers = await Trainer.find({ role: "trainer" })
      .select("_id name speciality experience rating bio avatar")
      .sort({ name: 1 })
      .lean();

    return res.json(trainers || []);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (trainer.avatar) {
      const oldRelativePath = trainer.avatar.replace(/^\/+/, "");
      const oldAbsolutePath = path.join(process.cwd(), "uploads", path.basename(oldRelativePath));

      const fullAbsolutePath = path.join(process.cwd(), "uploads", "trainer-avatars", path.basename(oldRelativePath));

      if (fs.existsSync(fullAbsolutePath)) {
        fs.unlinkSync(fullAbsolutePath);
      } else if (fs.existsSync(oldAbsolutePath)) {
        fs.unlinkSync(oldAbsolutePath);
      }
    }

    await trainer.deleteOne();

    return res.json({ message: "Trainer deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, speciality, experience, bio, rating } = req.body;

    if (req.user.role === "trainer" && String(req.user._id) !== String(id)) {
      return res.status(403).json({
        message: "Forbidden: You can only update your own profile.",
      });
    }

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (name !== undefined) {
      trainer.name = String(name).trim();
    }

    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();

      const exists = await Trainer.findOne({
        email: cleanEmail,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({ message: "Email already in use" });
      }

      trainer.email = cleanEmail;
    }

    if (speciality !== undefined) trainer.speciality = speciality;
    if (experience !== undefined) trainer.experience = Number(experience) || 0;
    if (bio !== undefined) trainer.bio = bio;
    if (rating !== undefined && rating !== "") trainer.rating = Number(rating);
    if (rating === "") trainer.rating = 0;

    await trainer.save();

    return res.json({
      message: "Trainer updated successfully",
      trainer: sanitizeTrainerResponse(trainer),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =================================================================== */
/*                        TRAINER SETTINGS HELPERS                       */
/* =================================================================== */

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    if (req.user.role === "trainer" && String(req.user._id) !== String(req.params.id)) {
      return res.status(403).json({ message: "Not authorized to update this avatar" });
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (trainer.avatar) {
      const oldFileName = path.basename(trainer.avatar);
      const oldAbsolutePath = path.join(trainerAvatarDir, oldFileName);

      if (fs.existsSync(oldAbsolutePath)) {
        fs.unlinkSync(oldAbsolutePath);
      }
    }

    trainer.avatar = `/uploads/trainer-avatars/${req.file.filename}`;
    await trainer.save();

    return res.json({
      message: "Trainer avatar uploaded successfully",
      avatar: trainer.avatar,
      trainer: sanitizeTrainerResponse(trainer),
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Avatar upload failed",
    });
  }
};

export const changeTrainerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Current password, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const isMatch = await trainer.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    trainer.password = newPassword;
    await trainer.save();

    return res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =================================================================== */
/*                         DASHBOARD & KPI LOGIC                        */
/* =================================================================== */

const WEEK_STARTS_ON_MONDAY = true;

const startOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = WEEK_STARTS_ON_MONDAY ? (day === 0 ? -6 : 1 - day) : -day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfWeek = (d = new Date()) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  e.setHours(0, 0, 0, 0);
  return e;
};

const parseDateString = (s) => {
  if (!s || typeof s !== "string") return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const toLocalDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string") return parseDateString(v);
  return null;
};

const isSameLocalDate = (a, b = new Date()) => {
  const A = toLocalDate(a);
  const B = toLocalDate(b);
  if (!A || !B) return false;

  return (
    A.getFullYear() === B.getFullYear() &&
    A.getMonth() === B.getMonth() &&
    A.getDate() === B.getDate()
  );
};

const inThisWeekLocal = (v) => {
  const dt = toLocalDate(v);
  if (!dt) return false;
  return dt >= startOfWeek() && dt < endOfWeek();
};

export const getTrainerDashboard = async (req, res) => {
  try {
    const sessions = await Session.find({ trainer: req.user._id })
      .sort({ date: 1, time: 1 })
      .populate("clientsEnrolled", "fullname name email")
      .lean();

    const messages = await Message.find({ trainer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const tasks = await TrainerTask.find({ trainer: req.user._id }).lean();

    const activeClientIds = new Set();
    for (const s of sessions) {
      (s.clientsEnrolled || []).forEach((u) => {
        const id = (u?._id || u?.id || u)?.toString?.();
        if (id) activeClientIds.add(id);
      });
    }

    const sessionsToday = sessions.filter((s) => isSameLocalDate(s?.date)).length;

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newMessages = messages.filter((m) => {
      const ts = new Date(m?.createdAt || 0);
      return ts >= dayAgo;
    }).length;

    const weeklySessions = sessions.filter((s) => {
      if (!inThisWeekLocal(s?.date)) return false;
      return (s?.status || "Pending") !== "Cancelled";
    });

    const weeklyClientIds = new Set();
    for (const s of weeklySessions) {
      (s.clientsEnrolled || []).forEach((u) => {
        const id = (u?._id || u?.id || u)?.toString?.();
        if (id) weeklyClientIds.add(id);
      });
    }

    const uniqueClientsThisWeek = weeklyClientIds.size;

    const sow = startOfWeek();
    const eow = endOfWeek();

    const checkinsThisWeek = messages.filter((m) => {
      const ts = new Date(m?.createdAt || 0);
      const inWeek = ts >= sow && ts < eow;
      const looksLikeCheckin = /check[- ]?in|update|progress|how.*going|status/i.test(
        m?.text || m?.message || ""
      );
      return inWeek && looksLikeCheckin;
    }).length;

    const programUpdatesThisWeek = Math.min(
      weeklySessions.length,
      Math.round(weeklySessions.length * 0.5)
    );

    const targets = {
      sessions: 20,
      programUpdates: 15,
      checkins: 20,
      clients: 12,
    };

    const kpi = {
      activeClients: activeClientIds.size,
      sessionsToday,
      newMessages,
      earnings: "$1,280",
      weeklySessionsCount: weeklySessions.length,
      uniqueClientsThisWeek,
      programUpdatesThisWeek,
      checkinsThisWeek,
    };

    return res.json({
      trainer: sanitizeTrainerResponse(req.user),
      kpi,
      targets,
      sessions,
      messages,
      tasks,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =================================================================== */
/*                    TRAINER: MY CLIENTS + SESSIONS                    */
/* =================================================================== */

export const getMyClientsWithSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ trainer: req.user._id })
      .select("_id title name date time startTime endTime price amount status clientsEnrolled")
      .populate(
        "clientsEnrolled",
        "fullname name email membership MemberShip age goals profile metrics weight height"
      )
      .sort({ date: 1, time: 1 })
      .lean();

    const map = new Map();

    for (const s of sessions) {
      const enrolled = Array.isArray(s.clientsEnrolled) ? s.clientsEnrolled : [];

      for (const u of enrolled) {
        const uid = (u?._id || u?.id)?.toString?.();
        if (!uid) continue;

        if (!map.has(uid)) {
          map.set(uid, {
            user: u,
            sessions: [],
          });
        }

        map.get(uid).sessions.push({
          _id: s._id,
          title: s.title || s.name || "Session",
          date: s.date,
          time: s.time,
          startTime: s.startTime,
          endTime: s.endTime,
          price: s.price ?? s.amount,
          status: s.status || "Pending",
        });
      }
    }

    return res.json(Array.from(map.values()));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =================================================================== */
/*                               TASKS                                  */
/* =================================================================== */

export const getTrainerTasks = async (req, res) => {
  try {
    const tasks = await TrainerTask.find({ trainer: req.user._id });
    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createTrainerTask = async (req, res) => {
  try {
    const { title, column } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await TrainerTask.create({
      trainer: req.user._id,
      title,
      column: column || "todo",
      done: false,
    });

    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateTrainerTask = async (req, res) => {
  try {
    const { title, column, done } = req.body;

    const task = await TrainerTask.findOne({
      _id: req.params.id,
      trainer: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title !== undefined) task.title = title;
    if (column !== undefined) task.column = column;
    if (done !== undefined) task.done = done;

    await task.save();

    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteTrainerTask = async (req, res) => {
  try {
    const task = await TrainerTask.findOne({
      _id: req.params.id,
      trainer: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    return res.json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export default {
  createTrainer,
  trainerLogin,
  getTrainerProfile,
  getAllTrainers,
  getPublicTrainers,
  deleteTrainer,
  updateTrainer,
  getTrainerDashboard,
  upload,
  uploadAvatar,
  changeTrainerPassword,
  getTrainerTasks,
  createTrainerTask,
  updateTrainerTask,
  deleteTrainerTask,
  getMyClientsWithSessions,
};