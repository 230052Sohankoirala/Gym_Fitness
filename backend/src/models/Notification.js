import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // ✅ who receives this notification (personal). If null => broadcast by role
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // ✅ which collection the recipient belongs to
    recipientModel: {
      type: String,
      enum: ["User", "Trainer", "Admin"],
      default: "User",
    },

    // broadcast target role
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

    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    data: {
      sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

      memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

      // ✅ if your trainer is a Trainer model, keep Trainer here
      trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },

      amountTotal: Number,
      amountAdmin: Number,
      amountTrainer: Number,
      currency: { type: String, default: "AUD" },

      className: String,
      sessionTime: String,
      chatId: String,
    },

    isRead: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
