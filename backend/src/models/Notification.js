// models/Notification.js
import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },

    role: {
      type: String,
      enum: ["member", "trainer", "admin"],
      required: true,
    },

    type: {
      type: String,
      enum: ["payment", "booking", "system", "session", "message", "reminder"],
      default: "system",
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    data: {
      sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
      memberId: { type: Schema.Types.ObjectId, ref: "User" },
      trainerId: { type: Schema.Types.ObjectId, ref: "Trainer" },
      amountTotal: Number,
      amountAdmin: Number,
      amountTrainer: Number,
      currency: String,
    },

    isRead: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Notification", notificationSchema);
