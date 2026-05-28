// src/pages/trainer/TrainerHome.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Users,
  CalendarClock,
  MessageSquare,
  Dumbbell,
  MessageCircle,
  CalendarDays,
  ChevronRight,
  Clock,
  Shield,
  Sparkles,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import TrainerTaskBoard from "../../components/trainerComponents/TrainerTaskboard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* -------------------------------------------------------------------------- */
/* Animations                                                                 */
/* -------------------------------------------------------------------------- */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { y: 12, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 22, stiffness: 220 },
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const WEEK_STARTS_ON_MONDAY = true;

const startOfWeek = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = WEEK_STARTS_ON_MONDAY ? (day === 0 ? -6 : 1 - day) : -day;

  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);

  return date;
};

const endOfWeek = (d = new Date()) => {
  const s = startOfWeek(d);
  const e = new Date(s);

  e.setDate(s.getDate() + 7);
  e.setHours(0, 0, 0, 0);

  return e;
};

const parseYmd = (s) => {
  if (!s || typeof s !== "string") return null;

  const [y, m, d] = s.split("-").map(Number);

  if (!y || !m || !d) return null;

  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);

  return isNaN(dt.getTime()) ? null : dt;
};

const sameLocalDate = (a, b = new Date()) => {
  const A = a instanceof Date ? a : parseYmd(a);

  const B =
    b instanceof Date
      ? b
      : parseYmd(
        `${b.getFullYear()}-${String(b.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(b.getDate()).padStart(2, "0")}`
      );

  if (!A || !B) return false;

  return (
    A.getFullYear() === B.getFullYear() &&
    A.getMonth() === B.getMonth() &&
    A.getDate() === B.getDate()
  );
};

const inThisWeek = (v) => {
  const dt = v instanceof Date ? v : parseYmd(v);

  if (!dt) return false;

  return dt >= startOfWeek() && dt < endOfWeek();
};

const deriveKpi = (sessions = [], messages = []) => {
  const activeClientIds = new Set();

  sessions.forEach((s) =>
    (s?.clientsEnrolled || []).forEach((u) =>
      activeClientIds.add((u?._id || u?.id || u)?.toString?.())
    )
  );

  const sessionsToday = sessions.filter((s) => sameLocalDate(s?.date)).length;

  const weeklySessions = sessions.filter(
    (s) =>
      inThisWeek(s?.date) &&
      (s?.status === "Confirmed" || (s?.clientsEnrolled?.length || 0) > 0)
  );

  const weeklyClientIds = new Set();

  weeklySessions.forEach((s) =>
    (s?.clientsEnrolled || []).forEach((u) =>
      weeklyClientIds.add((u?._id || u?.id || u)?.toString?.())
    )
  );

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const newMessages = messages.filter((m) => {
    return new Date(m?.createdAt || 0) >= dayAgo;
  }).length;

  const sow = startOfWeek();
  const eow = endOfWeek();

  const checkinsThisWeek = messages.filter((m) => {
    const ts = new Date(m?.createdAt || 0);
    const inWeek = ts >= sow && ts < eow;

    const looksLikeCheckin = /check[- ]?in|update|progress|how.*going|status/i.test(
      m?.text || m?.message || ""
    );

    return inWeek && looksLikeCheckin;
  }).length;

  const programUpdatesThisWeek = Math.min(
    weeklySessions.length,
    Math.round(weeklySessions.length * 0.5)
  );

  return {
    activeClients: activeClientIds.size,
    sessionsToday,
    newMessages,
    weeklySessionsCount: weeklySessions.length,
    uniqueClientsThisWeek: weeklyClientIds.size,
    programUpdatesThisWeek,
    checkinsThisWeek,
  };
};

