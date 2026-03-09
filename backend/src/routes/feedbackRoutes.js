// src/routes/feedbackRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import {
    submitFeedback,
    listFeedbackAdmin,
    getFeedbackAdmin,
    updateFeedbackAdmin,
    deleteFeedbackAdmin,
} from "../controllers/feedbackController.js";

const router = express.Router();

// ✅ debug route
router.get("/health", (_req, res) => res.json({ ok: true }));

/* USER */
router.post("/", protect, submitFeedback);

/* ADMIN */
router.get("/admin", protect, authorizeRoles("admin"), listFeedbackAdmin);
router.get("/admin/:id", protect, authorizeRoles("admin"), getFeedbackAdmin);
router.put("/admin/:id", protect, authorizeRoles("admin"), updateFeedbackAdmin);
router.delete("/admin/:id", protect, authorizeRoles("admin"), deleteFeedbackAdmin);

export default router;