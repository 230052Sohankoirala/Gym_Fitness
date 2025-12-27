// models/Payment.js
import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
    {
        member: { type: Schema.Types.ObjectId, ref: "User", required: true },
        trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
        session: { type: Schema.Types.ObjectId, ref: "Session", required: true },

        // amounts in cents (e.g. 300 = $3.00)
        amountTotal: { type: Number, required: true },
        adminShare: { type: Number, required: true },
        trainerShare: { type: Number, required: true },

        currency: { type: String, default: "aud" },

        status: {
            type: String,
            enum: ["succeeded", "pending", "failed"],
            default: "succeeded",
        },

        stripeSessionId: { type: String },
        stripePaymentIntentId: { type: String },

        method: { type: String }, // "card" etc.
    },
    { timestamps: true }
);

export default model("Payment", paymentSchema);
