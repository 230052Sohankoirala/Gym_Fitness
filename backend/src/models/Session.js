import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },

    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "HH:mm"
    type: { type: String, required: true },

    // ✅ Trainer sets price (0–1000 cents => $0–$10)
    priceInCents: { type: Number, required: true, default: 0, min: 0, max: 1000 },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "InProgress", "Completed", "Cancelled"],
      default: "Pending",
    },
    startAt: { type: Date },
    endAt: { type: Date },

    maxClients: { type: Number, required: true, min: 1, max: 30 }, // ✅ enforce 1–10

    clientsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // optional booking records (you can keep it)
    bookings: [
      {
        member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bookedAt: { type: Date, default: Date.now },
        paid: { type: Boolean, default: false },
        stripePaymentIntentId: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
