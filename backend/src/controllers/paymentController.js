import stripe from "../config/stripe.js";
import Session from "../models/Session.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import ChatAccess from "../models/ChatAccess.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || null;

/**
 * 80/20 split
 * trainer gets 80%
 * admin/platform gets 20%
 */
const splitRevenue = (amount) => {
    const trainerShare = Math.round(amount * 0.8);
    const adminShare = amount - trainerShare;

    return {
        adminShare,
        trainerShare,
    };
};

const oneMonthLater = (date) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    return d;
};

/**
 * Ensures session enrollment, subscription, payment,
 * chat access, and notifications are created exactly once.
 */
const finalizePaidSession = async ({
    userId,
    trainerId,
    sessionId,
    amount,
    adminShare,
    trainerShare,
    stripeSessionId = null,
    stripePaymentIntentId = null,
    method = "card",
}) => {
    if (!userId || !trainerId || !sessionId) {
        console.error("finalizePaidSession missing required values:", {
            userId,
            trainerId,
            sessionId,
        });
        return;
    }

    const duplicatePayment = await Payment.findOne({
        $or: [
            ...(stripeSessionId ? [{ stripeSessionId }] : []),
            ...(stripePaymentIntentId ? [{ stripePaymentIntentId }] : []),
        ],
    });

    if (duplicatePayment) {
        return;
    }

    const now = new Date();
    const expires = oneMonthLater(now);

    const gymSession = await Session.findById(sessionId);

    if (gymSession) {
        const enrolledList = Array.isArray(gymSession.clientsEnrolled)
            ? gymSession.clientsEnrolled
            : [];

        const alreadyEnrolled = enrolledList.some(
            (id) => String(id) === String(userId)
        );

        const capacity = Number(gymSession.maxClients || 0);
        const full = capacity > 0 && enrolledList.length >= capacity;

        if (!alreadyEnrolled && !full) {
            gymSession.clientsEnrolled.push(userId);

            if (
                gymSession.clientsEnrolled.length === 1 &&
                gymSession.status === "Pending"
            ) {
                gymSession.status = "Confirmed";
            }

            await gymSession.save();
        }
    }

    // create or refresh chat access for 30 days
    await ChatAccess.findOneAndUpdate(
        { trainer: trainerId, member: userId },
        { expiresAt: expires },
        { upsert: true, new: true }
    );

    await Subscription.create({
        member: userId,
        trainer: trainerId,
        session: sessionId,
        amountPaid: amount,
        adminShare,
        trainerShare,
        paidAt: now,
        expiresAt: expires,
        active: true,
        status: "active",
    });

    await Payment.create({
        member: userId,
        trainer: trainerId,
        session: sessionId,
        amountTotal: amount,
        adminShare,
        trainerShare,
        currency: "aud",
        status: "succeeded",
        stripeSessionId,
        stripePaymentIntentId,
        method,
    });

    const notifications = [
        {
            role: "member",
            user: userId,
            type: "payment",
            title: "Payment Successful",
            message: `Your payment of $${(amount / 100).toFixed(2)} was successful.`,
            data: {
                sessionId,
                amountTotal: amount,
                expiresAt: expires,
                trainerShare,
                adminShare,
            },
        },
        {
            role: "trainer",
            user: trainerId,
            type: "payment",
            title: "Session Booked",
            message: `A member booked your session. Your share is $${(
                trainerShare / 100
            ).toFixed(2)}.`,
            data: {
                memberId: userId,
                sessionId,
                trainerShare,
            },
        },
    ];

    if (ADMIN_USER_ID) {
        notifications.push({
            role: "admin",
            user: ADMIN_USER_ID,
            type: "payment",
            title: "Platform Fee Received",
            message: `Platform fee received: $${(adminShare / 100).toFixed(2)}.`,
            data: {
                sessionId,
                adminShare,
                trainerId,
                memberId: userId,
            },
        });
    }

    await Notification.insertMany(notifications);
};

/**
 * POST /api/payments/checkout
 * BODY: { sessionId }
 */
export const createCheckoutSession = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "sessionId required" });
        }

        const user = req.user;

        if (user?.role !== "member") {
            return res.status(403).json({ message: "Only members can pay" });
        }

        const gymSession = await Session.findById(sessionId).populate({
            path: "trainer",
            select: "name email stripeAccountId stripeOnboarded",
        });

        if (!gymSession) {
            return res.status(404).json({ message: "Session not found" });
        }

        const amount = Number(gymSession.priceInCents || 0);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(200).json({
                message: "This session is free. No payment required.",
                free: true,
            });
        }

        if (amount > 1000) {
            return res.status(400).json({ message: "Max price allowed is $10.00" });
        }

        const trainer = gymSession.trainer;
        const { adminShare, trainerShare } = splitRevenue(amount);

        if (!trainer?.stripeAccountId) {
            return res.status(400).json({
                message: "Trainer is not connected to Stripe yet.",
            });
        }

        if (!trainer?.stripeOnboarded) {
            return res.status(400).json({
                message: "Trainer has not completed Stripe onboarding yet.",
            });
        }

        const metadata = {
            userId: String(user._id),
            trainerId: String(trainer?._id || ""),
            sessionId: String(sessionId),
            amount: String(amount),
            adminShare: String(adminShare),
            trainerShare: String(trainerShare),
            payoutMode: "split_80_20",
        };

        const checkout = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "aud",
                        product_data: {
                            name: gymSession.type || "Training Session",
                            description: `Trainer: ${trainer?.name || "Trainer"}`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            customer_email: user.email,
            metadata,
            success_url: `${FRONTEND_URL}/userClasses?paid=1&sessionId=${sessionId}`,
            cancel_url: `${FRONTEND_URL}/userClasses?paid=0&sessionId=${sessionId}`,
            payment_intent_data: {
                metadata,
                application_fee_amount: adminShare,
                transfer_data: {
                    destination: trainer.stripeAccountId,
                },
            },
        });

        return res.json({ url: checkout.url });
    } catch (err) {
        console.error("createCheckoutSession error:", err);
        return res.status(500).json({ message: "Stripe checkout error" });
    }
};

