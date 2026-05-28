// src/pages/trainer/TrainerClient.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function TrainerClient() {
    const { darkMode } = useTheme();

    const baseBg = darkMode
        ? "bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#0f172a]"
        : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60";

    const cardBg = darkMode ? "bg-gray-800" : "bg-white";
    const text = darkMode ? "text-gray-100" : "text-gray-900";
    const border = darkMode ? "border-gray-700" : "border-gray-200";
    const muted = darkMode ? "text-gray-400" : "text-gray-600";
    const softBg = darkMode ? "bg-gray-900/40" : "bg-gray-50";

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

    const api = useMemo(() => {
        const token =
            localStorage.getItem("trainerToken") ||
            sessionStorage.getItem("trainerToken") ||
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        return axios.create({
            baseURL: `${API_BASE}/api`,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setErrMsg("");

                const { data } = await api.get("/sessions/my/clients-with-sessions");

                if (Array.isArray(data)) {
                    const normalized = data.map((row) => ({
                        user: row?.user || row || {},
                        sessions: Array.isArray(row?.sessions) ? row.sessions : [],
                    }));

                    setClients(normalized);
                } else {
                    setClients([]);
                }
            } catch (e) {
                setErrMsg(e?.response?.data?.message || "Failed to load clients.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [api]);

    const getBadgeColor = (type) => {
        switch (type) {
            case "Gold":
                return "bg-yellow-100 text-yellow-700";
            case "Silver":
                return "bg-gray-200 text-gray-700";
            case "Normal":
            case "Basic":
                return "bg-indigo-100 text-indigo-700";
            default:
                return "bg-gray-200 text-gray-600";
        }
    };

    const toDisplay = (v) => {
        return v === null || v === undefined || v === "" ? "N/A" : String(v);
    };

    const pick = (obj, keys) => {
        for (const k of keys) {
            const val = k
                .split(".")
                .reduce((acc, part) => (acc ? acc[part] : undefined), obj);

            if (val !== undefined && val !== null) return val;
        }

        return undefined;
    };

    const formatGoals = (g) => {
        if (g === null || g === undefined) return "N/A";

        if (Array.isArray(g)) {
            return g.filter(Boolean).join(", ") || "N/A";
        }

        if (typeof g === "object") {
            const vals = Object.values(g).filter(Boolean);
            return vals.length ? vals.join(", ") : "N/A";
        }

        const s = String(g).trim();

        return s || "N/A";
    };

    const safeDate = (d) => {
        if (!d) return "N/A";

        const dt = new Date(d);

        if (Number.isNaN(dt.getTime())) return String(d);

        return dt.toLocaleDateString();
    };

    const safeTime = (t) => {
        if (!t) return "";

        if (typeof t === "string" && t.includes(":") && t.length <= 8) return t;

        const dt = new Date(t);

        if (!Number.isNaN(dt.getTime())) {
            return dt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        return String(t);
    };

    const formatMoney = (v) => {
        if (v === null || v === undefined || v === "") return "N/A";

        const num = Number(v);

        if (!Number.isFinite(num)) return "N/A";

        return `$${num.toFixed(2)}`;
    };

    const statusPill = (s) => {
        const st = (s || "").toLowerCase();

        if (st === "confirmed" || st === "booked") {
            return darkMode
                ? "bg-green-900/40 text-green-200"
                : "bg-green-100 text-green-700";
        }

        if (st === "pending") {
            return darkMode
                ? "bg-yellow-900/40 text-yellow-200"
                : "bg-yellow-100 text-yellow-700";
        }

        if (st === "cancelled") {
            return darkMode
                ? "bg-red-900/40 text-red-200"
                : "bg-red-100 text-red-700";
        }

        if (st === "completed") {
            return darkMode
                ? "bg-blue-900/40 text-blue-200"
                : "bg-blue-100 text-blue-700";
        }

        if (st === "inprogress") {
            return darkMode
                ? "bg-purple-900/40 text-purple-200"
                : "bg-purple-100 text-purple-700";
        }

        return darkMode
            ? "bg-gray-700 text-gray-200"
            : "bg-gray-200 text-gray-700";
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${baseBg} ${text} flex items-center justify-center`}>
                <p className={muted}>Loading clients…</p>
            </div>
        );
    }

    if (errMsg) {
        return (
            <div className={`min-h-screen ${baseBg} ${text} flex items-center justify-center`}>
                <div className={`rounded-xl border ${border} ${cardBg} p-6`}>
                    <p className="text-red-500 font-semibold">{errMsg}</p>

                    <p className={`mt-2 text-sm ${muted}`}>
                        Check your backend route and trainer token.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={`min-h-screen ${baseBg} ${text} transition-colors duration-200`}>
                <main className="mx-auto max-w-6xl p-6">
                    <div className="flex items-end justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Clients</h1>

                            <p className={`text-sm ${muted}`}>
                                Each client may appear with multiple joined sessions.
                            </p>
                        </div>

                        <div className={`text-sm ${muted}`}>
                            Total Clients: <span className="font-semibold">{clients.length}</span>
                        </div>
                    </div>

                    {clients.length === 0 ? (
                        <div className={`rounded-xl border ${border} ${cardBg} p-6`}>
                            <p className={muted}>No clients have booked your sessions yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {clients.map((row, idx) => {
                                const u = row?.user || {};
                                const sessions = Array.isArray(row?.sessions) ? row.sessions : [];

                                const key = u?._id || u?.id || u?.email || `row-${idx}`;

                                const name = u.fullname || u.name || "Unnamed";
                                const email = u.email || "N/A";
                                const membership = u.membership || u.MemberShip || "Normal";
                                const weight = pick(u, ["weight", "profile.weight", "metrics.weight"]);
                                const height = pick(u, ["height", "profile.height", "metrics.height"]);
                                const rawAge = pick(u, ["age", "profile.age", "metadata.age"]);
                                const rawGoals = pick(u, [
                                    "goals",
                                    "goal",
                                    "userGoals",
                                    "profile.goals",
                                    "fitnessGoals",
                                ]);

                                return (
                                    <div
                                        key={key}
                                        className={`rounded-2xl border ${border} ${cardBg} p-5 shadow-sm hover:shadow-md transition`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-semibold truncate">{name}</h2>

                                                <p className={`text-sm ${muted} truncate`}>{email}</p>
                                            </div>

                                            <span
                                                className={`px-3 py-1 text-xs rounded-full font-medium ${getBadgeColor(
                                                    membership
                                                )}`}
                                            >
                                                {membership}
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm">
                                            <p>
                                                <span className="font-medium">Weight:</span>{" "}
                                                {toDisplay(weight)}
                                            </p>

                                            <p>
                                                <span className="font-medium">Height:</span>{" "}
                                                {toDisplay(height)}
                                            </p>

                                            <p>
                                                <span className="font-medium">Age:</span>{" "}
                                                {toDisplay(rawAge)}
                                            </p>

                                            <p>
                                                <span className="font-medium">Goal:</span>{" "}
                                                {formatGoals(rawGoals)}
                                            </p>
                                        </div>

                                        <div className="mt-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold">Joined Sessions</p>

                                                <span className={`text-xs ${muted}`}>
                                                    {sessions.length} joined
                                                </span>
                                            </div>

                                            {sessions.length ? (
                                                <div
                                                    className={`rounded-xl border ${border} ${softBg} p-2 max-h-44 overflow-y-auto`}
                                                >
                                                    <div className="space-y-2">
                                                        {sessions.map((s, i) => {
                                                            const sid = s?._id || s?.id || `${key}-s-${i}`;
                                                            const title = s?.title || s?.type || s?.name || "Session";
                                                            const date = safeDate(s?.date);
                                                            const t = safeTime(s?.time);
                                                            const price = formatMoney(s?.price);
                                                            const status = s?.status || "Pending";

                                                            return (
                                                                <div
                                                                    key={sid}
                                                                    className={`rounded-lg border ${border} p-2 ${darkMode ? "bg-gray-800" : "bg-white"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-semibold truncate">
                                                                                {title}
                                                                            </p>

                                                                            <p className={`text-xs ${muted}`}>
                                                                                {date}
                                                                                {t ? ` • ${t}` : ""}
                                                                            </p>
                                                                        </div>

                                                                        <div className="text-right shrink-0">
                                                                            <p className="text-sm font-semibold">
                                                                                {price}
                                                                            </p>

                                                                            <span
                                                                                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusPill(
                                                                                    status
                                                                                )}`}
                                                                            >
                                                                                {status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`rounded-xl border ${border} ${softBg} p-3`}>
                                                    <p className={`text-xs ${muted}`}>
                                                        No session joins found for this client.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-5 flex gap-2">
                                            <button className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </motion.div>
    );
}