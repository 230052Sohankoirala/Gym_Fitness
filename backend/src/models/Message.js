// backend/models/Message.js
import mongoose from "mongoose";

/**
 * Message Schema (supports BOTH User + Trainer senders)
 * - member: always a User
 * - trainer: always a Trainer
 * - sender: can be User OR Trainer using refPath
 */
const messageSchema = new mongoose.Schema(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
      index: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ sender can be either "User" or "Trainer"
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Trainer"],
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
      index: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

// Helpful compound index for fast chat history lookups
messageSchema.index({ trainer: 1, member: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