export default function TrainerHome() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(() => {
    try {
      const raw = localStorage.getItem("trainer_dashboard_cache");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!dashboard);

  const token = useMemo(() => {
    return (
      localStorage.getItem("trainerToken") ||
      sessionStorage.getItem("trainerToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
    );
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const res = await axios.get(`${API_BASE}/api/trainers/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || {};

        setDashboard(data);
        localStorage.setItem("trainer_dashboard_cache", JSON.stringify(data));
      } catch (err) {
        console.error(
          "Failed to fetch trainer dashboard:",
          err?.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const baseBg = darkMode
    ? "bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#0f172a]"
    : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60";

  const baseText = darkMode ? "text-white" : "text-slate-900";
  const mutedText = darkMode ? "text-slate-300" : "text-slate-600";

  const cardBg = darkMode
    ? "bg-white/[0.04] backdrop-blur-xl"
    : "bg-white/90 backdrop-blur-xl";

  const cardBorder = darkMode ? "border-white/10" : "border-slate-200/80";

  const softShadow = darkMode
    ? "shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
    : "shadow-[0_10px_30px_rgba(15,23,42,0.08)]";

  const hoverCard = darkMode
    ? "hover:bg-white/[0.06] hover:border-indigo-400/30"
    : "hover:bg-white hover:border-indigo-200";

  const rowHover = darkMode ? "hover:bg-white/[0.05]" : "hover:bg-slate-50";

  const Button = ({
    children,
    variant = "solid",
    className = "",
    ...props
  }) => {
    const base =
      "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200";

    const styles =
      variant === "outline"
        ? darkMode
          ? "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"
          : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        : "bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 text-white hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500";

    return (
      <button className={`${base} ${styles} ${className}`} {...props}>
        {children}
      </button>
    );
  };

  const Badge = ({ children, tone = "default" }) => {
    const cls =
      tone === "default"
        ? darkMode
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
        : darkMode
          ? "bg-slate-700/60 text-slate-200 border border-white/10"
          : "bg-slate-100 text-slate-700 border border-slate-200";

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}
      >
        {children}
      </span>
    );
  };

  const Progress = ({ value }) => (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full transition-colors duration-200 ${darkMode ? "bg-white/10" : "bg-slate-200"
        }`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 transition-all duration-200"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );

  const targets = dashboard?.targets || {
    sessions: 20,
    programUpdates: 15,
    checkins: 20,
    clients: 12,
  };

  const derived = useMemo(() => {
    return deriveKpi(dashboard?.sessions || [], dashboard?.messages || []);
  }, [dashboard]);

  const kpi = {
    activeClients: dashboard?.kpi?.activeClients ?? derived.activeClients,
    sessionsToday: dashboard?.kpi?.sessionsToday ?? derived.sessionsToday,
    newMessages: dashboard?.kpi?.newMessages ?? derived.newMessages,

    weeklySessionsCount:
      (dashboard?.kpi?.weeklySessionsCount || 0) > 0
        ? dashboard.kpi.weeklySessionsCount
        : derived.weeklySessionsCount,

    uniqueClientsThisWeek:
      (dashboard?.kpi?.uniqueClientsThisWeek || 0) > 0
        ? dashboard.kpi.uniqueClientsThisWeek
        : derived.uniqueClientsThisWeek,

    programUpdatesThisWeek:
      (dashboard?.kpi?.programUpdatesThisWeek || 0) > 0
        ? dashboard.kpi.programUpdatesThisWeek
        : derived.programUpdatesThisWeek,

    checkinsThisWeek:
      (dashboard?.kpi?.checkinsThisWeek || 0) > 0
        ? dashboard.kpi.checkinsThisWeek
        : derived.checkinsThisWeek,
  };

  const actual = {
    sessions: Number(kpi.weeklySessionsCount || 0),
    programUpdates: Number(kpi.programUpdatesThisWeek || 0),
    checkins: Number(kpi.checkinsThisWeek || 0),
    clients: Number(kpi.uniqueClientsThisWeek || 0),
  };

  const pct = (num, den) => {
    return den > 0 ? Math.min(100, Math.round((num / den) * 100)) : 0;
  };

  const goAdminChat = () => navigate("/trainer/admin-messages");

  if (loading) {
    return (
      <div
        className={`min-h-screen ${baseBg} ${baseText} flex items-center justify-center transition-colors duration-200`}
      >
        <div
          className={`rounded-2xl border ${cardBorder} ${cardBg} ${softShadow} px-6 py-5`}
        >
          <p className={mutedText}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      label: "Active Clients",
      value: kpi.activeClients || 0,
      icon: Users,
      sub: "Currently engaged",
    },
    {
      label: "Sessions Today",
      value: kpi.sessionsToday || 0,
      icon: CalendarClock,
      sub: "Planned for today",
    },
    {
      label: "New Messages",
      value: kpi.newMessages || 0,
      icon: MessageSquare,
      sub: "Last 24 hours",
    },
  ];

  return (
    <div className={`min-h-screen ${baseBg} ${baseText} transition-colors duration-200`}>
      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`relative overflow-hidden rounded-3xl border ${cardBorder} ${cardBg} ${softShadow} mb-6 p-6 md:p-8 transition-colors duration-200`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-blue-500/10 pointer-events-none" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500">
                <Sparkles className="h-3.5 w-3.5" />
                Trainer Performance Hub
              </div>

              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                Welcome back, {dashboard?.trainer?.name || "Coach"} 👋
              </h1>

              <p className={`mt-2 max-w-2xl text-sm md:text-base ${mutedText}`}>
                Your dashboard is looking good. Review today’s sessions, client
                activity, and admin communication from one neat workspace.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/trainer/messages")}
                title="Chat with members"
              >
                <MessageCircle className="h-4 w-4" />
                Member Chat
              </Button>

              <Button
                className="gap-2"
                onClick={goAdminChat}
                title="Chat with Admin / Support"
              >
                <Shield className="h-4 w-4" />
                Admin Chat
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {quickStats.map((card, i) => (
            <motion.div key={i} variants={item}>
              <div
                className={`group relative overflow-hidden rounded-3xl border ${cardBorder} ${cardBg} ${softShadow} ${hoverCard} p-5 transition-colors duration-200`}
              >
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl" />

                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${mutedText}`}>
                      {card.label}
                    </p>

                    <div className="mt-2 text-3xl font-bold tracking-tight">
                      {card.value}
                    </div>

                    <p className={`mt-1 text-xs ${mutedText}`}>{card.sub}</p>
                  </div>

                  <div
                    className={`rounded-2xl p-3 transition-colors duration-200 ${darkMode
                        ? "bg-indigo-500/10 text-indigo-300"
                        : "bg-indigo-50 text-indigo-600"
                      }`}
                  >
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-500">
                  <ArrowUpRight className="h-4 w-4" />
                  Stable performance
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4 transition-colors duration-200">
          <div className="space-y-6 lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div
                className={`rounded-3xl border ${cardBorder} ${cardBg} ${softShadow} overflow-hidden transition-colors duration-200`}
              >
                <div className="flex flex-col gap-4 border-b border-inherit p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <CalendarDays className="h-5 w-5 text-indigo-500" />
                      Today’s Schedule
                    </div>

                    <p className={`mt-1 text-sm ${mutedText}`}>
                      Manage your sessions and communication in one place.
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => navigate("/trainer/sessions")}
                    >
                      <Dumbbell className="h-4 w-4" />
                      Add Program
                    </Button>

                    <Button
                      className="gap-2"
                      onClick={() => navigate("/trainer/messages")}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message Client
                    </Button>

                    <Button variant="outline" className="gap-2" onClick={goAdminChat}>
                      <Shield className="h-4 w-4" />
                      Admin Chat
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
                  <div className="space-y-3">
                    {dashboard?.sessions?.length ? (
                      dashboard.sessions
                        .filter((s) => s?.date)
                        .slice(0, 6)
                        .map((s, i) => (
                          <div
                            key={i}
                            className={`group flex items-start justify-between rounded-2xl border ${cardBorder} p-4 ${rowHover} transition-colors duration-200`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 rounded-2xl border ${cardBorder} p-2.5 ${darkMode ? "bg-white/[0.03]" : "bg-slate-50"
                                  }`}
                              >
                                <Clock className="h-4 w-4 text-indigo-500" />
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold">
                                    {s.time || "TBD"}
                                  </p>

                                  <Badge
                                    tone={
                                      s.status === "Confirmed"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {s.status || "Pending"}
                                  </Badge>
                                </div>

                                <p className="mt-1 text-sm">
                                  {s?.clientsEnrolled?.length
                                    ? `${s.clientsEnrolled.length} clients`
                                    : "No clients yet"}
                                </p>

                                <p className={`mt-1 text-xs ${mutedText}`}>
                                  {s.type || "General Session"}
                                </p>
                              </div>
                            </div>

                            <button
                              aria-label="Open session"
                              className="rounded-xl p-1.5 opacity-0 transition-colors duration-200 group-hover:opacity-100 hover:bg-indigo-500/10"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                    ) : (
                      <div
                        className={`rounded-2xl border ${cardBorder} p-4 text-sm ${mutedText}`}
                      >
                        No sessions scheduled
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-2xl border ${cardBorder} p-5 transition-colors duration-200 ${darkMode ? "bg-white/[0.02]" : "bg-slate-50/70"
                      }`}
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-indigo-500" />
                      <p className="text-sm font-semibold">Weekly Progress</p>
                    </div>

                    {[
                      {
                        label: "Sessions",
                        val: actual.sessions,
                        den: targets.sessions,
                      },
                      {
                        label: "Program Updates",
                        val: actual.programUpdates,
                        den: targets.programUpdates,
                      },
                      {
                        label: "Check-ins",
                        val: actual.checkins,
                        den: targets.checkins,
                      },
                      {
                        label: "Unique Clients Served",
                        val: actual.clients,
                        den: targets.clients,
                      },
                    ].map((row, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className={mutedText}>{row.label}</span>

                          <span className="font-semibold">
                            {row.val} / {row.den}
                          </span>
                        </div>

                        <Progress value={pct(row.val, row.den)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div
                className={`rounded-3xl border ${cardBorder} ${cardBg} ${softShadow} p-6 md:p-8 transition-colors duration-200`}
              >
                <h2 className="text-lg font-semibold mb-4">Trainer Tasks</h2>

                <TrainerTaskBoard />
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div
                className={`rounded-3xl border ${cardBorder} ${cardBg} ${softShadow} overflow-hidden transition-colors duration-200`}
              >
                <div className="border-b border-inherit p-5">
                  <h3 className="text-lg font-semibold">Recent Messages</h3>

                  <p className={`mt-1 text-sm ${mutedText}`}>
                    Latest updates from your clients.
                  </p>
                </div>

                <div className="space-y-3 p-5">
                  {dashboard?.messages?.length ? (
                    dashboard.messages.slice(0, 6).map((m, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl border ${cardBorder} p-4 ${rowHover} transition-colors duration-200`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              {m?.name || m?.from || "Client"}
                            </p>

                            <p className={`mt-1 text-xs leading-relaxed ${mutedText}`}>
                              {m?.text || m?.message || ""}
                            </p>
                          </div>

                          <span className={`text-[11px] whitespace-nowrap ${mutedText}`}>
                            {m?.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`rounded-2xl border ${cardBorder} p-4 text-sm ${mutedText}`}
                    >
                      No recent messages
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => navigate("/trainer/messages")}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open Member Inbox
                  </Button>

                  <Button className="w-full gap-2" onClick={goAdminChat}>
                    <Shield className="h-4 w-4" />
                    Open Admin Inbox
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}