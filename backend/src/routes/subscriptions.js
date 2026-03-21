import express from "express";
import { protect } from "../middleware/auth.js";
import {
    getMyActiveSubscription,
    getMySubscriptionHistory,
    cancelMySubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.get("/active", protect, getMyActiveSubscription);
router.get("/history", protect, getMySubscriptionHistory);
router.post("/:id/cancel", protect, cancelMySubscription);

export default router;