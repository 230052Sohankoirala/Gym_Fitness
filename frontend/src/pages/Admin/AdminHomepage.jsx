// src/pages/admin/AdminHomepage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  ArrowLeft,
  Settings,
  Users,
  Dumbbell,
  CalendarClock,
  Eye,          // ⬅️ fix: use Eye instead of invalid View icon
  UserPlus,
  CreditCard,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const AdminHomepage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };
  const { token, role } = useAuth();

  const [stats, setStats] = useState({ members: 0, trainers: 0, sessions: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // tiny safe getter
  const get = (obj, path, fallback) => {
    try {
      const v = path.split(".").reduce((a, p) => (a ? a[p] : undefined), obj);
      return v === undefined || v === null ? fallback : v;
    } catch {
      return fallback;
    }
  };

  // fetch stats + activity
  useEffect(() => {
    if (!token || role !== "admin") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErr("");
        const [statsRes, activityRes] = await Promise.all([
          axios.get("http://localhost:4000/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/api/admin/activity", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          members: Number(get(statsRes, "data.members", 0)),
          trainers: Number(get(statsRes, "data.trainers", 0)),
          sessions: Number(get(statsRes, "data.sessions", 0)),
        });

        // normalize activity items (supports different field names)
        const raw = Array.isArray(activityRes.data) ? activityRes.data : [];
        const normalized = raw.map((a) => ({
          message: get(a, "message", get(a, "text", "Activity")),
          time: get(a, "time", get(a, "createdAt", new Date().toISOString())),
        }));
        setActivity(normalized.slice(0, 20)); // keep up to 20; UI groups to 7 below
      } catch (e) {
        console.error("Admin homepage error:", e?.response?.data || e.message);
        setErr(e?.response?.data?.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role]);

  // group activity (Today vs This Week)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = new Date();
  const grouped = useMemo(() => {
    const today = [];
    const week = [];
    for (const a of activity) {
      const d = new Date(a.time);
      if (d.toDateString() === now.toDateString()) today.push(a);
      else if (now - d < 7 * 24 * 60 * 60 * 1000) week.push(a);
    }
    return { today: today.slice(0, 7), week: week.slice(0, 7) };
  }, [activity, now]);

  // sparkline mock (safe)
  const revenuePoints = useMemo(() => {
    const vals = [12, 13, 14, 15, 18, 20, 21];
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const w = 160;
    const h = 46;
    const step = vals.length > 1 ? w / (vals.length - 1) : w;
    const norm = (v) => (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);
    return vals.map((v, i) => `${i * step},${norm(v)}`).join(" ");
  }, []);

  const cardBase = "rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200";
  const cardTheme = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const subText = darkMode ? "text-gray-300" : "text-gray-600";
  const borderSoft = darkMode ? "border-gray-700" : "border-gray-200";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 160, damping: 16 } },
  };

  if (!token || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl border p-6 text-center">
          <p className="text-lg font-semibold mb-2">Admins only</p>
          <p className="text-sm text-gray-600">Please sign in as an admin to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading admin dashboard...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl border p-6 text-center">
          <p className="text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-sm text-red-600">{err}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Header */}
      <div className={`w-full transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
              }`}
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-xl sm:text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
            Admin Dashboard
          </h1>
          <div className="ml-auto">
            <button
              onClick={() => navigate("/admin/settings")}
              className={`px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors duration-200 ${darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-white text-black hover:bg-gray-50 border border-gray-200"
                }`}
            >
              <Settings size={16} />
              Go to Settings
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
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <KpiCard icon={<Users size={18} />} label="Active Members" value={stats.members} delta="+3.2%" darkMode={darkMode} />
          <KpiCard icon={<Dumbbell size={18} />} label="Trainers" value={stats.trainers} delta="+1" darkMode={darkMode} />
          <KpiCard icon={<CalendarClock size={18} />} label="Active Sessions" value={stats.sessions} delta="+8" darkMode={darkMode} />
        </div>

        {/* Quick Actions + Revenue + Activity */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              <ActionButton
                icon={<Eye size={18} />}                // ⬅️ fixed icon
                label="Show Sessions"
                onClick={() => navigate("/admin/sessions")}
                darkMode={darkMode}
              />
              <ActionButton
                icon={<UserPlus size={18} />}
                label="Add Trainer"
                onClick={() => navigate("/admin/trainers")}
                darkMode={darkMode}
              />
              <ActionButton
                icon={<CreditCard size={18} />}
                label="Billing"
                onClick={() => navigate("/admin/payments")}
                darkMode={darkMode}
              />
            </div>
          </motion.div>

          {/* Revenue (Mock) */}
          <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Revenue</h3>
              <span className={`text-xs ${subText}`}>Last 7 days</span>
            </div>
            <div className={`rounded-xl border ${borderSoft} p-3 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
              <div className="text-2xl font-semibold">$24.1k</div>
              <svg width="100%" height="60" viewBox="0 0 160 46" className="mt-2">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  points={revenuePoints}
                  className={darkMode ? "text-indigo-300" : "text-indigo-600"}
                />
              </svg>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Recent Activity</h3>
            </div>

            {/* Today */}
            {grouped.today.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs uppercase tracking-wide mb-1">Today</h4>
                <ul className="space-y-2">
                  {grouped.today.map((a, i) => (
                    <ActivityItem key={`today-${i}`} a={a} darkMode={darkMode} />
                  ))}
                </ul>
              </div>
            )}

            {/* This Week */}
            {grouped.week.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wide mb-1">This Week</h4>
                <ul className="space-y-2">
                  {grouped.week.map((a, i) => (
                    <ActivityItem key={`week-${i}`} a={a} darkMode={darkMode} />
                  ))}
                </ul>
              </div>
            )}

            {/* Empty state */}
            {grouped.today.length === 0 && grouped.week.length === 0 && (
              <div className={`rounded-lg px-3 py-2 ${darkMode ? "bg-gray-700/60" : "bg-gray-50"}`}>
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

/* ---------- small reusable blocks ---------- */
const KpiCard = ({ icon, label, value, delta, darkMode }) => (
  <motion.div
    className={`rounded-2xl p-4 shadow-sm transition-colors duration-200 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
  >
    <div className="flex items-center justify-between">
      <div className="text-sm opacity-80">{label}</div>
      <div className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>{icon}</div>
    </div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    <div className={`mt-1 text-xs ${darkMode ? "text-gray-300" : "text-gray-600"}`}>vs last period {delta}</div>
  </motion.div>
);

const ActionButton = ({ icon, label, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`w-full rounded-xl px-3 py-3 text-sm font-medium inline-flex items-center gap-2 transition-colors duration-200 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
      }`}
  >
    <span className={`p-2 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>{icon}</span>
    {label}
  </button>
);

const ActivityItem = ({ a, darkMode }) => (
  <li className={`rounded-lg px-3 py-2 ${darkMode ? "bg-gray-700/60" : "bg-gray-50"}`}>
    <div className="text-sm">{a.message}</div>
    <div className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
      {new Date(a.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </div>
  </li>
);

export default AdminHomepage;
