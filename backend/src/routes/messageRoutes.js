import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import {
  getMessages,
  sendMessage,
  getTrainerThreads,
  sendMediaMessage,
} from "../controllers/messageController.js";

const router = express.Router();

/* ---------------- Multer config (local uploads) ---------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ ALWAYS use "uploads/chat" (plural)
    const dir = path.join(process.cwd(), "uploads", "chat");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname || "");
    const base = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${base}${safeExt}`);
  },
});

// allow images + videos only
const fileFilter = (req, file, cb) => {
  const mime = file.mimetype || "";
  const ok = mime.startsWith("image/") || mime.startsWith("video/");
  if (!ok) return cb(new Error("Only image/video files are allowed"));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 50 * 1024 * 1024, // ✅ 50MB each (your value)
  },
});

/* ---------------- Routes ---------------- */

// trainer threads (trainer only)
router.get("/threads", protect, getTrainerThreads);

// shared chat endpoints (text)
router.post("/:trainerId", protect, sendMessage);
router.get("/:trainerId", protect, getMessages);

// ✅ send images/videos
router.post("/:trainerId/media", protect, upload.array("files", 5), sendMediaMessage);

export default router;