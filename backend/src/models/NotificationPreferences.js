import { Schema, model } from "mongoose";

const notificationPreferencesSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },

        channels: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            inapp: { type: Boolean, default: true },
        },

        categories: {
            bookings: { type: Boolean, default: true },
            reminders: { type: Boolean, default: true },
            promos: { type: Boolean, default: false },
            product: { type: Boolean, default: true },
        },

        quietHours: {
            enabled: { type: Boolean, default: false },
            start: { type: String, default: "22:00" },
            end: { type: String, default: "07:00" },
        },
    },
    { timestamps: true }
);

export default model("NotificationPreferences", notificationPreferencesSchema);
