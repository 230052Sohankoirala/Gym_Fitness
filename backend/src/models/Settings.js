import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        organization: {
            name: String,
            email: String,
            phone: String,
            timezone: String,
            maintenanceMode: { type: Boolean, default: false },
        },

        trainers: {
            requireVerification: { type: Boolean, default: true },
            showRatings: { type: Boolean, default: true },
            maxClientsPerTrainer: { type: Number, default: 50 },
        },

        classes: {
            defaultDurationMins: { type: Number, default: 60 },
            cancelWindowHours: { type: Number, default: 12 },
            autoWaitlist: { type: Boolean, default: true },
            maxCapacity: { type: Number, default: 20 },
        },

        billing: {
            currency: { type: String, default: "AUD" },
            taxRatePercent: { type: Number, default: 10 },
            gateway: { type: String, default: "Stripe" },
            invoicesFrom: String,
        },

        security: {
            enforce2FA: { type: Boolean, default: false },
            passwordMinLength: { type: Number, default: 8 },
            lockoutThreshold: { type: Number, default: 5 },
            ipAllowlist: String,
        },

        notifications: {
            emailFrom: String,
            provider: String,
            transactionalOn: Boolean,
            marketingOn: Boolean,
            smsEnabled: Boolean,
        },

        backups: {
            schedule: String,
            retentionDays: Number,
            autoDownload: Boolean,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
