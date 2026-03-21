import stripe from "../config/stripe.js";
import Trainer from "../models/Trainer.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * POST /api/trainers/stripe/connect
 * Create Stripe Connect account if needed,
 * then return onboarding link for trainer.
 */
export const createOrGetStripeOnboardingLink = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "trainer") {
            return res.status(403).json({ message: "Only trainers can connect Stripe" });
        }

        const trainer = await Trainer.findById(req.user._id);

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }

        let stripeAccountId = trainer.stripeAccountId;

        // Create Express connected account if not already created
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: trainer.email,
                business_type: "individual",
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    trainerId: String(trainer._id),
                    trainerEmail: trainer.email,
                },
            });

            stripeAccountId = account.id;
            trainer.stripeAccountId = account.id;
            trainer.stripeOnboarded = false;
            await trainer.save();
        }

        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${FRONTEND_URL}/trainer/stripe/refresh`,
            return_url: `${FRONTEND_URL}/trainer/stripe/return`,
            type: "account_onboarding",
        });

        return res.json({
            success: true,
            url: accountLink.url,
            stripeAccountId,
        });
    } catch (err) {
        console.error("createOrGetStripeOnboardingLink error:", err);
        return res.status(500).json({
            message: err?.message || "Failed to create Stripe onboarding link",
        });
    }
};

/**
 * GET /api/trainers/stripe/status
 * Check current trainer Stripe account status.
 */
export const getStripeStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "trainer") {
            return res.status(403).json({ message: "Only trainers can view Stripe status" });
        }

        const trainer = await Trainer.findById(req.user._id);

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }

        if (!trainer.stripeAccountId) {
            return res.json({
                connected: false,
                onboarded: false,
                stripeAccountId: null,
            });
        }

        const account = await stripe.accounts.retrieve(trainer.stripeAccountId);

        const onboarded =
            !!account.details_submitted &&
            !!account.charges_enabled &&
            !!account.payouts_enabled;

        if (trainer.stripeOnboarded !== onboarded) {
            trainer.stripeOnboarded = onboarded;
            await trainer.save();
        }

        return res.json({
            connected: true,
            onboarded,
            stripeAccountId: trainer.stripeAccountId,
            detailsSubmitted: !!account.details_submitted,
            chargesEnabled: !!account.charges_enabled,
            payoutsEnabled: !!account.payouts_enabled,
        });
    } catch (err) {
        console.error("getStripeStatus error:", err);
        return res.status(500).json({
            message: err?.message || "Failed to fetch Stripe status",
        });
    }
};

/**
 * GET /api/trainers/stripe/return
 * Called after Stripe onboarding return.
 * Re-checks account and updates trainer.stripeOnboarded
 */
export const handleStripeReturn = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "trainer") {
            return res.status(403).json({ message: "Only trainers can complete Stripe onboarding" });
        }

        const trainer = await Trainer.findById(req.user._id);

        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }

        if (!trainer.stripeAccountId) {
            return res.status(400).json({ message: "No Stripe account found for trainer" });
        }

        const account = await stripe.accounts.retrieve(trainer.stripeAccountId);

        const onboarded =
            !!account.details_submitted &&
            !!account.charges_enabled &&
            !!account.payouts_enabled;

        trainer.stripeOnboarded = onboarded;
        await trainer.save();

        return res.json({
            success: true,
            connected: true,
            onboarded,
            stripeAccountId: trainer.stripeAccountId,
            detailsSubmitted: !!account.details_submitted,
            chargesEnabled: !!account.charges_enabled,
            payoutsEnabled: !!account.payouts_enabled,
            message: onboarded
                ? "Stripe onboarding completed successfully."
                : "Stripe onboarding is not complete yet.",
        });
    } catch (err) {
        console.error("handleStripeReturn error:", err);
        return res.status(500).json({
            message: err?.message || "Failed to verify Stripe onboarding",
        });
    }
};