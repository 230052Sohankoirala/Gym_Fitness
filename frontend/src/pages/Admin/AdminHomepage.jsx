// src/pages/admin/AdminHomepage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  ArrowLeft,
  Settings,
  Users,
  Dumbbell,
  CalendarClock,
  Eye,
  UserPlus,
  CreditCard,
  MessageCircle,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "http://localhost:4000";

const AdminHomepage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };
  const { token, role } = useAuth();

  const [stats, setStats] = useState({ members: 0, trainers: 0, sessions: 0 });
  const [revenue, setRevenue] = useState({
    totalLast7Days: 0,
    previous7Days: 0,
    changePercent: 0,
    points: [],
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [openTrainerModal, setOpenTrainerModal] = useState(false);
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [trainersErr, setTrainersErr] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [trainerSearch, setTrainerSearch] = useState("");
  const [openChatBusyId, setOpenChatBusyId] = useState("");

  const get = (obj, path, fallback) => {
    try {
      const v = path.split(".").reduce((a, p) => (a ? a[p] : undefined), obj);
      return v === undefined || v === null ? fallback : v;
    } catch {
      return fallback;
    }
  };

  const formatMoney = (cents = 0) => {
    return `$${(Number(cents || 0) / 100).toFixed(2)}`;
  };

  useEffect(() => {
    if (!token || role !== "admin") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErr("");

        const [statsRes, activityRes, revenueRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/admin/activity`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/admin/revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          members: Number(get(statsRes, "data.members", 0)),
          trainers: Number(get(statsRes, "data.trainers", 0)),
          sessions: Number(get(statsRes, "data.sessions", 0)),
        });

        const raw = Array.isArray(activityRes.data) ? activityRes.data : [];
        const normalized = raw.map((a) => ({
          message: get(a, "message", get(a, "text", "Activity")),
          time: get(a, "time", get(a, "createdAt", new Date().toISOString())),
        }));
        setActivity(normalized.slice(0, 20));

        setRevenue(
          revenueRes?.data?.revenue || {
            totalLast7Days: 0,
            previous7Days: 0,
            changePercent: 0,
            points: [],
          }
        );
      } catch (e) {
        console.error("Admin homepage error:", e?.response?.data || e.message);
        setErr(e?.response?.data?.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role]);

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

  const revenuePoints = useMemo(() => {
    const vals =
      revenue.points?.length > 0
        ? revenue.points.map((p) => Number(p.revenue || 0))
        : [0, 0, 0, 0, 0, 0, 0];

    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const w = 180;
    const h = 56;
    const step = vals.length > 1 ? w / (vals.length - 1) : w;

    const norm = (v) => {
      if (max === min) return h / 2;
      return h - ((v - min) / (max - min)) * h;
    };

    return vals.map((v, i) => `${i * step},${norm(v)}`).join(" ");
  }, [revenue]);

  const revenueDayLabels = useMemo(() => {
    if (revenue.points?.length > 0) {
      return revenue.points.map((p) => {
        const d = new Date(p.date);
        return d.toLocaleDateString(undefined, { weekday: "short" });
      });
    }
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }, [revenue]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.08, staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { y: 14, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 170, damping: 18 },
    },
  };

  const pageBg = darkMode
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
    : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 text-slate-900";

  const glassCard = darkMode
    ? "bg-white/[0.04] border-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
    : "bg-white/75 border-slate-200/70 backdrop-blur-xl shadow-[0_10px_35px_rgba(15,23,42,0.08)]";

  const softCard = darkMode
    ? "bg-slate-900/70 border-white/10"
    : "bg-white/70 border-slate-200/70";

  const subtleBorder = darkMode ? "border-white/10" : "border-slate-200/70";
  const mutedText = darkMode ? "text-slate-300" : "text-slate-600";
  const mutedTextSoft = darkMode ? "text-slate-400" : "text-slate-500";
  const hoverSoft = darkMode
    ? "hover:bg-white/[0.04]"
    : "hover:bg-slate-100/80";

  const openTrainerChatModal = async () => {
    try {
      setOpenTrainerModal(true);
      setTrainerSearch("");
      setTrainersErr("");
      setTrainersLoading(true);

      const res = await axios.get(`${BASE_URL}/api/admin/trainers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = Array.isArray(res.data) ? res.data : res.data?.trainers || [];
      setTrainers(raw);
    } catch (e) {
      console.error("Open trainer chat modal error:", e?.response?.data || e.message);
      setTrainersErr(e?.response?.data?.message || "Failed to load trainers.");
    } finally {
      setTrainersLoading(false);
    }
  };

  const openDirectChatWithTrainer = async (trainer) => {
    try {
      const trainerId = trainer?._id || trainer?.id;
      if (!trainerId) return;

      setOpenChatBusyId(trainerId);

      navigate(`/admin/chat/${trainerId}`, {
        state: {
          trainerId,
          trainerName: trainer?.name || trainer?.fullName || "Trainer",
        },
      });

      setOpenTrainerModal(false);
    } catch (e) {
      console.error("Open direct trainer chat error:", e?.response?.data || e.message);
      setTrainersErr("Failed to open trainer chat.");
    } finally {
      setOpenChatBusyId("");
    }
  };

  const filteredTrainers = useMemo(() => {
    const q = trainerSearch.trim().toLowerCase();
    if (!q) return trainers;

    return trainers.filter((t) => {
      const name = String(t?.name || t?.fullName || t?.fullname || "").toLowerCase();
      const email = String(t?.email || "").toLowerCase();
      const speciality = String(t?.speciality || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        speciality.includes(q)
      );
    });
  }, [trainers, trainerSearch]);

  if (!token || role !== "admin") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <div className={`rounded-3xl border px-6 py-5 text-center ${glassCard}`}>
          <h2 className="text-xl font-semibold">Admin access only</h2>
          <p className={`mt-2 text-sm ${mutedText}`}>
            Please log in as an admin to continue.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`relative overflow-hidden rounded-[2rem] border ${glassCard} p-5 sm:p-7 transition-colors duration-200`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-blue-500/10 pointer-events-none" />
          <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate("/")}
                className={`mt-1 p-2.5 rounded-2xl border transition-colors duration-200 ${subtleBorder} ${hoverSoft}`}
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${darkMode
                    ? "bg-indigo-500/10 text-indigo-300 border-indigo-400/20"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin Control Center
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  Admin Dashboard
                </h1>

                <p className={`mt-2 text-sm sm:text-base max-w-2xl ${mutedText}`}>
                  Manage members, trainers, sessions, billing, and communication
                  from one clean and organized admin space.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/settings")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 transition-colors duration-200"
            >
              <Settings size={16} />
              Go to Settings
            </button>
          </div>
        </motion.div>

        {err ? (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${darkMode
              ? "bg-rose-500/10 text-rose-300 border-rose-400/20"
              : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
          >
            {err}
          </div>
        ) : null}

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-6 space-y-6"
        >
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <KpiCard
              icon={<Users size={20} />}
              label="Active Members"
              value={stats.members}
              delta="Live count"
              darkMode={darkMode}
              glassCard={glassCard}
              mutedText={mutedText}
              itemVariants={itemVariants}
            />

            <KpiCard
              icon={<Dumbbell size={20} />}
              label="Trainers"
              value={stats.trainers}
              delta="Available trainers"
              darkMode={darkMode}
              glassCard={glassCard}
              mutedText={mutedText}
              itemVariants={itemVariants}
            />

            <KpiCard
              icon={<CalendarClock size={20} />}
              label="Sessions"
              value={stats.sessions}
              delta="Current session total"
              darkMode={darkMode}
              glassCard={glassCard}
              mutedText={mutedText}
              itemVariants={itemVariants}
            />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Quick actions */}
            <motion.div
              variants={itemVariants}
              className={`xl:col-span-8 rounded-[2rem] border p-5 sm:p-6 ${glassCard}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>
                    Jump to your most used admin tools
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-2xl ${darkMode
                    ? "bg-violet-500/10 text-violet-300"
                    : "bg-violet-50 text-violet-700"
                    }`}
                >
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionButton
                  icon={<Eye size={18} />}
                  label="Show Sessions"
                  desc="View session overview"
                  onClick={() => navigate("/admin/sessions")}
                  darkMode={darkMode}
                />
                <ActionButton
                  icon={<UserPlus size={18} />}
                  label="Add Trainer"
                  desc="Manage trainers"
                  onClick={() => navigate("/admin/trainers")}
                  darkMode={darkMode}
                />
                <ActionButton
                  icon={<CreditCard size={18} />}
                  label="Billing"
                  desc="Check payments"
                  onClick={() => navigate("/admin/payments")}
                  darkMode={darkMode}
                />
                <ActionButton
                  icon={<MessageCircle size={18} />}
                  label="Message Trainers"
                  desc="Open direct chat"
                  onClick={openTrainerChatModal}
                  darkMode={darkMode}
                />
              </div>
            </motion.div>

            {/* Revenue */}
            <motion.div
              variants={itemVariants}
              className={`xl:col-span-4 rounded-[2rem] border p-5 sm:p-6 ${glassCard}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Revenue Overview</h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>Last 7 days</p>
                </div>
                <div
                  className={`p-2.5 rounded-2xl ${darkMode
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-emerald-50 text-emerald-700"
                    }`}
                >
                  <TrendingUp size={18} />
                </div>
              </div>

              <div
                className={`rounded-[1.5rem] border p-4 ${softCard} transition-colors duration-200`}
              >
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-bold tracking-tight">
                      {formatMoney(revenue.totalLast7Days)}
                    </div>
                    <p className={`text-sm mt-1 ${mutedText}`}>
                      Net revenue in the last 7 days
                    </p>
                  </div>

                  <div
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${revenue.changePercent >= 0
                      ? darkMode
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-emerald-50 text-emerald-700"
                      : darkMode
                        ? "bg-rose-500/15 text-rose-300"
                        : "bg-rose-50 text-rose-700"
                      }`}
                  >
                    {revenue.changePercent >= 0 ? "+" : ""}
                    {revenue.changePercent}%
                  </div>
                </div>

                <div className="mt-4">
                  <svg width="100%" height="72" viewBox="0 0 180 56">
                    <defs>
                      <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>

                    <polyline
                      fill="none"
                      stroke="url(#revLine)"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={revenuePoints}
                    />
                  </svg>
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1 text-[11px]">
                  {revenueDayLabels.map((day) => (
                    <div key={day} className={`${mutedTextSoft} text-center`}>
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label="Previous 7 Days"
                  value={formatMoney(revenue.previous7Days)}
                  darkMode={darkMode}
                />
                <MiniStat
                  label="Trend"
                  value={`${revenue.changePercent >= 0 ? "+" : ""}${revenue.changePercent}%`}
                  darkMode={darkMode}
                />
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className={`xl:col-span-7 rounded-[2rem] border p-5 sm:p-6 ${glassCard}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>
                    Latest system movement and updates
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-2xl ${darkMode
                    ? "bg-blue-500/10 text-blue-300"
                    : "bg-blue-50 text-blue-700"
                    }`}
                >
                  <Activity size={18} />
                </div>
              </div>

              <div className="space-y-4">
                <ActivityGroup
                  title="Today"
                  items={grouped.today}
                  darkMode={darkMode}
                  mutedText={mutedText}
                  mutedTextSoft={mutedTextSoft}
                />
                <ActivityGroup
                  title="This Week"
                  items={grouped.week}
                  darkMode={darkMode}
                  mutedText={mutedText}
                  mutedTextSoft={mutedTextSoft}
                />
              </div>
            </motion.div>

            {/* Overview panel */}
            <motion.div
              variants={itemVariants}
              className={`xl:col-span-5 rounded-[2rem] border p-5 sm:p-6 ${glassCard}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold">Overview</h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>
                    A quick summary of platform status
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-2xl ${darkMode
                    ? "bg-fuchsia-500/10 text-fuchsia-300"
                    : "bg-fuchsia-50 text-fuchsia-700"
                    }`}
                >
                  <ChevronRight size={18} />
                </div>
              </div>

              <div className="space-y-3">
                <OverviewRow
                  label="Members"
                  value={stats.members}
                  darkMode={darkMode}
                />
                <OverviewRow
                  label="Trainers"
                  value={stats.trainers}
                  darkMode={darkMode}
                />
                <OverviewRow
                  label="Sessions"
                  value={stats.sessions}
                  darkMode={darkMode}
                />
                <OverviewRow
                  label="Revenue (7d)"
                  value={formatMoney(revenue.totalLast7Days)}
                  darkMode={darkMode}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trainer Chat Modal */}
        <AnimatePresence>
          {openTrainerModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 12, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className={`w-full max-w-2xl rounded-[2rem] border p-5 sm:p-6 ${glassCard}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Message Trainers</h3>
                    <p className={`text-sm mt-1 ${mutedText}`}>
                      Select a trainer to start direct conversation
                    </p>
                  </div>

                  <button
                    onClick={() => setOpenTrainerModal(false)}
                    className={`p-2 rounded-xl border ${subtleBorder} ${hoverSoft}`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 relative">
                  <Search
                    size={16}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedTextSoft}`}
                  />
                  <input
                    type="text"
                    value={trainerSearch}
                    onChange={(e) => setTrainerSearch(e.target.value)}
                    placeholder="Search trainer by name, email, or speciality"
                    className={`w-full rounded-2xl border pl-10 pr-4 py-3 outline-none transition-colors duration-200 ${darkMode
                      ? "bg-slate-900/80 border-white/10 placeholder:text-slate-500"
                      : "bg-white/80 border-slate-200 placeholder:text-slate-400"
                      }`}
                  />
                </div>

                {trainersErr ? (
                  <div
                    className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${darkMode
                      ? "bg-rose-500/10 text-rose-300 border-rose-400/20"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                  >
                    {trainersErr}
                  </div>
                ) : null}

                <div className="mt-4 max-h-[420px] overflow-y-auto space-y-3 pr-1">
                  {trainersLoading ? (
                    <div className={`text-sm ${mutedText}`}>Loading trainers...</div>
                  ) : filteredTrainers.length === 0 ? (
                    <div className={`text-sm ${mutedText}`}>No trainers found.</div>
                  ) : (
                    filteredTrainers.map((trainer) => {
                      const trainerId = trainer?._id || trainer?.id;
                      const trainerName =
                        trainer?.name ||
                        trainer?.fullName ||
                        trainer?.fullname ||
                        "Trainer";

                      return (
                        <button
                          key={trainerId}
                          onClick={() => openDirectChatWithTrainer(trainer)}
                          disabled={openChatBusyId === trainerId}
                          className={`w-full text-left rounded-[1.5rem] border p-4 transition-colors duration-200 ${darkMode
                            ? "bg-slate-900/70 border-white/10 hover:bg-white/[0.04]"
                            : "bg-white/70 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold">{trainerName}</div>
                              <div className={`text-sm mt-1 ${mutedText}`}>
                                {trainer?.email || "No email"}
                              </div>
                              <div className={`text-xs mt-1 ${mutedTextSoft}`}>
                                {trainer?.speciality || "No speciality"}
                              </div>
                            </div>

                            <div
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${darkMode
                                ? "bg-indigo-500/10 text-indigo-300"
                                : "bg-indigo-50 text-indigo-700"
                                }`}
                            >
                              {openChatBusyId === trainerId ? "Opening..." : "Chat"}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="fixed inset-x-0 bottom-4 flex justify-center pointer-events-none">
            <div
              className={`rounded-full border px-4 py-2 text-sm ${glassCard}`}
            >
              Loading admin dashboard...
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ---------- Small Components ---------- */

const KpiCard = ({
  icon,
  label,
  value,
  delta,
  darkMode,
  glassCard,
  mutedText,
  itemVariants,
}) => {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-[2rem] border p-5 sm:p-6 ${glassCard}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`p-2.5 rounded-2xl ${darkMode
            ? "bg-white/[0.06] text-white"
            : "bg-slate-100 text-slate-700"
            }`}
        >
          {icon}
        </div>

        <div
          className={`text-xs font-semibold px-3 py-1 rounded-full ${darkMode
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-emerald-50 text-emerald-700"
            }`}
        >
          {delta}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-sm font-medium opacity-85">{label}</div>
        <div className="text-3xl font-bold tracking-tight mt-2">{value}</div>
        <p className={`text-sm mt-1 ${mutedText}`}>Updated from live admin data</p>
      </div>
    </motion.div>
  );
};

const ActionButton = ({ icon, label, desc, onClick, darkMode }) => {
  return (
    <button
      onClick={onClick}
      className={`group rounded-[1.5rem] border p-4 text-left transition-colors duration-200 ${darkMode
        ? "bg-slate-900/70 border-white/10 hover:bg-white/[0.05]"
        : "bg-white/70 border-slate-200 hover:bg-slate-50"
        }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`p-2.5 rounded-2xl ${darkMode
            ? "bg-indigo-500/10 text-indigo-300"
            : "bg-indigo-50 text-indigo-700"
            }`}
        >
          {icon}
        </div>

        <ChevronRight
          size={18}
          className={`mt-1 transition-transform duration-200 group-hover:translate-x-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"
            }`}
        />
      </div>

      <div className="mt-4">
        <div className="font-semibold">{label}</div>
        <div
          className={`text-sm mt-1 ${darkMode ? "text-slate-300" : "text-slate-600"
            }`}
        >
          {desc}
        </div>
      </div>
    </button>
  );
};

const ActivityGroup = ({ title, items, darkMode, mutedText, mutedTextSoft }) => {
  return (
    <div>
      <div className="text-sm font-semibold mb-3">{title}</div>

      {items.length === 0 ? (
        <div className={`text-sm ${mutedText}`}>No activity found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={`${title}-${idx}`}
              className={`rounded-[1.25rem] border p-4 ${darkMode
                ? "bg-slate-900/70 border-white/10"
                : "bg-white/70 border-slate-200"
                }`}
            >
              <div className="font-medium">{item.message}</div>
              <div className={`text-xs mt-1 ${mutedTextSoft}`}>
                {formatActivityTime(item.time)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ label, value, darkMode }) => {
  return (
    <div
      className={`rounded-[1.25rem] border p-3 ${darkMode
        ? "bg-slate-900/70 border-white/10"
        : "bg-white/70 border-slate-200"
        }`}
    >
      <div className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
};

const OverviewRow = ({ label, value, darkMode }) => {
  return (
    <div
      className={`flex items-center justify-between rounded-[1.25rem] border p-4 ${darkMode
        ? "bg-slate-900/70 border-white/10"
        : "bg-white/70 border-slate-200"
        }`}
    >
      <span className={darkMode ? "text-slate-300" : "text-slate-600"}>
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

const formatActivityTime = (time) => {
  try {
    const d = new Date(time);
    if (Number.isNaN(d.getTime())) return "Unknown time";
    return d.toLocaleString();
  } catch {
    return "Unknown time";
  }
};

export default AdminHomepage;