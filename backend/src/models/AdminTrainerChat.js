import mongoose from "mongoose";

const AdminTrainerChatSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

AdminTrainerChatSchema.index({ adminId: 1, trainerId: 1 }, { unique: true });

export default mongoose.model("AdminTrainerChat", AdminTrainerChatSchema);
