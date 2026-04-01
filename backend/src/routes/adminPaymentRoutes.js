import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { getAllPaymentsForAdmin } from "../controllers/adminPaymentController.js";

const router = express.Router();

router.get("/payments", protect, requireRole("admin"), getAllPaymentsForAdmin);

export default router;