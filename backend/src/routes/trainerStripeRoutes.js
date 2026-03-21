import express from "express";
import { protect } from "../middleware/auth.js";
import {
    createOrGetStripeOnboardingLink,
    getStripeStatus,
    handleStripeReturn,
} from "../controllers/trainerStripeController.js";

const router = express.Router();

router.post("/connect", protect, createOrGetStripeOnboardingLink);
router.get("/status", protect, getStripeStatus);
router.get("/return", protect, handleStripeReturn);

export default router;