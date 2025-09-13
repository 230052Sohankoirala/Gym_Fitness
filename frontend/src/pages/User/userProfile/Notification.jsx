import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone, Clock } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const UserNotifications = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    const [prefs, setPrefs] = useState({
        channels: { email: true, sms: false, inapp: true },
        categories: {
            bookings: true,
            reminders: true,
            promos: false,
            product: true,
        },
        quietHours: { enabled: false, start: "22:00", end: "07:00" },
    });

    const onSave = () => {
        // persist to API
        console.log("saved", prefs);
    };

    const card = `rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`;
    const sub = darkMode ? "text-gray-300" : "text-gray-600";

    return (
        <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            {/* Header */}
            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-100"} transition-colors duration-200`}>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"} transition-colors duration-200`}
                        aria-label="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className={`text-xl sm:text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
                        Notifications
                    </h1>
                    <div className="ml-auto">
                        <button
                            onClick={onSave}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Channels */}
                <div className={card}>
                    <h3 className="font-semibold flex items-center gap-2">
                        <Bell size={18} /> Channels
                    </h3>
                    <p className={`text-sm ${sub} mt-1`}>Choose how you’d like to receive updates.</p>

                    <div className={` transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-gray-100"} mt-2 rounded-xl p-2 sm:p-3 space-y-2`}>
                        <ChannelToggle
                            label="Email"
                            icon={<Mail size={16} />}
                            enabled={prefs.channels.email}
                            onChange={(v) => setPrefs((p) => ({ ...p, channels: { ...p.channels, email: v } }))}
                            darkMode={darkMode}
                        />
                        <ChannelToggle
                            label="SMS"
                            icon={<Smartphone size={16} />}
                            enabled={prefs.channels.sms}
                            onChange={(v) => setPrefs((p) => ({ ...p, channels: { ...p.channels, sms: v } }))}
                            darkMode={darkMode}
                        />
                        <ChannelToggle
                            label="In-App"
                            icon={<MessageSquare size={16} />}
                            enabled={prefs.channels.inapp}
                            onChange={(v) => setPrefs((p) => ({ ...p, channels: { ...p.channels, inapp: v } }))}
                            darkMode={darkMode}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className={card}>
                    <h3 className="font-semibold">Categories</h3>
                    <div className="mt-2 space-y-2">
                        <RowToggle
                            label="Booking Updates"
                            description="Confirmations, changes, cancellations."
                            enabled={prefs.categories.bookings}
                            onChange={(v) => setPrefs((p) => ({ ...p, categories: { ...p.categories, bookings: v } }))}
                            darkMode={darkMode}
                        />
                        <RowToggle
                            label="Reminders"
                            description="Upcoming class reminders and check-ins."
                            enabled={prefs.categories.reminders}
                            onChange={(v) => setPrefs((p) => ({ ...p, categories: { ...p.categories, reminders: v } }))}
                            darkMode={darkMode}
                        />
                        <RowToggle
                            label="Promotions"
                            description="Offers and discounts."
                            enabled={prefs.categories.promos}
                            onChange={(v) => setPrefs((p) => ({ ...p, categories: { ...p.categories, promos: v } }))}
                            darkMode={darkMode}
                        />
                        <RowToggle
                            label="Product Updates"
                            description="New features and announcements."
                            enabled={prefs.categories.product}
                            onChange={(v) => setPrefs((p) => ({ ...p, categories: { ...p.categories, product: v } }))}
                            darkMode={darkMode}
                        />
                    </div>
                </div>

                {/* Quiet Hours */}
                <div className={card}>
                    <h3 className="font-semibold flex items-center gap-2">
                        <Clock size={18} /> Quiet Hours
                    </h3>
                    <p className={`text-sm ${sub} mt-1`}>Pause notifications during these hours.</p>

                    <div className="mt-3">
                        <RowToggle
                            label="Enable Quiet Hours"
                            enabled={prefs.quietHours.enabled}
                            onChange={(v) => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, enabled: v } }))}
                            darkMode={darkMode}
                        />
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 ${!prefs.quietHours.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                        <TimeInput
                            label="Start"
                            value={prefs.quietHours.start}
                            onChange={(v) => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, start: v } }))}
                            darkMode={darkMode}
                        />
                        <TimeInput
                            label="End"
                            value={prefs.quietHours.end}
                            onChange={(v) => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, end: v } }))}
                            darkMode={darkMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- UI bits --- */

const ChannelToggle = ({ label, icon, enabled, onChange, darkMode }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`w-full rounded-xl px-3 py-3 text-left transition-colors duration-200 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
            }`}
    >
        <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
                <span className={`p-2 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>{icon}</span>
                {label}
            </span>
            <Switch enabled={enabled} darkMode={darkMode} />
        </div>
    </button>
);

const RowToggle = ({ label, description, enabled, onChange, darkMode }) => (
    <div className="flex items-start justify-between gap-3 py-2">
        <div className="min-w-0">
            <p className="font-medium">{label}</p>
            {description && <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{description}</p>}
        </div>
        <button type="button" onClick={() => onChange(!enabled)} aria-pressed={enabled}>
            <Switch enabled={enabled} darkMode={darkMode} />
        </button>
    </div>
);

const Switch = ({ enabled, darkMode }) => (
    <span
        className={`relative inline-flex items-center rounded-full h-6 w-12 transition-colors duration-200 ${enabled ? "bg-indigo-600" : darkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${enabled ? "translate-x-6" : "translate-x-1"
                }`}
        />
    </span>
);

const TimeInput = ({ label, value, onChange, darkMode }) => (
    <label className="block text-sm">
        <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
        <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`mt-1 w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition ${darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500"
                }`}
        />
    </label>
);

export default UserNotifications;
