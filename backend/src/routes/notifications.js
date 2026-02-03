// src/routes/notifications.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// 🔔 Get notifications for current user (member / trainer / admin)
router.get("/", protect, getNotifications);

// ✅ Mark ALL notifications as read
router.patch("/read-all", protect, markAllNotificationsRead);

// ✅ Mark ONE notification as read
router.patch("/:id/read", protect, markNotificationRead);

// 🗑️ Delete ONE notification
router.delete("/:id", protect, clearNotification);

// 🧨 Clear ALL notifications for this user
router.delete("/", protect, clearAllNotifications);

export default router;
