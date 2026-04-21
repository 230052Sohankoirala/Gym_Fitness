import express from "express";
import { protect } from "../middleware/auth.js";
import {
    createOrGetStripeOnboardingLink,
    getStripeStatus,
    handleStripeReturn,
    getAllowedStripeCountries
} from "../controllers/trainerStripeController.js";

const router = express.Router();

router.post("/connect", protect, createOrGetStripeOnboardingLink);
router.get("/status", protect, getStripeStatus);
router.get("/return", protect, handleStripeReturn);
router.get(
    "/countries",
    protect,
    getAllowedStripeCountries
);

export default router;