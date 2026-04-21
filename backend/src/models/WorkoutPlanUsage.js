import mongoose from "mongoose";

const workoutPlanUsageSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        dateKey: {
            type: String,
            required: true,
            index: true,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

workoutPlanUsageSchema.index({ user: 1, dateKey: 1 }, { unique: true });

export default mongoose.model("WorkoutPlanUsage", workoutPlanUsageSchema);