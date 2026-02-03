import express from "express";
import { protect } from "../middleware/auth.js";
import { getMessages, sendMessage, getTrainerThreads } from "../controllers/messageController.js";

const router = express.Router();

// trainer threads (trainer only)
router.get("/threads", protect, getTrainerThreads);

// shared chat endpoints
router.post("/:trainerId", protect, sendMessage);
router.get("/:trainerId", protect, getMessages);

export default router;