/**
 * POST /api/payments/create-intent
 * BODY: { sessionId }
 * For in-app PaymentElement flow
 */
export const createPaymentIntent = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: "sessionId required" });
        }

        if (req.user?.role !== "member") {
            return res.status(403).json({ message: "Only members can pay" });
        }

        const gymSession = await Session.findById(sessionId).populate(
            "trainer",
            "name email stripeAccountId stripeOnboarded"
        );

        if (!gymSession) {
            return res.status(404).json({ message: "Session not found" });
        }

        const amount = Number(gymSession.priceInCents || 0);

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.json({ free: true });
        }

        if (amount > 1000) {
            return res.status(400).json({ message: "Max price allowed is $10.00" });
        }

        if (!gymSession.trainer?.stripeAccountId) {
            return res.status(400).json({
                message: "Trainer is not connected to Stripe yet.",
            });
        }

        if (!gymSession.trainer?.stripeOnboarded) {
            return res.status(400).json({
                message: "Trainer has not completed Stripe onboarding yet.",
            });
        }

        const { adminShare, trainerShare } = splitRevenue(amount);

        const intent = await stripe.paymentIntents.create({
            amount,
            currency: "aud",
            automatic_payment_methods: { enabled: true },
            application_fee_amount: adminShare,
            transfer_data: {
                destination: gymSession.trainer.stripeAccountId,
            },
            metadata: {
                userId: String(req.user._id),
                trainerId: String(gymSession.trainer?._id || ""),
                sessionId: String(sessionId),
                amount: String(amount),
                adminShare: String(adminShare),
                trainerShare: String(trainerShare),
                payoutMode: "split_80_20",
            },
        });

        return res.json({ clientSecret: intent.client_secret });
    } catch (err) {
        console.error("createPaymentIntent error:", err);
        return res.status(500).json({ message: "Stripe payment intent error" });
    }
};

/**
 * POST /api/payments/webhook
 * IMPORTANT:
 * This route must receive raw request body.
 */
export const handleStripeWebhook = async (req, res) => {
    console.log("🔥 Stripe webhook route hit");

    let event;
    const sig = req.headers["stripe-signature"];

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("🔥 Stripe event verified:", event.type);
    } catch (err) {
        console.error("❌ Webhook verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        /**
         * FLOW 1:
         * Stripe Checkout success
         */
        if (event.type === "checkout.session.completed") {
            const data = event.data.object;
            const meta = data?.metadata || {};

            const userId = meta.userId;
            const trainerId = meta.trainerId;
            const sessionId = meta.sessionId;
            const amount = Number(meta.amount || 0);
            const adminShare = Number(meta.adminShare || 0);
            const trainerShare = Number(meta.trainerShare || 0);

            await finalizePaidSession({
                userId,
                trainerId,
                sessionId,
                amount,
                adminShare,
                trainerShare,
                stripeSessionId: data.id,
                stripePaymentIntentId: data.payment_intent || null,
                method: "card",
            });

            console.log("✅ Checkout session processed successfully:", data.id);
        }

        /**
         * FLOW 2:
         * PaymentIntent success (PaymentElement / create-intent)
         */
        if (event.type === "payment_intent.succeeded") {
            const data = event.data.object;
            const meta = data?.metadata || {};

            const userId = meta.userId;
            const trainerId = meta.trainerId;
            const sessionId = meta.sessionId;
            const amount = Number(meta.amount || 0);
            const adminShare = Number(meta.adminShare || 0);
            const trainerShare = Number(meta.trainerShare || 0);

            await finalizePaidSession({
                userId,
                trainerId,
                sessionId,
                amount,
                adminShare,
                trainerShare,
                stripeSessionId: null,
                stripePaymentIntentId: data.id,
                method: "card",
            });

            console.log("✅ PaymentIntent processed successfully:", data.id);
        }

        return res.json({ received: true });
    } catch (err) {
        console.error("handleStripeWebhook processing error:", err);
        return res.json({ received: true });
    }
};
export const confirmPaymentIntentAndFinalize = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: "paymentIntentId required" });
        }

        if (!req.user || req.user.role !== "member") {
            return res.status(403).json({ message: "Only members can confirm payment" });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent) {
            return res.status(404).json({ message: "PaymentIntent not found" });
        }

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                message: `Payment not completed. Current status: ${paymentIntent.status}`,
            });
        }

        const meta = paymentIntent.metadata || {};

        const userId = meta.userId;
        const trainerId = meta.trainerId;
        const sessionId = meta.sessionId;
        const amount = Number(meta.amount || 0);
        const adminShare = Number(meta.adminShare || 0);
        const trainerShare = Number(meta.trainerShare || 0);

        if (String(userId) !== String(req.user._id)) {
            return res.status(403).json({ message: "Payment does not belong to this member" });
        }

        await finalizePaidSession({
            userId,
            trainerId,
            sessionId,
            amount,
            adminShare,
            trainerShare,
            stripeSessionId: null,
            stripePaymentIntentId: paymentIntent.id,
            method: "card",
        });

        return res.json({
            success: true,
            message: "Payment confirmed and subscription activated.",
            paymentIntentId: paymentIntent.id,
        });
    } catch (err) {
        console.error("confirmPaymentIntentAndFinalize error:", err);
        return res.status(500).json({
            message: err?.message || "Failed to confirm payment",
        });
    }
};