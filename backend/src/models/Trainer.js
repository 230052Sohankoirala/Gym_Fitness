import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const trainerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // For Stripe payouts
    stripeAccountId: { type: String },

    // Dashboard totals (optional)
    totalEarnings: { type: Number, default: 0 },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: "trainer" },
    createdByAdmin: { type: Boolean, default: false },

    speciality: { type: String, default: "General Fitness" },
    experience: { type: String, default: "N/A" },
    bio: { type: String, default: "" },
    rating: { type: Number, default: 0 },

    // ✅ Add avatar field
    avatar: { type: String, default: "" },
  },

  { timestamps: true }
);

// hash password before save
trainerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
trainerSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

trainerSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Trainer ||
  mongoose.model("Trainer", trainerSchema);
