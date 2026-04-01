import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
    {
        member: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        trainer: {
            type: Schema.Types.ObjectId,
            ref: "Trainer",
            required: true,
        },

        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },

        amountTotal: {
            type: Number,
            required: true,
        },

        adminShare: {
            type: Number,
            required: true,
        },

        trainerShare: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "aud",
        },

        status: {
            type: String,
            enum: [
                "succeeded",
                "pending",
                "failed",
                "partially_refunded",
                "refunded",
            ],
            default: "succeeded",
        },

        refundedAmount: {
            type: Number,
            default: 0,
        },

        refundPercent: {
            type: Number,
            default: 0,
        },

        refundedAt: {
            type: Date,
            default: null,
        },

        stripeRefundId: {
            type: String,
            default: null,
        },

        stripeSessionId: {
            type: String,
            default: null,
        },

        stripePaymentIntentId: {
            type: String,
            default: null,
        },

        method: {
            type: String,
            default: "card",
        },
    },
    { timestamps: true }
);

export default model("Payment", paymentSchema);