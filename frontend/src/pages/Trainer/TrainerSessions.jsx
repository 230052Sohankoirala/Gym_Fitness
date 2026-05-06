import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    CalendarDays,
    Plus,
    Clock3,
    Users,
    Trash2,
    CheckCircle2,
    PlayCircle,
    AlertCircle,
    BadgeDollarSign,
    Dumbbell,
    X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut" },
    },
};

const listVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { delayChildren: 0.08, staggerChildren: 0.07 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.32, ease: "easeOut" },
    },
};

const btnTap = { scale: 0.985, transition: { duration: 0.1 } };

const fmt = (d) => {
    const dt = d ? new Date(d) : null;
    return dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleString() : "";
};

const centsToDollars = (cents) => {
    const n = Number(cents || 0);
    if (!Number.isFinite(n) || n <= 0) return "0.00";
    return (n / 100).toFixed(2);
};

export default function TrainerSessions() {
    const { darkMode } = useTheme();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [updatingSession, setUpdatingSession] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createErr, setCreateErr] = useState("");

    const [form, setForm] = useState({
        date: "",
        time: "",
        type: "Personal Training",
        maxClients: 1,
        priceDollars: "3.00",
    });

    const token = useMemo(
        () => localStorage.getItem("trainerToken") || localStorage.getItem("token"),
        []
    );

    const api = useMemo(
        () =>
            axios.create({
                baseURL: "http://localhost:4000/api",
                headers: { Authorization: `Bearer ${token}` },
            }),
        [token]
    );

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setErr("");
            const { data } = await api.get("/sessions/my");
            setSessions(data || []);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load sessions");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        load();
    }, [load]);

    const start = async (id) => {
        try {
            setUpdatingSession(id);
            await api.post(`/sessions/${id}/start`);
            await load();
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to start");
        } finally {
            setUpdatingSession(null);
        }
    };

    const complete = async (id) => {
        try {
            setUpdatingSession(id);
            await api.post(`/sessions/${id}/complete`);
            await load();
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to complete");
        } finally {
            setUpdatingSession(null);
        }
    };

    const patchStatus = async (id, status) => {
        try {
            setUpdatingSession(id);
            if (status === "InProgress") {
                await api.post(`/sessions/${id}/start`);
            } else if (status === "Completed") {
                await api.post(`/sessions/${id}/complete`);
            } else {
                await api.put(`/sessions/${id}`, { status });
            }
            await load();
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingSession(null);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this session? This cannot be undone.")) return;
        setDeletingId(id);

        const prev = sessions;
        setSessions((s) => s.filter((x) => x._id !== id));

        try {
            await api.delete(`/sessions/${id}`);
        } catch (e) {
            setSessions(prev);
            alert(e?.response?.data?.message || "Failed to delete session");
        } finally {
            setDeletingId(null);
            load();
        }
    };

    const onCreate = async (e) => {
        e.preventDefault();
        setCreateErr("");

        if (!form.date || !form.time || !form.type || !form.maxClients) {
            setCreateErr("All fields are required");
            return;
        }

        const maxC = Number(form.maxClients);
        if (!Number.isFinite(maxC) || maxC < 1 || maxC > 10) {
            setCreateErr("Max clients must be between 1 and 10");
            return;
        }

        const dollars = Number(form.priceDollars);
        if (!Number.isFinite(dollars) || dollars < 0) {
            setCreateErr("Price must be 0 or more");
            return;
        }

        if (dollars > 10) {
            setCreateErr("Max price allowed is $10.00");
            return;
        }

        const priceInCents = Math.round(dollars * 100);

        try {
            setCreating(true);
            await api.post("/sessions", {
                date: String(form.date),
                time: String(form.time),
                type: String(form.type),
                maxClients: maxC,
                priceInCents,
            });

            setShowCreate(false);
            setForm({
                date: "",
                time: "",
                type: "Personal Training",
                maxClients: 1,
                priceDollars: "0.00",
            });
            await load();
        } catch (e) {
            setCreateErr(e?.response?.data?.message || "Failed to create session");
        } finally {
            setCreating(false);
        }
    };

    const pageBg = darkMode
        ? "bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#0f172a]"
        : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60";

    const panelBg = darkMode
        ? "bg-white/[0.05] backdrop-blur-xl"
        : "bg-white/90 backdrop-blur-xl";

    const cardBg = darkMode
        ? "bg-white/[0.04]"
        : "bg-white";

    const borderCls = darkMode ? "border-white/10" : "border-slate-200";
    const textMain = darkMode ? "text-white" : "text-slate-900";
    const textMuted = darkMode ? "text-slate-300" : "text-slate-600";
    const subtleText = darkMode ? "text-slate-400" : "text-slate-500";
    const hoverCard = darkMode
        ? "hover:bg-white/[0.07] hover:border-indigo-400/20"
        : "hover:bg-slate-50 hover:border-indigo-200";
    const shadowCls = darkMode
        ? "shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
        : "shadow-[0_12px_32px_rgba(15,23,42,0.08)]";

    const statusBadgeClass = (status) => {
        switch (status) {
            case "Pending":
                return darkMode
                    ? "bg-amber-500/15 text-amber-300 border border-amber-400/20"
                    : "bg-amber-50 text-amber-700 border border-amber-200";
            case "Confirmed":
                return darkMode
                    ? "bg-blue-500/15 text-blue-300 border border-blue-400/20"
                    : "bg-blue-50 text-blue-700 border border-blue-200";
            case "InProgress":
                return darkMode
                    ? "bg-violet-500/15 text-violet-300 border border-violet-400/20"
                    : "bg-violet-50 text-violet-700 border border-violet-200";
            case "Completed":
                return darkMode
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "Cancelled":
                return darkMode
                    ? "bg-red-500/15 text-red-300 border border-red-400/20"
                    : "bg-red-50 text-red-700 border border-red-200";
            default:
                return darkMode
                    ? "bg-slate-700/50 text-slate-200 border border-white/10"
                    : "bg-slate-100 text-slate-700 border border-slate-200";
        }
    };

    return (
        <motion.div
            className={`min-h-screen ${pageBg} transition-colors duration-200`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div
                    className={`relative overflow-hidden rounded-3xl border ${borderCls} ${panelBg} ${shadowCls} p-6 sm:p-8 transition-colors duration-200`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-blue-500/10 pointer-events-none" />
                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${darkMode
                                        ? "bg-indigo-500/10 text-indigo-300 border-indigo-400/20"
                                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    }`}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                Session Planner
                            </div>

                            <h1 className={`mt-3 text-2xl sm:text-3xl font-bold ${textMain}`}>
                                My Sessions
                            </h1>
                            <p className={`mt-2 text-sm ${textMuted}`}>
                                Create, manage, and update all your training sessions from one
                                clean dashboard.
                            </p>
                        </div>

                        <motion.button
                            whileTap={btnTap}
                            onClick={() => setShowCreate(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 transition-colors duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            New Session
                        </motion.button>
                    </div>
                </div>

                {/* Loading */}
                <AnimatePresence>
                    {loading && sessions.length === 0 && (
                        <motion.div
                            key="loading"
                            className={`rounded-3xl border ${borderCls} ${panelBg} ${shadowCls} p-8 text-center transition-colors duration-200`}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1, transition: { duration: 0.25 } }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <motion.div
                                    className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                                />
                                <span className={textMuted}>Loading sessions...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                    {!loading && err && (
                        <motion.div
                            key="error"
                            className={`rounded-3xl border p-4 ${shadowCls} ${darkMode
                                    ? "bg-red-500/10 border-red-400/20 text-red-300"
                                    : "bg-red-50 border-red-200 text-red-700"
                                }`}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                <span>{err}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty */}
                <AnimatePresence>
                    {!loading && !err && sessions.length === 0 && (
                        <motion.div
                            key="empty"
                            className={`rounded-3xl border ${borderCls} ${panelBg} ${shadowCls} p-10 text-center transition-colors duration-200`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-blue-500/15">
                                <Dumbbell className={`h-7 w-7 ${darkMode ? "text-indigo-300" : "text-indigo-600"}`} />
                            </div>
                            <p className={`text-lg font-semibold ${textMain}`}>
                                No sessions scheduled yet
                            </p>
                            <p className={`mt-2 text-sm ${subtleText}`}>
                                Create your first session and it will appear here.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sessions list */}
                {!loading && !err && sessions.length > 0 && (
                    <motion.div
                        className="space-y-4"
                        variants={listVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {sessions.map((s) => (
                            <motion.div
                                key={s._id}
                                variants={cardVariants}
                                layout
                                className={`rounded-3xl border ${borderCls} ${cardBg} ${shadowCls} ${hoverCard} p-5 sm:p-6 transition-colors duration-200`}
                            >
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                    {/* Left content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className={`text-lg font-bold ${textMain}`}>
                                                {s.type} • {s.date} {s.time}
                                            </h3>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                                                    s.status
                                                )}`}
                                            >
                                                {s.status}
                                            </span>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${darkMode
                                                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/20"
                                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    }`}
                                            >
                                                <BadgeDollarSign className="h-3.5 w-3.5" />
                                                ${centsToDollars(s.priceInCents)}
                                            </span>
                                        </div>

                                        <div className={`mt-4 flex flex-wrap gap-4 text-sm ${textMuted}`}>
                                            <div className="inline-flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>
                                                    Enrolled:{" "}
                                                    <span className={`font-semibold ${textMain}`}>
                                                        {s.clientsEnrolled?.length || 0}/{s.maxClients}
                                                    </span>
                                                </span>
                                            </div>

                                            {s.startAt && (
                                                <div className="inline-flex items-center gap-2">
                                                    <PlayCircle className="h-4 w-4" />
                                                    <span>Started: {fmt(s.startAt)}</span>
                                                </div>
                                            )}

                                            {s.endAt && (
                                                <div className="inline-flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Completed: {fmt(s.endAt)}</span>
                                                </div>
                                            )}

                                            {!s.startAt && !s.endAt && (
                                                <div className="inline-flex items-center gap-2">
                                                    <Clock3 className="h-4 w-4" />
                                                    <span>Session status is still pending update</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right actions */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <motion.button
                                            whileTap={btnTap}
                                            onClick={() => start(s._id)}
                                            disabled={
                                                s.status === "InProgress" ||
                                                s.status === "Completed" ||
                                                updatingSession === s._id ||
                                                deletingId === s._id
                                            }
                                            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <PlayCircle className="h-4 w-4" />
                                            {updatingSession === s._id ? "..." : "Start"}
                                        </motion.button>

                                        <motion.button
                                            whileTap={btnTap}
                                            onClick={() => complete(s._id)}
                                            disabled={
                                                s.status === "Completed" ||
                                                updatingSession === s._id ||
                                                deletingId === s._id
                                            }
                                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {updatingSession === s._id ? "..." : "Complete"}
                                        </motion.button>

                                        <select
                                            className={`rounded-2xl border px-3.5 py-2.5 text-sm font-medium outline-none transition-colors duration-200 ${darkMode
                                                    ? "border-white/10 bg-white/[0.05] text-white focus:border-indigo-400"
                                                    : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500"
                                                }`}
                                            value={s.status}
                                            onChange={(e) => patchStatus(s._id, e.target.value)}
                                            disabled={updatingSession === s._id || deletingId === s._id}
                                        >
                                            {["Pending", "Confirmed", "InProgress", "Completed", "Cancelled"].map(
                                                (st) => (
                                                    <option key={st} value={st}>
                                                        {st}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <motion.button
                                            whileTap={btnTap}
                                            onClick={() => remove(s._id)}
                                            disabled={deletingId === s._id || updatingSession === s._id}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                            title="Delete session"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {deletingId === s._id ? "Deleting..." : "Delete"}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreate && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !creating && setShowCreate(false)}
                        >
                            <motion.form
                                onClick={(e) => e.stopPropagation()}
                                onSubmit={onCreate}
                                className={`w-full max-w-lg rounded-3xl border ${borderCls} ${panelBg} ${shadowCls} p-6 transition-colors duration-200`}
                                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                                animate={{ y: 0, opacity: 1, scale: 1, transition: { duration: 0.22 } }}
                                exit={{ y: 12, opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                            >
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className={`text-xl font-bold ${textMain}`}>Create Session</h2>
                                        <p className={`mt-1 text-sm ${textMuted}`}>
                                            Set up a new training session for your clients.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => !creating && setShowCreate(false)}
                                        className={`rounded-xl p-2 transition-colors duration-200 ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {createErr && (
                                    <div
                                        className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${darkMode
                                                ? "bg-red-500/10 border-red-400/20 text-red-300"
                                                : "bg-red-50 border-red-200 text-red-700"
                                            }`}
                                    >
                                        {createErr}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className={`block text-sm ${textMuted}`}>
                                        Date
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                                            className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200 ${darkMode
                                                    ? "border-white/10 bg-white/[0.05] text-white"
                                                    : "border-slate-300 bg-white text-slate-900"
                                                }`}
                                            required
                                        />
                                    </label>

                                    <label className={`block text-sm ${textMuted}`}>
                                        Time
                                        <input
                                            type="time"
                                            value={form.time}
                                            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                                            className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200 ${darkMode
                                                    ? "border-white/10 bg-white/[0.05] text-white"
                                                    : "border-slate-300 bg-white text-slate-900"
                                                }`}
                                            required
                                        />
                                    </label>

                                    <label className={`block text-sm sm:col-span-2 ${textMuted}`}>
                                        Type
                                        <input
                                            type="text"
                                            value={form.type}
                                            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                                            placeholder="e.g., HIIT / Strength / Yoga"
                                            className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200 ${darkMode
                                                    ? "border-white/10 bg-white/[0.05] text-white placeholder:text-slate-500"
                                                    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                                                }`}
                                            required
                                        />
                                    </label>

                                    <label className={`block text-sm ${textMuted}`}>
                                        Max Clients (1–10)
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={form.maxClients}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, maxClients: e.target.value }))
                                            }
                                            className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200 ${darkMode
                                                    ? "border-white/10 bg-white/[0.05] text-white"
                                                    : "border-slate-300 bg-white text-slate-900"
                                                }`}
                                            required
                                        />
                                    </label>

                                    <label className={`block text-sm ${textMuted}`}>
                                        Price ($0 – $10)
                                        <input
                                            type="number"
                                            min={0}
                                            max={10}
                                            step="0.01"
                                            value={form.priceDollars}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, priceDollars: e.target.value }))
                                            }
                                            className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200 ${darkMode
                                                    ? "border-white/10 bg-white/[0.05] text-white"
                                                    : "border-slate-300 bg-white text-slate-900"
                                                }`}
                                            required
                                        />
                                    </label>
                                </div>

                                <p className={`mt-3 text-xs ${subtleText}`}>
                                    Max allowed: $10.00 (development cap)
                                </p>

                                <div className="mt-6 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => !creating && setShowCreate(false)}
                                        className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${darkMode
                                                ? "border-white/10 text-white hover:bg-white/10"
                                                : "border-slate-300 text-slate-800 hover:bg-slate-100"
                                            }`}
                                        disabled={creating}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 transition-colors duration-200 disabled:opacity-50"
                                        disabled={creating}
                                    >
                                        {creating ? "Creating..." : "Create Session"}
                                    </button>
                                </div>
                            </motion.form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}