import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import {
  ArrowLeft,
  Bell,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  Clock,
  Check,
  X,
  RefreshCcw,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { apiFetch } from "../../utils/api";

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [toast, setToast] = useState({ show: false, ok: true, text: "" });

  const showToast = (ok, text) => {
    setToast({ show: true, ok, text });
    setTimeout(() => setToast({ show: false, ok: true, text: "" }), 1700);
  };

  const loadNotifications = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const data = await apiFetch("/api/notifications?role=admin");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrMsg(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === activeFilter);
  }, [activeFilter, notifications]);

  const cardBase = "rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200";
  const cardTheme = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const subText = darkMode ? "text-gray-300" : "text-gray-600";
  const borderSoft = darkMode ? "border-gray-700" : "border-gray-200";

  const filterPillClasses = (active) =>
    `px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${borderSoft} transition-colors duration-200 ${
      active
        ? "bg-indigo-600 text-white border-indigo-600"
        : darkMode
        ? "bg-gray-900 text-gray-200 hover:bg-gray-800"
        : "bg-white text-gray-700 hover:bg-gray-100"
    }`;

  const typeBadgeClasses = (type) => {
    const base =
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium";
    if (type === "payment")
      return `${base} ${
        darkMode ? "bg-emerald-900 text-emerald-200" : "bg-emerald-50 text-emerald-700"
      }`;
    if (type === "booking")
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
    if (type === "payment") return <CheckCircle2 size={14} />;
    if (type === "booking") return <AlertTriangle size={14} />;
    if (type === "system") return <Info size={14} />;
    return <Bell size={14} />;
  };

  const timeLabel = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return String(iso || "");
    }
  };

  // ✅ actions
  const markRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      showToast(true, "Marked as read");
    } catch (e) {
      showToast(false, e?.message || "Failed");
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch(`/api/notifications/read-all`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast(true, "All marked read");
    } catch (e) {
      showToast(false, e?.message || "Failed");
    }
  };

  const deleteOne = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast(true, "Deleted");
    } catch (e) {
      showToast(false, e?.message || "Failed");
    }
  };

  const clearAll = async () => {
    try {
      await apiFetch(`/api/notifications`, { method: "DELETE" });
      setNotifications([]);
      showToast(true, "Cleared all");
    } catch (e) {
      showToast(false, e?.message || "Failed");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        Loading notifications...
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
        <div className={`rounded-xl p-4 ${darkMode ? "bg-red-900/40 text-red-200" : "bg-red-50 text-red-700"}`}>
          {errMsg}
        </div>
        <button
          onClick={loadNotifications}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Header */}
      <div className="w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className={`text-xl sm:text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
            Admin Notifications
          </h1>

          <div className="ml-auto flex items-center gap-2">
            <span className={`hidden sm:inline text-xs ${subText}`}>{unreadCount} unread</span>

            <button
              onClick={loadNotifications}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 ${
                darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <button
              onClick={markAllRead}
              className="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Check size={16} />
              Mark all read
            </button>

            <button
              onClick={() => navigate("/admin/settings")}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 ${
                darkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Filter size={16} />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 ${
              toast.ok
                ? darkMode
                  ? "bg-emerald-900 text-emerald-100"
                  : "bg-emerald-50 text-emerald-700"
                : darkMode
                ? "bg-red-900 text-red-100"
                : "bg-red-50 text-red-700"
            }`}
          >
            {toast.ok ? <Check size={16} /> : <X size={16} />}
            <span className="text-sm font-medium">{toast.text}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 space-y-6"
      >
        {/* Filters */}
        <div className={`${cardBase} ${cardTheme}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm sm:text-base">Filters</h3>
            <button
              onClick={() => setActiveFilter("all")}
              className={`text-xs underline ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveFilter("all")} className={filterPillClasses(activeFilter === "all")}>
              All
            </button>
            <button onClick={() => setActiveFilter("unread")} className={filterPillClasses(activeFilter === "unread")}>
              Unread
            </button>
            <button onClick={() => setActiveFilter("payment")} className={filterPillClasses(activeFilter === "payment")}>
              Payments
            </button>
            <button onClick={() => setActiveFilter("booking")} className={filterPillClasses(activeFilter === "booking")}>
              Bookings
            </button>
            <button onClick={() => setActiveFilter("system")} className={filterPillClasses(activeFilter === "system")}>
              System
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className={`${cardBase} ${cardTheme}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm sm:text-base">
              {activeFilter === "all"
                ? "All Notifications"
                : activeFilter === "unread"
                ? "Unread Notifications"
                : `${activeFilter.toUpperCase()} Notifications`}
            </h3>

            <button
              type="button"
              onClick={clearAll}
              className={`text-xs sm:text-sm inline-flex items-center gap-1 ${
                darkMode ? "text-red-300 hover:text-red-200" : "text-red-600 hover:text-red-700"
              }`}
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>

          <div
            className={`rounded-2xl border ${borderSoft} max-h-[520px] overflow-y-auto ${
              darkMode ? "bg-gray-900/40" : "bg-gray-50"
            }`}
          >
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell size={28} className={darkMode ? "text-gray-500" : "text-gray-400"} />
                <p className="mt-3 text-sm font-medium">No notifications to show</p>
                <p className={`mt-1 text-xs ${subText}`}>Try another filter.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200/40 dark:divide-gray-800/60">
                {filteredNotifications.map((n) => (
                  <li
                    key={n._id}
                    className={`px-4 sm:px-5 py-3 sm:py-4 flex gap-3 sm:gap-4 items-start ${
                      darkMode
                        ? !n.isRead
                          ? "bg-gray-900/70 hover:bg-gray-800"
                          : "hover:bg-gray-900"
                        : !n.isRead
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="pt-1">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          !n.isRead
                            ? "bg-indigo-600 text-white"
                            : darkMode
                            ? "bg-gray-800 text-gray-200"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        {typeIcon(n.type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold truncate">{n.title}</p>
                        <span className={typeBadgeClasses(n.type)}>{typeIcon(n.type)} {n.type}</span>

                        {!n.isRead && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            darkMode ? "bg-indigo-900 text-indigo-200" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            NEW
                          </span>
                        )}
                      </div>

                      <p className={`mt-1 text-xs sm:text-sm leading-snug ${subText}`}>{n.message}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] sm:text-xs">
                        <span className={`inline-flex items-center gap-1 ${subText}`}>
                          <Clock size={12} />
                          {timeLabel(n.createdAt)}
                        </span>

                        {!n.isRead && (
                          <button
                            onClick={() => markRead(n._id)}
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              darkMode ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"
                            }`}
                          >
                            <Check size={14} />
                            Mark read
                          </button>
                        )}

                        <button
                          onClick={() => deleteOne(n._id)}
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            darkMode ? "text-red-300 hover:text-red-200" : "text-red-600 hover:text-red-700"
                          }`}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminNotificationsPage;
