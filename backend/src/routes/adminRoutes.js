// src/routes/adminRoutes.js
import express from "express";
import {
  adminLogin,
  getAdminStats,
  getRecentActivity,
  getAdminRevenue,
  getAdminProfile,
  getAllTrainersAdmin,
  getTrainerByIdAdmin,
  createTrainerAdmin,
  updateTrainerAdmin,
  deleteTrainerAdmin,
  getAllUsersAdmin,
  updateUserStatusAdmin,
  deleteUserAdmin
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();

// 🔑 Admin login
router.post("/login", adminLogin);

// 📊 Dashboard stats
router.get("/stats", protect, authorizeRoles("admin"), getAdminStats);

// 📰 Recent activity feed
router.get("/activity", protect, authorizeRoles("admin"), getRecentActivity);

// 👤 Admin profile (for ProtectedRoute checks)
router.get("/me", protect, authorizeRoles("admin"), getAdminProfile);

// 💰 Revenue overview
router.get("/revenue", protect, authorizeRoles("admin"), getAdminRevenue);
// 👨‍🏫 Admin Trainer Management
router.get("/trainers", protect, authorizeRoles("admin"), getAllTrainersAdmin);
router.get("/trainers/:id", protect, authorizeRoles("admin"), getTrainerByIdAdmin);
router.post("/trainers", protect, authorizeRoles("admin"), createTrainerAdmin);
router.put("/trainers/:id", protect, authorizeRoles("admin"), updateTrainerAdmin);
router.delete("/trainers/:id", protect, authorizeRoles("admin"), deleteTrainerAdmin);
// 👥 Admin User Management (Members)
router.get("/users", protect, authorizeRoles("admin"), getAllUsersAdmin);
router.patch("/users/:id/status", protect, authorizeRoles("admin"), updateUserStatusAdmin);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUserAdmin);

export default router;
