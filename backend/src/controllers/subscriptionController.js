// backend/controllers/subscriptionController.js
import mongoose from "mongoose";
import stripe from "../config/stripe.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import Session from "../models/Session.js";
import ChatAccess from "../models/ChatAccess.js";

const REFUND_PERCENT = 65;

const canRefundSession = (session) => {
    if (!session) return false;

    // No refund if already started/completed/cancelled
    if (
        session.status === "InProgress" ||
        session.status === "Completed" ||
        session.status === "Cancelled"
    ) {
        return false;
    }

    return true;
};

/**
 * GET /api/subscriptions/me
 * latest active subscription for logged-in member
 */
export const getMyActiveSubscription = async (req, res) => {
    try {
        const sub = await Subscription.findOne({
            member: req.user._id,
            active: true,
            status: "active",
            expiresAt: { $gt: new Date() },
        })
            .populate("trainer", "name email")
            .populate("session", "date time type status priceInCents")
            .sort({ createdAt: -1 });

        return res.json(sub || null);
    } catch (err) {
        console.error("getMyActiveSubscription error:", err);
        return res.status(500).json({ message: "Cannot fetch active subscription" });
    }
};

/**
 * GET /api/subscriptions/history
 * all subscriptions for logged-in member
 */
export const getMySubscriptionHistory = async (req, res) => {
    try {
        const subs = await Subscription.find({
            member: req.user._id,
        })
            .populate("trainer", "name email")
            .populate("session", "date time type status priceInCents")
            .sort({ createdAt: -1 });

        return res.json(subs);
    } catch (err) {
        console.error("getMySubscriptionHistory error:", err);
        return res.status(500).json({ message: "Cannot fetch subscription history" });
    }
};

/**
 * POST /api/subscriptions/:id/cancel
 * member cancels own subscription and gets 65% refund
 */
export const cancelMySubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid subscription id" });
        }

        const sub = await Subscription.findById(id);
        if (!sub) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        if (String(sub.member) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not allowed to cancel this subscription" });
        }

        if (!sub.active || sub.status === "cancelled" || sub.status === "refunded") {
            return res.status(400).json({ message: "Subscription is already inactive" });
        }

        const session = sub.session ? await Session.findById(sub.session) : null;

        if (!canRefundSession(session)) {
            return res.status(400).json({
                message: "Refund not allowed because the session has already started or ended",
            });
        }

        const payment = await Payment.findOne({
            member: sub.member,
            trainer: sub.trainer,
            session: sub.session,
            status: { $in: ["succeeded", "partially_refunded"] },
        }).sort({ createdAt: -1 });

        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        if (payment.refundedAmount > 0 || sub.refundProcessedAt) {
            return res.status(400).json({ message: "Refund already processed for this subscription" });
        }

        const refundAmount = Math.floor((sub.amountPaid * REFUND_PERCENT) / 100);

        let refund = null;

        if (payment.stripePaymentIntentId) {
            refund = await stripe.refunds.create({
                payment_intent: payment.stripePaymentIntentId,
                amount: refundAmount,
                reason: "requested_by_customer",
                metadata: {
                    memberId: String(sub.member),
                    trainerId: String(sub.trainer),
                    sessionId: String(sub.session || ""),
                    subscriptionId: String(sub._id),
                    refundPercent: String(REFUND_PERCENT),
                },
            });
        }

        // remove member from session if present
        if (session) {
            session.clientsEnrolled = (session.clientsEnrolled || []).filter(
                (uid) => String(uid) !== String(req.user._id)
            );

            if ((session.clientsEnrolled || []).length === 0 && session.status === "Confirmed") {
                session.status = "Pending";
            }

            await session.save();
        }

        // revoke chat access immediately
        await ChatAccess.findOneAndUpdate(
            {
                trainer: sub.trainer,
                member: sub.member,
            },
            {
                expiresAt: new Date(),
            }
        );

        // update payment
        payment.refundedAmount = refundAmount;
        payment.refundPercent = REFUND_PERCENT;
        payment.refundedAt = new Date();
        payment.stripeRefundId = refund?.id || null;
        payment.status =
            refundAmount >= payment.amountTotal ? "refunded" : "partially_refunded";
        await payment.save();

        // update subscription
        sub.active = false;
        sub.status = "refunded";
        sub.cancellationReason = String(reason || "").trim();
        sub.cancelledAt = new Date();
        sub.refundRequestedAt = new Date();
        sub.refundProcessedAt = new Date();
        sub.refundPercent = REFUND_PERCENT;
        sub.refundAmount = refundAmount;
        sub.stripeRefundId = refund?.id || null;
        await sub.save();

        return res.json({
            success: true,
            message: `Subscription cancelled. Refund of ${REFUND_PERCENT}% processed.`,
            subscription: sub,
            refund: {
                percent: REFUND_PERCENT,
                refundAmount,
                refundAmountDisplay: `$${(refundAmount / 100).toFixed(2)}`,
                stripeRefundId: refund?.id || null,
            },
        });
    } catch (err) {
        console.error("cancelMySubscription error:", err);
        return res.status(500).json({
            message: err?.message || "Failed to cancel subscription",
        });
    }
};