// models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },

        // Keep your string date/time if you want, but prefer real Dates for audit:
        date: { type: String, required: true },  // "YYYY-MM-DD"
        time: { type: String, required: true },  // "HH:mm"
        type: { type: String, required: true },

        // NEW: lifecycle fields
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "InProgress", "Completed", "Cancelled"],
            default: "Pending",
        },
        startAt: { type: Date },   // set when trainer presses Start
        endAt: { type: Date },     // set when trainer presses Complete

        maxClients: { type: Number, required: true },
        clientsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
