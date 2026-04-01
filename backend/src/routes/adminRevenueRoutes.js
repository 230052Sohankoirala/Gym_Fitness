import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { getAdminRevenueOverview } from "../controllers/adminRevenueController.js";

const router = express.Router();

router.get("/revenue", protect, requireRole("admin"), getAdminRevenueOverview);

export default router;