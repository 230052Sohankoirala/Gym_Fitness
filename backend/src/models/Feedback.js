// src/models/Feedback.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // allow guest feedback if you want
        },

        // store a snapshot too (good for admin reports even if user deletes account)
        nameSnapshot: { type: String, default: "" },
        emailSnapshot: { type: String, default: "" },

        message: {
            type: String,
            required: [true, "Feedback message is required"],
            minlength: [10, "Feedback must be at least 10 characters"],
            maxlength: [500, "Feedback must be at most 500 characters"],
            trim: true,
        },

        category: {
            type: String,
            enum: ["bug", "feature", "billing", "ui", "other"],
            default: "other",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        status: {
            type: String,
            enum: ["new", "reviewing", "resolved", "rejected"],
            default: "new",
        },

        adminNote: { type: String, default: "", maxlength: 800 },

        // helpful for audits
        meta: {
            appVersion: { type: String, default: "" },
            platform: { type: String, default: "" }, // web / ios / android
            userAgent: { type: String, default: "" },
            ip: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, createdAt: -1 });
feedbackSchema.index({ message: "text", nameSnapshot: "text", emailSnapshot: "text" });

export default mongoose.model("Feedback", feedbackSchema);