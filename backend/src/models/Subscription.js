// backend/models/Subscription.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },

    amountPaid: { type: Number, required: true },       // in cents
    trainerShare: { type: Number, required: true },     // 80%
    adminShare: { type: Number, required: true },       // 20%

    paidAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },

    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
