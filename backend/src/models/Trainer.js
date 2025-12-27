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

    password: { type: String, required: true, minlength: 6 },

    role: { type: String, default: "trainer" },
    createdByAdmin: { type: Boolean, default: false },

    speciality: { type: String, default: "General Fitness" },
    experience: { type: String, default: "N/A" },
    bio: { type: String, default: "" },
    rating: { type: Number, default: 0 },

    avatar: { type: String, default: "" },

    // Stripe Connect (payouts)
    stripeAccountId: { type: String, default: null },
    stripeOnboarded: { type: Boolean, default: false },

    // Optional dashboard metric
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before save
trainerSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
trainerSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

trainerSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Trainer || mongoose.model("Trainer", trainerSchema);
