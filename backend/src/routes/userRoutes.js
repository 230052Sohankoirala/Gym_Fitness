import express from "express";

import {
  getProfile,
  updateProfile,
  getAllUsersAndTrainers,
  getTrainerUsers,
  deleteUser,
  getAllTrainers,
  bookTrainer,
} from "../controllers/userController.js";

import { protect, requireRole } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = express.Router();

/**
 * Member profile routes
 */
router.get("/me", protect, requireRole("member"), getProfile);

router.put(
  "/me",
  protect,
  requireRole("member"),
  uploadAvatar.single("avatar"),
  updateProfile
);

/**
 * Member-only actions
 */
router.get("/trainers", protect, requireRole("member"), getAllTrainers);
router.post("/book", protect, requireRole("member"), bookTrainer);

/**
 * Trainer-only routes
 */
router.get("/trainer/my-users", protect, requireRole("trainer"), getTrainerUsers);

/**
 * Admin-only routes
 */
router.get("/", protect, requireRole("admin"), getAllUsersAndTrainers);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

export default router;