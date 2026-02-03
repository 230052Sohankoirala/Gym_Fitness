import NotificationPreferences from "../models/NotificationPreferences.js";

const DEFAULT_PREFS = {
    channels: { email: true, sms: false, inapp: true },
    categories: { bookings: true, reminders: true, promos: false, product: true },
    quietHours: { enabled: false, start: "22:00", end: "07:00" },
};

export const getMyNotificationPrefs = async (req, res) => {
    try {
        const prefs = await NotificationPreferences.findOne({ user: req.user._id }).lean();
        if (!prefs) return res.json(DEFAULT_PREFS);

        return res.json({
            channels: { ...DEFAULT_PREFS.channels, ...(prefs.channels || {}) },
            categories: { ...DEFAULT_PREFS.categories, ...(prefs.categories || {}) },
            quietHours: { ...DEFAULT_PREFS.quietHours, ...(prefs.quietHours || {}) },
        });
    } catch (e) {
        res.status(500).json({ message: "Failed to load notification preferences" });
    }
};

export const saveMyNotificationPrefs = async (req, res) => {
    try {
        const { channels, categories, quietHours } = req.body || {};

        const updated = await NotificationPreferences.findOneAndUpdate(
            { user: req.user._id },
            {
                $set: {
                    channels: { ...DEFAULT_PREFS.channels, ...(channels || {}) },
                    categories: { ...DEFAULT_PREFS.categories, ...(categories || {}) },
                    quietHours: { ...DEFAULT_PREFS.quietHours, ...(quietHours || {}) },
                },
            },
            { upsert: true, new: true }
        ).lean();

        res.json({
            channels: updated.channels,
            categories: updated.categories,
            quietHours: updated.quietHours,
        });
    } catch (e) {
        res.status(500).json({ message: "Failed to save notification preferences" });
    }
};
