// models/WorkoutLog.js
import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workoutId: { type: String, required: true },
    workoutName: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: String }, // keep string because we sometimes send "xx mins (est. yy mins)"
    calories: { type: Number },
    intensity: { type: String },
    countsTowardGoal: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema)
export default WorkoutLog