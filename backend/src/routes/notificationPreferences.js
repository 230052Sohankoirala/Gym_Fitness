import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getMyNotificationPrefs,
  saveMyNotificationPrefs,
} from "../controllers/notificationPreferencesController.js";

const router = express.Router();

router.get("/me", protect, getMyNotificationPrefs);
router.put("/me", protect, saveMyNotificationPrefs);

export default router;
