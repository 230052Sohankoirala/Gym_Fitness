import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createCheckoutSession,
  createPaymentIntent,
  confirmPaymentIntentAndFinalize,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/checkout", protect, createCheckoutSession);
router.post("/create-intent", protect, createPaymentIntent);
router.post("/confirm-intent", protect, confirmPaymentIntentAndFinalize);

export default router;