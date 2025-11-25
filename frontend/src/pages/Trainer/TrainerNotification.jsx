// src/pages/trainer/NotificationsPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import {
    Bell,
    ArrowLeft,
    Check,
    Trash2,
    Filter,
    Calendar,
    Users,
    MessageSquare,
    AlertTriangle,
    Info
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const TrainerNotification = () => {
    const { darkMode } = useTheme();
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "session",
            title: "New Session Request",
            message: "John Smith requested a training session for tomorrow at 3:00 PM",
            time: "5 minutes ago",
            read: false,
            important: true
        },
        {
            id: 2,
            type: "message",
            title: "New Message",
            message: "You have a new message from Sarah Johnson",
            time: "1 hour ago",
            read: false,
            important: false
        },
        {
            id: 3,
            type: "client",
            title: "New Client Registration",
            message: "Michael Brown has registered as your client",
            time: "2 hours ago",
            read: true,
            important: false
        },
        {
            id: 4,
            type: "system",
            title: "System Update",
            message: "New features available in your trainer dashboard",
            time: "1 day ago",
            read: true,
            important: false
        },
        {
            id: 5,
            type: "reminder",
            title: "Session Reminder",
            message: "You have a session with Emily Davis in 30 minutes",
            time: "2 days ago",
            read: true,
            important: true
        }
    ]);

    const [filter, setFilter] = useState("all"); // all, unread, important

    const baseBg = darkMode ? "bg-gray-900" : "bg-gray-50";
    const cardBg = darkMode ? "bg-gray-800" : "bg-white";
    const baseText = darkMode ? "text-gray-100" : "text-gray-900";
    const mutedText = darkMode ? "text-gray-400" : "text-gray-600";
    const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
    const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100";

    const getNotificationIcon = (type) => {
        switch (type) {
            case "session":
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

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === "unread") return !notif.read;
        if (filter === "important") return notif.important;
        return true;
    });

    const unreadCount = notifications.filter(notif => !notif.read).length;

    return (
        <div className={`min-h-screen ${baseBg} ${baseText} transition-colors duration-200`}>
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/trainerHome"
                        className={`inline-flex items-center gap-2 ${mutedText} ${hoverBg} rounded-lg px-3 py-2 transition-colors mb-4`}
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${cardBg} border ${borderColor}`}>
                                <Bell size={24} className="text-indigo-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Notifications</h1>
                                <p className={mutedText}>
                                    {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${unreadCount === 0
                                        ? `${mutedText} cursor-not-allowed opacity-50`
                                        : `${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`
                                    }`}
                            >
                                Mark all as read
                            </button>

                            <button
                                onClick={clearAll}
                                disabled={notifications.length === 0}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${notifications.length === 0
                                        ? `${mutedText} cursor-not-allowed opacity-50`
                                        : `${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`
                                    }`}
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className={`mb-6 p-1 rounded-lg ${cardBg} border ${borderColor} inline-flex`}>
                    {[
                        { key: "all", label: "All", count: notifications.length },
                        { key: "unread", label: "Unread", count: unreadCount },
                        { key: "important", label: "Important", count: notifications.filter(n => n.important).length }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === tab.key
                                    ? `${darkMode ? 'bg-indigo-600' : 'bg-indigo-500'} text-white`
                                    : `${mutedText} ${hoverBg}`
                                }`}
                        >
                            {tab.label} {tab.count > 0 && `(${tab.count})`}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
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
                        filteredNotifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${cardBg} rounded-xl border ${borderColor} p-4 transition-all duration-200 ${!notification.read ? `${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border-blue-200` : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className={`font-semibold ${!notification.read ? 'text-blue-500' : baseText}`}>
                                                {notification.title}
                                            </h3>
                                            <span className={`text-xs ${mutedText}`}>
                                                {notification.time}
                                            </span>
                                        </div>

                                        <p className={`text-sm ${mutedText} mb-3`}>
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={`text-xs px-2 py-1 rounded transition-colors ${darkMode
                                                            ? 'bg-gray-700 hover:bg-gray-600'
                                                            : 'bg-gray-200 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    <Check size={12} className="inline mr-1" />
                                                    Mark read
                                                </button>
                                            )}

                                            {notification.important && (
                                                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    Important
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className={`p-2 rounded-lg transition-colors ${hoverBg} ${mutedText}`}
                                        aria-label="Delete notification"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Empty state for no notifications at all */}
                {notifications.length === 0 && (
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
                            When you get notifications, they'll appear here. You'll see updates about your clients, sessions, and important system information.
                        </p>
                        <Link
                            to="/trainerHome"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${darkMode
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
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