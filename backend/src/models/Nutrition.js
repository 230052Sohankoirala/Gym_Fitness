import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    food: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    time: { type: String, required: true }, // e.g. "08:15 AM"
    date: { type: String, required: true }, // e.g. "2025-09-05"
  },
  { timestamps: true }
);

const Nutrition = mongoose.model("Nutrition", nutritionSchema);
export default Nutrition;
