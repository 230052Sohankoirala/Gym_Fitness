// src/pages/admin/AdminNotificationsPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  ArrowLeft,
  Bell,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  Clock,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };


  const notifications = [
    {
      id: "n1",
      title: "New member sign-up",
      message: "Ritwiz Acharya just joined the gym on a 12-month plan.",
      type: "info",
      category: "members",
      time: "2 min ago",
      unread: true,
    },
    {
      id: "n2",
      title: "Payment succeeded",
      message: "Monthly billing for Suvam Parajuli processed successfully.",
      type: "success",
      category: "billing",
      time: "15 min ago",
      unread: true,
    },
    {
      id: "n3",
      title: "Payment failed",
      message:
        "Auto-renew for membership ID #1024 failed. Card declined, needs follow-up.",
      type: "warning",
      category: "billing",
      time: "43 min ago",
      unread: false,
    },
    {
      id: "n4",
      title: "Class almost full",
      message:
        "Evening HIIT with Sohan Koirala is 90% booked. Consider opening another slot.",
      type: "info",
      category: "classes",
      time: "Today, 4:02 PM",
      unread: false,
    },
    {
      id: "n5",
      title: "System maintenance",
      message:
        "Dashboard analytics will be recalculated at midnight. No downtime expected.",
      type: "system",
      category: "system",
      time: "Today, 10:15 AM",
      unread: false,
    },
    {
      id: "n6",
      title: "Trainer onboarding completed",
      message: "New trainer 'Anjal Sapkota' profile is now live.",
      type: "success",
      category: "trainers",
      time: "Yesterday",
      unread: false,
    },
  ];

  // --- filter state ---
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread")
      return notifications.filter((n) => n.unread);
    return notifications.filter((n) => n.category === activeFilter);
  }, [activeFilter, notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  // --- shared styles like AdminHomepage ---
  const cardBase =
    "rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200";
  const cardTheme = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const subText = darkMode ? "text-gray-300" : "text-gray-600";
  const borderSoft = darkMode ? "border-gray-700" : "border-gray-200";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.1, staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 160, damping: 16 },
    },
  };

  const filterPillClasses = (active) =>
    `px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-2 border ${borderSoft} transition-colors duration-200 ${
      active
        ? darkMode
          ? "bg-indigo-600 text-white border-indigo-500"
          : "bg-indigo-600 text-white border-indigo-600"
        : darkMode
        ? "bg-gray-900 text-gray-200 hover:bg-gray-800"
        : "bg-white text-gray-700 hover:bg-gray-100"
    }`;

  const typeBadgeClasses = (type) => {
    const base =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium";
    if (type === "success")
      return `${base} ${
        darkMode ? "bg-emerald-900 text-emerald-200" : "bg-emerald-50 text-emerald-700"
      }`;
    if (type === "warning")
      return `${base} ${
        darkMode ? "bg-amber-900 text-amber-200" : "bg-amber-50 text-amber-700"
      }`;
    if (type === "system")
      return `${base} ${
        darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
      }`;
    return `${base} ${
      darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-50 text-blue-700"
    }`;
  };

  const typeIcon = (type) => {
    if (type === "success") return <CheckCircle2 size={14} />;
    if (type === "warning") return <AlertTriangle size={14} />;
    if (type === "system") return <Info size={14} />;
    return <Bell size={14} />;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Header */}
      <div
        className={`w-full transition-colors duration-200 ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className={`p-2 rounded-full transition-colors duration-200 ${
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
            }`}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className={`text-xl sm:text-2xl font-semibold transition-colors duration-200 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Admin Notifications
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className={`hidden sm:inline text-xs ${subText}`}>
              {unreadCount} unread
            </span>
            <button
              onClick={() => navigate("/admin/settings")}
              className={`cursor-pointer px-3 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors duration-200 ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-white text-black hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <Filter size={16} />
              Notification Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 space-y-6"
      >
        {/* Top row: overview + filters */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Overview */}
          <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Bell size={18} />
                  Notification Overview
                </h3>
                <p className={`text-xs mt-1 ${subText}`}>
                  Track unread alerts, billing issues and member activity.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:text-sm">
              <OverviewStat
                label="Total"
                value={notifications.length}
                subtitle="All notifications"
                darkMode={darkMode}
              />
              <OverviewStat
                label="Unread"
                value={unreadCount}
                subtitle="Needs review"
                highlight
                darkMode={darkMode}
              />
              <OverviewStat
                label="Billing"
                value={notifications.filter((n) => n.category === "billing").length}
                subtitle="Payment related"
                darkMode={darkMode}
              />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            variants={itemVariants}
            className={`${cardBase} ${cardTheme} lg:col-span-2`}
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <h3 className="font-semibold text-sm sm:text-base">Filters</h3>
              <button
                onClick={() => setActiveFilter("all")}
                className={`text-xs sm:text-sm underline-offset-2 ${
                  darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Reset
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={filterPillClasses(activeFilter === "all")}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("unread")}
                className={filterPillClasses(activeFilter === "unread")}
              >
                Unread
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("members")}
                className={filterPillClasses(activeFilter === "members")}
              >
                Members
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("billing")}
                className={filterPillClasses(activeFilter === "billing")}
              >
                Billing
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("classes")}
                className={filterPillClasses(activeFilter === "classes")}
              >
                Classes
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("system")}
                className={filterPillClasses(activeFilter === "system")}
              >
                System
              </button>
            </div>
          </motion.div>
        </div>

        {/* Notifications list */}
        <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm sm:text-base">
              {activeFilter === "all"
                ? "All Notifications"
                : activeFilter === "unread"
                ? "Unread Notifications"
                : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Notifications`}
            </h3>
            <button
              type="button"
              className={`text-xs sm:text-sm inline-flex items-center gap-1 transition-colors duration-200 ${
                darkMode
                  ? "text-red-300 hover:text-red-200"
                  : "text-red-600 hover:text-red-700"
              }`}
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>

          <div
            className={`rounded-2xl border ${borderSoft} max-h-[480px] overflow-y-auto transition-colors duration-200 ${
              darkMode ? "bg-gray-900/40" : "bg-gray-50"
            }`}
          >
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell size={28} className={darkMode ? "text-gray-500" : "text-gray-400"} />
                <p className="mt-3 text-sm font-medium">No notifications to show</p>
                <p className={`mt-1 text-xs ${subText}`}>
                  Try changing filters or check back after some new activity.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200/40 dark:divide-gray-800/60">
                {filteredNotifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 sm:px-5 py-3 sm:py-4 flex gap-3 sm:gap-4 items-start transition-colors duration-150 ${
                      darkMode
                        ? n.unread
                          ? "bg-gray-900/70 hover:bg-gray-800"
                          : "hover:bg-gray-900"
                        : n.unread
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {/* left indicator */}
                    <div className="pt-1">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          n.unread
                            ? darkMode
                              ? "bg-indigo-600/70 text-white"
                              : "bg-indigo-600 text-white"
                            : darkMode
                            ? "bg-gray-800 text-gray-200"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        {typeIcon(n.type)}
                      </span>
                    </div>

                    {/* main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold truncate">{n.title}</p>
                        <span className={typeBadgeClasses(n.type)}>
                          {typeIcon(n.type)}
                          {n.type === "success"
                            ? "Success"
                            : n.type === "warning"
                            ? "Attention"
                            : n.type === "system"
                            ? "System"
                            : "Info"}
                        </span>
                        {n.unread && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                              darkMode
                                ? "bg-indigo-900 text-indigo-200"
                                : "bg-indigo-50 text-indigo-700"
                            }`}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                      <p className={`mt-1 text-xs sm:text-sm leading-snug ${subText}`}>
                        {n.message}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] sm:text-xs">
                        <span className={`inline-flex items-center gap-1 ${subText}`}>
                          <Clock size={12} />
                          {n.time}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const OverviewStat = ({ label, value, subtitle, highlight, darkMode }) => {
  const accent = highlight
    ? darkMode
      ? "text-indigo-300"
      : "text-indigo-600"
    : darkMode
    ? "text-white"
    : "text-gray-900";

  const sub = darkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-[11px] uppercase tracking-wide ${sub}`}>{label}</span>
      <span className={`text-lg font-semibold ${accent}`}>{value}</span>
      <span className={`text-[11px] ${sub}`}>{subtitle}</span>
    </div>
  );
};

export default AdminNotificationsPage;
