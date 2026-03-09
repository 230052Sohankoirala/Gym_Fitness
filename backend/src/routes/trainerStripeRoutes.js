import express from "express";
import stripe from "../config/stripe.js";
import Trainer from "../models/Trainer.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * POST /api/trainers/stripe/connect/:trainerId
 * Admin can connect any trainer. Trainer can connect self.
 * Returns onboarding URL.
 */
router.post(
    "/connect/:trainerId",
    protect,
    authorizeRoles("admin", "trainer"),
    async (req, res) => {
        try {
            const { trainerId } = req.params;

            // Trainer can only connect their own Stripe account
            if (req.user.role === "trainer" && String(req.user._id) !== String(trainerId)) {
                return res.status(403).json({ message: "Forbidden" });
            }

            const trainer = await Trainer.findById(trainerId);
            if (!trainer) return res.status(404).json({ message: "Trainer not found" });

            // Create Stripe Express account if missing
            if (!trainer.stripeAccountId) {
                const account = await stripe.accounts.create({
                    type: "express",
                    email: trainer.email,
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                    business_type: "individual",
                });

                trainer.stripeAccountId = account.id;
                trainer.stripeOnboarded = false;
                await trainer.save();
            }

            // Generate onboarding link
            const link = await stripe.accountLinks.create({
                account: trainer.stripeAccountId,
                refresh_url: `${FRONTEND_URL}/trainer/stripe/refresh`,
                return_url: `${FRONTEND_URL}/trainer/stripe/return`,
                type: "account_onboarding",
            });

            return res.json({
                stripeAccountId: trainer.stripeAccountId,
                url: link.url,
            });
        } catch (err) {
            console.error("Stripe connect error:", err);
            return res.status(500).json({ message: "Stripe connect failed" });
        }
    }
);

/**
 * GET /api/trainers/stripe/status/:trainerId
 * Checks whether the trainer is fully onboarded to receive payouts.
 */
router.get(
    "/status/:trainerId",
    protect,
    authorizeRoles("admin", "trainer"),
    async (req, res) => {
        try {
            const { trainerId } = req.params;

            if (req.user.role === "trainer" && String(req.user._id) !== String(trainerId)) {
                return res.status(403).json({ message: "Forbidden" });
            }

            const trainer = await Trainer.findById(trainerId);
            if (!trainer) return res.status(404).json({ message: "Trainer not found" });

            if (!trainer.stripeAccountId) {
                return res.json({ connected: false, onboarded: false });
            }

            const account = await stripe.accounts.retrieve(trainer.stripeAccountId);

            const onboarded =
                account?.details_submitted === true &&
                account?.charges_enabled === true &&
                account?.payouts_enabled === true;

            trainer.stripeOnboarded = onboarded;
            await trainer.save();

            return res.json({
                connected: true,
                onboarded,
                stripeAccountId: trainer.stripeAccountId,
            });
        } catch (err) {
            console.error("Stripe status error:", err);
            return res.status(500).json({ message: "Stripe status failed" });
        }
    }
);

export default router;
