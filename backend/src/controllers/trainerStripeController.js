import stripe from "../config/stripe.js";
import Trainer from "../models/Trainer.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Keep this list limited to countries you actually want to support.
 * Stripe Express availability depends on country.
 */
const ALLOWED_STRIPE_COUNTRIES = ["US", "AU", "GB", "CA"];

/**
 * Safely normalize country code.
 */
const normalizeCountry = (value = "") => String(value).trim().toUpperCase();

/**
 * Returns a friendly display label for a country code.
 */
const getCountryLabel = (code) => {
    const map = {
        US: "United States",
        AU: "Australia",
        GB: "United Kingdom",
        CA: "Canada",
    };
    return map[code] || code;
};

/**
 * POST /api/trainers/stripe/connect
 * Creates Stripe Connect account if needed,
 * then returns onboarding link for trainer.
 */
export const createOrGetStripeOnboardingLink = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "trainer") {
            return res.status(403).json({
                success: false,
                message: "Only trainers can connect Stripe.",
            });
        }

        const trainer = await Trainer.findById(req.user._id);

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: "Trainer not found.",
            });
        }

        let stripeAccountId = trainer.stripeAccountId;
        let requestedCountry = normalizeCountry(req.body?.country);

        /**
         * If trainer already has a Stripe account, reuse its saved country.
         * Do not allow country changes after account creation.
         */
        if (stripeAccountId) {
            requestedCountry = normalizeCountry(trainer.stripeCountry);
        }

        /**
         * Only require country when creating a NEW account.
         */
        if (!stripeAccountId && !requestedCountry) {
            return res.status(400).json({
                success: false,
                message: "Country is required before connecting Stripe.",
            });
        }

        /**
         * Only validate country when creating a NEW account.
         */
        if (!stripeAccountId && !ALLOWED_STRIPE_COUNTRIES.includes(requestedCountry)) {
            return res.status(400).json({
                success: false,
                message: `Stripe onboarding is not enabled for ${requestedCountry}.`,
                allowedCountries: ALLOWED_STRIPE_COUNTRIES,
            });
        }

        /**
         * Create connected account only once.
         * Country must be chosen before creation.
         */
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: "express",
                country: requestedCountry,
                email: trainer.email,
                business_type: "individual",
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    trainerId: String(trainer._id),
                    trainerEmail: trainer.email,
                    country: requestedCountry,
                },
            });

            stripeAccountId = account.id;

            trainer.stripeAccountId = account.id;
            trainer.stripeOnboarded = false;
            trainer.stripeCountry = requestedCountry;

            await trainer.save();
        }

        /**
         * Create onboarding link each time user wants to continue onboarding.
         */
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${FRONTEND_URL}/trainer/stripe/refresh`,
            return_url: `${FRONTEND_URL}/trainer/stripe/return`,
            type: "account_onboarding",
        });

        return res.status(200).json({
            success: true,
            message: `Stripe onboarding link created for ${getCountryLabel(
                requestedCountry || trainer.stripeCountry
            )}.`,
            url: accountLink.url,
            stripeAccountId,
            stripeCountry: requestedCountry || trainer.stripeCountry || null,
        });
    } catch (err) {
        console.error("createOrGetStripeOnboardingLink error:", err);

        return res.status(500).json({
            success: false,
            message: err?.message || "Failed to create Stripe onboarding link.",
        });
    }
};

/**
 * GET /api/trainers/stripe/status
 * Checks current trainer Stripe account status.
 */
export const getStripeStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "trainer") {
            return res.status(403).json({
                success: false,
                message: "Only trainers can view Stripe status.",
            });
        }

        const trainer = await Trainer.findById(req.user._id);

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: "Trainer not found.",
            });
        }

        if (!trainer.stripeAccountId) {
            return res.status(200).json({
                success: true,
                connected: false,
                onboarded: false,
                stripeAccountId: null,
                stripeCountry: trainer.stripeCountry || null,
                detailsSubmitted: false,
                chargesEnabled: false,
                payoutsEnabled: false,
            });
        }

        const account = await stripe.accounts.retrieve(trainer.stripeAccountId);

        const onboarded =
            Boolean(account.details_submitted) &&
            Boolean(account.charges_enabled) &&
            Boolean(account.payouts_enabled);

        if (trainer.stripeOnboarded !== onboarded) {
            trainer.stripeOnboarded = onboarded;
            await trainer.save();
        }

        return res.status(200).json({
            success: true,
            connected: true,
            onboarded,
            stripeAccountId: trainer.stripeAccountId,
            stripeCountry: trainer.stripeCountry || account.country || null,
            detailsSubmitted: Boolean(account.details_submitted),
            chargesEnabled: Boolean(account.charges_enabled),
            payoutsEnabled: Boolean(account.payouts_enabled),
        });
    } catch (err) {
        console.error("getStripeStatus error:", err);

        return res.status(500).json({
            success: false,
            message: err?.message || "Failed to fetch Stripe status.",
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
            return res.status(403).json({
                success: false,
                message: "Only trainers can complete Stripe onboarding.",
            });
        }

        const trainer = await Trainer.findById(req.user._id);

        if (!trainer) {
            return res.status(404).json({
                success: false,
                message: "Trainer not found.",
            });
        }

        if (!trainer.stripeAccountId) {
            return res.status(400).json({
                success: false,
                message: "No Stripe account found for trainer.",
            });
        }

        const account = await stripe.accounts.retrieve(trainer.stripeAccountId);

        const onboarded =
            Boolean(account.details_submitted) &&
            Boolean(account.charges_enabled) &&
            Boolean(account.payouts_enabled);

        trainer.stripeOnboarded = onboarded;

        /**
         * Save country if Stripe returns it and DB is missing it.
         */
        if (!trainer.stripeCountry && account.country) {
            trainer.stripeCountry = account.country;
        }

        await trainer.save();

        return res.status(200).json({
            success: true,
            connected: true,
            onboarded,
            stripeAccountId: trainer.stripeAccountId,
            stripeCountry: trainer.stripeCountry || account.country || null,
            detailsSubmitted: Boolean(account.details_submitted),
            chargesEnabled: Boolean(account.charges_enabled),
            payoutsEnabled: Boolean(account.payouts_enabled),
            message: onboarded
                ? "Stripe onboarding completed successfully."
                : "Stripe onboarding is not complete yet.",
        });
    } catch (err) {
        console.error("handleStripeReturn error:", err);

        return res.status(500).json({
            success: false,
            message: err?.message || "Failed to verify Stripe onboarding.",
        });
    }
};

/**
 * GET /api/trainers/stripe/countries
 * Returns allowed countries for frontend dropdown.
 */
export const getAllowedStripeCountries = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            countries: ALLOWED_STRIPE_COUNTRIES.map((code) => ({
                code,
                label: getCountryLabel(code),
            })),
        });
    } catch (err) {
        console.error("getAllowedStripeCountries error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to load Stripe countries.",
        });
    }
};