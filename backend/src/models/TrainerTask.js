// models/TrainerTask.js
import mongoose from "mongoose";

const trainerTaskSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
    title: { type: String, required: true },
    column: { type: String, enum: ["todo", "inProgress", "completed"], default: "todo" }, // ✅
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("TrainerTask", trainerTaskSchema);
