// controllers/trainerController.js
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

import Trainer from "../models/Trainer.js";
import Session from "../models/Session.js";
import Message from "../models/Message.js";
import TrainerTask from "../models/TrainerTask.js";

/* ---------------- JWT helper ---------------- */
const generateToken = (id, role = "trainer") =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });

/* ---------------- Multer storage (avatar uploads) ---------------- */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/avatars/"),
  filename: (req, file, cb) => {
    // Prefer explicit target id from route, else authenticated user id, else "anon"
    const targetId = req.params?.id || req.user?._id || "anon";
    cb(null, `${targetId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
export const upload = multer({ storage });

/* =================================================================== */
/*                            ADMIN / AUTH                              */
/* =================================================================== */

/* ---------------- Admin: Create Trainer ---------------- */
export const createTrainer = async (req, res) => {
  try {
    const { name, email, password, speciality, experience, bio, rating } = req.body;

    const cleanEmail = (email || "").trim().toLowerCase();
    if (!name || !cleanEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const exists = await Trainer.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ message: "Trainer already exists" });

    const trainer = await Trainer.create({
      name,
      email: cleanEmail,
      password: password || "trainer123",
      role: "trainer",
      createdByAdmin: true,
      speciality,
      experience,
      bio,
      rating,
    });

    res.status(201).json({
      message: "Trainer created",
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        role: trainer.role,
        speciality: trainer.speciality,
        experience: trainer.experience,
        bio: trainer.bio,
        rating: trainer.rating,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Trainer Login ---------------- */
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

    res.json({
      message: "Login successful",
      token,
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        role: trainer.role,
        speciality: trainer.speciality,
        experience: trainer.experience,
        bio: trainer.bio,
        rating: trainer.rating,
        avatar: trainer.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ---------------- Trainer Profile (self) ---------------- */
export const getTrainerProfile = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      speciality: req.user.speciality,
      experience: req.user.experience,
      bio: req.user.bio,
      rating: req.user.rating,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Admin: Get All Trainers ---------------- */
export const getAllTrainers = async (_req, res) => {
  try {
    const trainers = await Trainer.find().select("-password");
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Public: Get Trainers (card list) ---------------- */
export const getPublicTrainers = async (_req, res) => {
  try {
    // Only return safe, public-facing fields
    const trainers = await Trainer.find({ role: "trainer" })
      .select("_id name speciality experience rating bio avatar")
      .sort({ name: 1 })
      .lean();

    res.json(trainers || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Admin: Delete Trainer ---------------- */
export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });
    await trainer.deleteOne();
    res.json({ message: "Trainer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- Admin/Trainer: Update Trainer ---------------- */
export const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, speciality, experience, bio, rating } = req.body;

    // Trainers can only update their own profile
    if (req.user.role === "trainer" && req.user._id.toString() !== id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own profile." });
    }

    const trainer = await Trainer.findById(id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    if (name) trainer.name = name;
    if (email) {
      const clean = (email || "").trim().toLowerCase();
      const exists = await Trainer.findOne({ email: clean, _id: { $ne: id } });
      if (exists) return res.status(400).json({ message: "Email already in use" });
      trainer.email = clean;
    }
    if (speciality) trainer.speciality = speciality;
    if (experience) trainer.experience = experience;
    if (bio) trainer.bio = bio;
    if (rating !== undefined) trainer.rating = rating;

    await trainer.save();

    res.json({ message: "Trainer updated", trainer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =================================================================== */
/*                         DASHBOARD & KPI LOGIC                        */
/* =================================================================== */

const WEEK_STARTS_ON_MONDAY = true;

/* ---- week helpers ---- */
const startOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun..6=Sat
  const diff = WEEK_STARTS_ON_MONDAY ? (day === 0 ? -6 : 1 - day) : -day; // Mon-start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};
const endOfWeek = (d = new Date()) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  e.setHours(0, 0, 0, 0); // exclusive
  return e;
};

/* ---- date parsing (string "YYYY-MM-DD" or Date) ---- */
const parseDateString = (s) => {
  if (!s || typeof s !== "string") return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return isNaN(dt.getTime()) ? null : dt;
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

/* ---------------- Trainer Dashboard (weekly targets + KPIs) ---------------- */
export const getTrainerDashboard = async (req, res) => {
  try {
    // Sessions for this trainer
    const sessions = await Session.find({ trainer: req.user._id })
      .sort({ date: 1, time: 1 })
      .populate("clientsEnrolled", "fullname name email")
      .lean();

    // Recent messages
    const messages = await Message.find({ trainer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Tasks
    const tasks = await TrainerTask.find({ trainer: req.user._id }).lean();

    // Active clients (unique across all sessions)
    const activeClientIds = new Set();
    for (const s of sessions) {
      (s.clientsEnrolled || []).forEach((u) => {
        const id = (u?._id || u?.id || u)?.toString?.();
        if (id) activeClientIds.add(id);
      });
    }

    // Sessions today
    const sessionsToday = sessions.filter((s) => isSameLocalDate(s?.date)).length;

    // New messages (last 24h)
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newMessages = messages.filter((m) => {
      const ts = new Date(m?.createdAt || 0);
      return ts >= dayAgo;
    }).length;

    // ✅ Weekly sessions: count ANY session this week (exclude Cancelled if desired)
    const weeklySessions = sessions.filter((s) => {
      if (!inThisWeekLocal(s?.date)) return false;
      return (s?.status || "Pending") !== "Cancelled";
    });

    // Unique clients served this week (based on weeklySessions)
    const weeklyClientIds = new Set();
    for (const s of weeklySessions) {
      (s.clientsEnrolled || []).forEach((u) => {
        const id = (u?._id || u?.id || u)?.toString?.();
        if (id) weeklyClientIds.add(id);
      });
    }
    const uniqueClientsThisWeek = weeklyClientIds.size;

    // Weekly check-ins (regex heuristic)
    const sow = startOfWeek();
    const eow = endOfWeek();
    const checkinsThisWeek = messages.filter((m) => {
      const ts = new Date(m?.createdAt || 0);
      const inWeek = ts >= sow && ts < eow;
      const looksLikeCheckin =
        /check[- ]?in|update|progress|how.*going|status/i.test(m?.text || m?.message || "");
      return inWeek && looksLikeCheckin;
    }).length;

    // Program updates heuristic (replace with real metric later)
    const programUpdatesThisWeek =
      Math.min(weeklySessions.length, Math.round(weeklySessions.length * 0.5));

    // Weekly targets (could be stored per-trainer later)
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
      earnings: "$1,280", // placeholder
      weeklySessionsCount: weeklySessions.length,
      uniqueClientsThisWeek,
      programUpdatesThisWeek,
      checkinsThisWeek,
    };

    return res.json({
      trainer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        speciality: req.user.speciality,
        experience: req.user.experience,
        bio: req.user.bio,
        rating: req.user.rating,
      },
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
/*                          AVATAR / MEDIA                              */
/* =================================================================== */

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Trainer can only update their own avatar
    if (req.user.role === "trainer" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    trainer.avatar = `/uploads/avatars/${req.file.filename}`;
    await trainer.save();

    res.json({ message: "Avatar uploaded", avatar: trainer.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =================================================================== */
/*                               TASKS                                  */
/* =================================================================== */

export const getTrainerTasks = async (req, res) => {
  try {
    const tasks = await TrainerTask.find({ trainer: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTrainerTask = async (req, res) => {
  try {
    const { title, column } = req.body;
    if (!title) return res.status(400).json({ message: "Task title is required" });

    const task = await TrainerTask.create({
      trainer: req.user._id,
      title,
      column: column || "todo",
      done: false,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTrainerTask = async (req, res) => {
  try {
    const { title, column, done } = req.body;
    const task = await TrainerTask.findOne({ _id: req.params.id, trainer: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title !== undefined) task.title = title;
    if (column !== undefined) task.column = column;
    if (done !== undefined) task.done = done;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTrainerTask = async (req, res) => {
  try {
    const task = await TrainerTask.findOne({ _id: req.params.id, trainer: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =================================================================== */
/*                          DEFAULT EXPORT (optional)                   */
/* =================================================================== */

export default {
  createTrainer,
  trainerLogin,
  getTrainerProfile,
  getAllTrainers,
  getPublicTrainers,
  deleteTrainer,
  updateTrainer,
  getTrainerDashboard,
  uploadAvatar,
  getTrainerTasks,
  createTrainerTask,
  updateTrainerTask,
  deleteTrainerTask,
};
