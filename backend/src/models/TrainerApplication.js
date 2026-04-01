import mongoose from "mongoose";

const trainerApplicationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        experience: {
            type: String,
            required: true,
            trim: true,
        },

        specialization: {
            type: String,
            required: true,
            trim: true,
        },

        workedPlace: {
            type: String,
            required: true,
            trim: true,
        },

        workedPlacePhone: {
            type: String,
            required: true,
            trim: true,
        },

        certificationsText: {
            type: String,
            required: true,
            trim: true,
        },

        certificateImage: {
            type: String,
            required: true,
            trim: true,
        },

        bio: {
            type: String,
            required: true,
            trim: true,
        },

        motivation: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "reviewed", "approved", "rejected"],
            default: "pending",
        },

        adminNote: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const TrainerApplication = mongoose.model(
    "TrainerApplication",
    trainerApplicationSchema
);

export default TrainerApplication;