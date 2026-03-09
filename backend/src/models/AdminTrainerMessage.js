import mongoose from "mongoose";

const AdminTrainerMessageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminTrainerChat", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ["admin", "trainer"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

AdminTrainerMessageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model("AdminTrainerMessage", AdminTrainerMessageSchema);
