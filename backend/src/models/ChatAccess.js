// src/models/ChatAccess.js
import { Schema, model } from "mongoose";

/**
 * ChatAccess = one row per (trainer, member)
 * expiresAt controls when chat becomes locked again.
 */
const chatAccessSchema = new Schema(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer", required: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    lastUnlockedAt: { type: Date, default: Date.now },
    reason: { type: String, default: "session_booking" }, // optional
  },
  { timestamps: true }
);

chatAccessSchema.index({ trainer: 1, member: 1 }, { unique: true });

export default model("ChatAccess", chatAccessSchema);
