import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },

    amountPaid: {
      type: Number,
      required: true,
    }, // cents

    trainerShare: {
      type: Number,
      required: true,
      default: 0,
    },

    adminShare: {
      type: Number,
      required: true,
      default: 0,
    },

    paidAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "refunded", "expired"],
      default: "active",
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    refundPercent: {
      type: Number,
      default: 65,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundRequestedAt: {
      type: Date,
      default: null,
    },

    refundProcessedAt: {
      type: Date,
      default: null,
    },

    stripeRefundId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;