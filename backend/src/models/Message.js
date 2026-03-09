// backend/models/Message.js
import mongoose from "mongoose";

/**
 * Message Schema (supports BOTH User + Trainer senders)
 * - member: always a User
 * - trainer: always a Trainer
 * - sender: can be User OR Trainer using refPath
 * - attachments: images/videos/files metadata
 */
const messageSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true, index: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    senderModel: { type: String, required: true, enum: ["User", "Trainer"] },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "senderModel", index: true },

    text: { type: String, trim: true, maxlength: 2000, default: "" },

    attachments: [
      {
        type: { type: String, enum: ["image", "video", "file"], required: true },
        url: { type: String, required: true },
        filename: { type: String, default: "" },
        mime: { type: String, default: "" },
        size: { type: Number, default: 0 },
      },
    ],

    readByMember: { type: Boolean, default: false },
    readByTrainer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
