// src/pages/trainer/NotificationsPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    Bell,
    ArrowLeft,
    Check,
    Trash2,
    Calendar,
    Users,
    MessageSquare,
    AlertTriangle,
    Info,
    CreditCard,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API_ROOT = import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";
const BASE_URL = API_ROOT;

function getToken() {
    return (
        localStorage.getItem("trainerToken") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("trainerToken") ||
        sessionStorage.getItem("token")
    );
}

function timeAgo(dateString) {
    if (!dateString) return "";

    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;

    const hrs = Math.floor(mins / 60);

    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;

    const days = Math.floor(hrs / 24);

    return `${days} day${days === 1 ? "" : "s"} ago`;
}

const TrainerNotification = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const baseBg = darkMode
        ? "bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#0f172a]"
        : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60";

    const cardBg = darkMode ? "bg-gray-800" : "bg-white";
    const baseText = darkMode ? "text-gray-100" : "text-gray-900";
    const mutedText = darkMode ? "text-gray-400" : "text-gray-600";
    const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
    const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";

    const getNotificationIcon = (type) => {
        switch (type) {
            case "payment":
                return <CreditCard size={18} className="text-emerald-500" />;
            case "session":
            case "booking":
                return <Calendar size={18} className="text-blue-500" />;
            case "message":
                return <MessageSquare size={18} className="text-green-500" />;
            case "client":
                return <Users size={18} className="text-purple-500" />;
            case "system":
                return <Info size={18} className="text-gray-500" />;
            case "reminder":
                return <AlertTriangle size={18} className="text-orange-500" />;
            default:
                return <Bell size={18} className="text-gray-500" />;
        }
    };

    const fetchNotifications = useCallback(async () => {
        const token = getToken();

        if (!token) return navigate("/login");

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${BASE_URL}/api/notifications?role=trainer`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Failed to load notifications");
            }

            const list = Array.isArray(data) ? data : [];

            const normalised = list.map((n) => {
                const createdAt = n.createdAt || null;

                return {
                    id: n._id,
                    type: n.type || "system",
                    title: n.title || "Notification",
                    message: n.message || "You have a new update.",
                    read: Boolean(n.isRead),
                    important: Boolean(n.important),
                    createdAt,
                    time: createdAt ? timeAgo(createdAt) : "",
                    actor: n.actor || null,
                    data: n.data || {},
                };
            });

            setNotifications(normalised);
        } catch (e) {
            setError(e?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        const token = getToken();

        if (!token) return;

        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        try {
            await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        const token = getToken();

        if (!token) return;

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        try {
            await fetch(`${BASE_URL}/api/notifications/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            fetchNotifications();
        }
    };

    const deleteNotification = async (id) => {
        const token = getToken();

        if (!token) return;

        const old = notifications;

        setNotifications((prev) => prev.filter((n) => n.id !== id));

        try {
            await fetch(`${BASE_URL}/api/notifications/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            setNotifications(old);
        }
    };

    const clearAll = async () => {
        const token = getToken();

        if (!token) return;

        const old = notifications;

        setNotifications([]);

        try {
            await fetch(`${BASE_URL}/api/notifications`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            setNotifications(old);
        }
    };

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const importantCount = useMemo(
        () => notifications.filter((n) => n.important).length,
        [notifications]
    );

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            if (filter === "unread") return !n.read;
            if (filter === "important") return n.important;
            return true;
        });
    }, [notifications, filter]);

    return (
        <div className={`min-h-screen ${baseBg} ${baseText} transition-colors duration-200`}>
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link
                        to="/trainerHome"
                        className={`inline-flex items-center gap-2 ${mutedText} ${hoverBg} rounded-lg px-3 py-2 transition-colors mb-4`}
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cardBg} border ${borderColor}`}>
                                <Bell size={24} className="text-indigo-500" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">Notifications</h1>

                                <p className={mutedText}>
                                    {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchNotifications}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${darkMode
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                            >
                                Refresh
                            </button>

                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${unreadCount === 0
                                        ? `${mutedText} cursor-not-allowed opacity-50`
                                        : `${darkMode
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-green-500 hover:bg-green-600"
                                        } text-white`
                                    }`}
                            >
                                Mark all as read
                            </button>

                            <button
                                onClick={clearAll}
                                disabled={notifications.length === 0}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${notifications.length === 0
                                        ? `${mutedText} cursor-not-allowed opacity-50`
                                        : `${darkMode
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-red-500 hover:bg-red-600"
                                        } text-white`
                                    }`}
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`mb-6 p-1 rounded-lg ${cardBg} border ${borderColor} inline-flex`}>
                    {[
                        { key: "all", label: "All", count: notifications.length },
                        { key: "unread", label: "Unread", count: unreadCount },
                        { key: "important", label: "Important", count: importantCount },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === tab.key
                                    ? `${darkMode ? "bg-indigo-600" : "bg-indigo-500"} text-white`
                                    : `${mutedText} ${hoverBg}`
                                }`}
                        >
                            {tab.label} {tab.count > 0 && `(${tab.count})`}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className={`${cardBg} border ${borderColor} rounded-xl p-4`}>
                        <p className={mutedText}>Loading notifications...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className={`${cardBg} border ${borderColor} rounded-xl p-4`}>
                        <p className="text-red-500 font-medium">Error: {error}</p>

                        <button
                            onClick={fetchNotifications}
                            className={`mt-3 px-4 py-2 rounded-lg font-medium transition-colors ${darkMode
                                    ? "bg-gray-700 hover:bg-gray-600"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-4">
                        {filteredNotifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-center py-12 ${cardBg} rounded-xl border ${borderColor}`}
                            >
                                <Bell size={48} className={`mx-auto mb-4 ${mutedText}`} />

                                <h3 className="text-lg font-semibold mb-2">No notifications</h3>

                                <p className={mutedText}>You're all caught up!</p>
                            </motion.div>
                        ) : (
                            filteredNotifications.map((n, index) => {
                                const actorName =
                                    n.data?.memberId?.fullName || n.actor?.name || "A user";

                                return (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${cardBg} rounded-xl border ${borderColor} p-4 transition-all duration-200 ${!n.read
                                                ? `${darkMode ? "bg-blue-900/20" : "bg-blue-50"} border-blue-200`
                                                : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">{getNotificationIcon(n.type)}</div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className={`font-semibold ${!n.read ? "text-blue-500" : baseText}`}>
                                                        {n.title}
                                                    </h3>

                                                    <span className={`text-xs ${mutedText}`}>{n.time}</span>
                                                </div>

                                                <p className={`text-sm ${mutedText} mb-3`}>{n.message}</p>

                                                {n.type === "payment" && (
                                                    <div className={`text-xs ${mutedText} mb-3`}>
                                                        <span className="mr-3">
                                                            User: <span className="font-medium">{actorName}</span>
                                                        </span>

                                                        {typeof n.data?.amountTotal === "number" && (
                                                            <span className="mr-3">
                                                                Amount:{" "}
                                                                <span className="font-medium">
                                                                    {n.data?.currency || "AUD"} ${n.data.amountTotal}
                                                                </span>
                                                            </span>
                                                        )}

                                                        {n.data?.className && (
                                                            <span className="mr-3">
                                                                Class:{" "}
                                                                <span className="font-medium">
                                                                    {n.data.className}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    {!n.read && (
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            className={`text-xs px-2 py-1 rounded transition-colors ${darkMode
                                                                    ? "bg-gray-700 hover:bg-gray-600"
                                                                    : "bg-gray-200 hover:bg-gray-300"
                                                                }`}
                                                        >
                                                            <Check size={12} className="inline mr-1" />
                                                            Mark read
                                                        </button>
                                                    )}

                                                    {n.important && (
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded ${darkMode
                                                                    ? "bg-orange-900/50 text-orange-300"
                                                                    : "bg-orange-100 text-orange-800"
                                                                }`}
                                                        >
                                                            Important
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => deleteNotification(n.id)}
                                                className={`p-2 rounded-lg transition-colors ${hoverBg} ${mutedText}`}
                                                aria-label="Delete notification"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                )}

                {!loading && !error && notifications.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-center mt-5 py-16 ${cardBg} rounded-xl border ${borderColor}`}
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Bell size={24} className={mutedText} />
                        </div>

                        <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>

                        <p className={`max-w-md mx-auto ${mutedText} mb-6`}>
                            When you get notifications, they'll appear here. You'll see updates
                            about messages, sessions, and payments for your classes.
                        </p>

                        <Link
                            to="/trainerHome"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${darkMode
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                                }`}
                        >
                            Go to Dashboard
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TrainerNotification;