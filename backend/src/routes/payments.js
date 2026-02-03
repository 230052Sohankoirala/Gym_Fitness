import express from "express";
import stripe from "../config/stripe.js";
import Session from "../models/Session.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || null;

// ✅ Admin gets 100% (trainerShare = 0)
function splitRevenue(amount) {
  return { adminShare: amount, trainerShare: 0 };
}

function oneMonthLater(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * POST /api/payments/checkout
 * BODY: { sessionId }
 */
router.post("/checkout", protect, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) return res.status(400).json({ message: "sessionId required" });

    const user = req.user;
    if (user?.role !== "member") {
      return res.status(403).json({ message: "Only members can pay" });
    }

    const gymSession = await Session.findById(sessionId).populate({
      path: "trainer",
      select: "name email",
    });

    if (!gymSession) return res.status(404).json({ message: "Session not found" });

    // ✅ amount in cents
    const amount = Number(gymSession.priceInCents || 0);

    // ✅ treat <=0 as free
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(200).json({
        message: "This session is free. No payment required.",
        free: true,
      });
    }

    // ✅ safety: cap to $10
    if (amount > 1000) {
      return res.status(400).json({ message: "Max price allowed is $10.00" });
    }

    const trainer = gymSession.trainer;
    const { adminShare, trainerShare } = splitRevenue(amount);

    const metadata = {
      userId: String(user._id),
      trainerId: String(trainer?._id || ""),
      sessionId: String(sessionId),
      amount: String(amount),
      adminShare: String(adminShare),
      trainerShare: String(trainerShare),
      payoutMode: "admin_only",
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


      // ✅ admin receives full amount (NO transfer_data, NO application_fee)
      payment_intent_data: {
        metadata,
      },
    });

    return res.json({ url: checkout.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ message: "Stripe error" });
  }
});

/**
 * Stripe Webhook
 * Mounted at: POST /api/payments/webhook
 */
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  let event;
  const sig = req.headers["stripe-signature"];

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const data = event.data.object;

    const meta = data?.metadata || {};
    const userId = meta.userId;
    const trainerId = meta.trainerId;
    const sessionId = meta.sessionId;

    const amount = Number(meta.amount || 0);
    const adminShare = Number(meta.adminShare || 0);
    const trainerShare = Number(meta.trainerShare || 0);

    if (!userId || !sessionId) {
      console.error("Webhook missing metadata:", meta);
      return res.json({ received: true });
    }

    const now = new Date();
    const expires = oneMonthLater(now);

    try {
      const existing = await Payment.findOne({ stripeSessionId: data.id });
      if (existing) return res.json({ received: true });

      // ✅ Auto-enroll after payment (still works)
      const gymSession = await Session.findById(sessionId);
      if (gymSession) {
        const enrolledList = gymSession.clientsEnrolled || [];
        const alreadyEnrolled = enrolledList.some((id) => id.toString() === userId.toString());

        const capacity = Number(gymSession.maxClients || 0);
        const full = capacity > 0 && enrolledList.length >= capacity;

        if (!alreadyEnrolled && !full) {
          gymSession.clientsEnrolled.push(userId);
          await gymSession.save();
        }
      }

      // ✅ Subscription record (admin only)
      await Subscription.create({
        member: userId,
        trainer: trainerId || undefined, // can be blank if you want
        amountPaid: amount,
        adminShare,
        trainerShare,
        paidAt: now,
        expiresAt: expires,
        active: true,
      });

      await Payment.create({
        member: userId,
        trainer: trainerId || undefined,
        session: sessionId,
        amountTotal: amount,
        adminShare,
        trainerShare,
        currency: "aud",
        stripeSessionId: data.id,
        stripePaymentIntentId: data.payment_intent,
      });

      await Notification.insertMany([
        {
          role: "member",
          user: userId,
          type: "payment",
          title: "Payment Successful",
          message: `Your payment of $${(amount / 100).toFixed(2)} was successful.`,
          data: { sessionId, amountTotal: amount, expiresAt: expires },
        },
        // trainer notification optional (admin-only payout, but still can notify)
        trainerId
          ? {
            role: "trainer",
            user: trainerId,
            type: "payment",
            title: "A member booked your session",
            message: `A member paid $${(amount / 100).toFixed(2)} to book your session.`,
            data: { memberId: userId, sessionId },
          }
          : null,
        ADMIN_USER_ID
          ? {
            role: "admin",
            user: ADMIN_USER_ID,
            type: "payment",
            title: "Revenue Earned",
            message: `Admin received $${(adminShare / 100).toFixed(2)}.`,
            data: { amountAdmin: adminShare },
          }
          : null,
      ].filter(Boolean));

      console.log("✅ Payment processed (admin-only):", data.id);
    } catch (err) {
      console.error("Payment processing error:", err);
    }
  }

  return res.json({ received: true });
});
router.post("/create-intent", protect, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) return res.status(400).json({ message: "sessionId required" });

    if (req.user?.role !== "member") {
      return res.status(403).json({ message: "Only members can pay" });
    }

    const gymSession = await Session.findById(sessionId).populate("trainer", "name email");
    if (!gymSession) return res.status(404).json({ message: "Session not found" });

    const amount = Number(gymSession.priceInCents || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.json({ free: true });
    }

    // ✅ ADMIN receives payment (no transfer_data)
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(req.user._id),
        trainerId: String(gymSession.trainer?._id || ""),
        sessionId: String(sessionId),
        amount: String(amount),
      },
    });

    return res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("create-intent error:", err);
    return res.status(500).json({ message: "Stripe error" });
  }
});


export default router;
