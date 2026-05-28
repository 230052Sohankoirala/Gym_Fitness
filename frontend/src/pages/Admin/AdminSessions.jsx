import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
    AlertCircle,
    Trash2,
    Users,
    Calendar,
    Clock,
    User,
    Mail,
    Loader2,
    Search,
    Filter,
    Sparkles,
    Activity,
    ChevronRight,
} from "lucide-react";

const API_BASE =  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const AdminSessions = () => {
    const { darkMode } = useTheme();
    const { token, role } = useAuth();

    const [sessions, setSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(null);

    const pageBg = darkMode
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
        : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900";

    const glassCard = darkMode
        ? "bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
        : "bg-white/85 border border-slate-200/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]";

    const softCard = darkMode
        ? "bg-slate-900/70 border border-white/10"
        : "bg-white/70 border border-slate-200";

    const mutedText = darkMode ? "text-slate-300" : "text-slate-600";
    const mutedTextSoft = darkMode ? "text-slate-400" : "text-slate-500";

    const inputBg = darkMode
        ? "bg-slate-900/70 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-400"
        : "bg-white/80 backdrop-blur-md border border-slate-200 text-slate-900 placeholder:text-slate-400";

    useEffect(() => {
        const fetchSessions = async () => {
            if (!token || role !== "admin") {
                setError("Admin not authenticated");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const { data } = await axios.get(`${API_BASE}/api/sessions`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setSessions(Array.isArray(data) ? data : []);
                setFilteredSessions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching sessions:", err);
                setError(err.response?.data?.message || "Failed to load sessions");
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [token, role]);

    useEffect(() => {
        const q = searchTerm.toLowerCase().trim();

        const filtered = sessions.filter((session) => {
            const trainerName = session.trainer?.name?.toLowerCase() || "";
            const trainerEmail = session.trainer?.email?.toLowerCase() || "";
            const sessionType = session.type?.toLowerCase() || "";

            return (
                trainerName.includes(q) ||
                trainerEmail.includes(q) ||
                sessionType.includes(q)
            );
        });

        setFilteredSessions(filtered);
    }, [searchTerm, sessions]);

    const totalEnrolled = useMemo(() => {
        return sessions.reduce(
            (sum, session) => sum + (session.clientsEnrolled?.length || 0),
            0
        );
    }, [sessions]);

    const deleteSession = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this session? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            setDeleteLoading(id);

            await axios.delete(`${API_BASE}/api/sessions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSessions((prev) => prev.filter((s) => s._id !== id));
        } catch (err) {
            console.error("Error deleting session:", err);
            alert(err.response?.data?.message || "Failed to delete session");
        } finally {
            setDeleteLoading(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No date";

        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getCapacityColor = (enrolled, max) => {
        const percentage = max > 0 ? (enrolled / max) * 100 : 0;

        if (percentage >= 90) return "text-red-400";
        if (percentage >= 70) return "text-orange-400";

        return "text-emerald-400";
    };

    const getCapacityBarColor = (enrolled, max) => {
        const percentage = max > 0 ? enrolled / max : 0;

        if (percentage >= 0.9) return "bg-red-500";
        if (percentage >= 0.7) return "bg-orange-500";

        return "bg-emerald-500";
    };

    if (loading) {
        return (
            <div
                className={`min-h-screen flex items-center justify-center transition-all duration-200 ${pageBg}`}
            >
                <div className={`rounded-[2rem] border px-8 py-7 text-center ${glassCard}`}>
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-500" />

                    <p className={mutedText}>Loading sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-all duration-200 ${pageBg}`}>
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div
                    className={`relative overflow-hidden rounded-[2rem] border p-6 sm:p-7 mb-6 ${glassCard}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-blue-500/10 pointer-events-none" />
                    <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                            <div
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${darkMode
                                        ? "bg-indigo-500/10 text-indigo-300 border-indigo-400/20"
                                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    }`}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Session Management
                            </div>

                            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                                Training Sessions
                            </h1>

                            <p className={`mt-2 text-sm sm:text-base max-w-2xl ${mutedText}`}>
                                Manage all training sessions, monitor enrollment, and keep trainer
                                schedules organized in one place.
                            </p>
                        </div>

                        <div
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium border ${darkMode
                                    ? "bg-white/[0.05] border-white/10 text-slate-200"
                                    : "bg-white/80 border-slate-200 text-slate-700"
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            {sessions.length} total sessions
                        </div>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className={`rounded-[2rem] border p-5 ${glassCard} transition-all duration-200`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${mutedText}`}>All Sessions</p>
                                <p className="text-3xl font-bold tracking-tight mt-2">{sessions.length}</p>
                            </div>

                            <div
                                className={`p-2.5 rounded-2xl ${darkMode
                                        ? "bg-indigo-500/10 text-indigo-300"
                                        : "bg-indigo-50 text-indigo-700"
                                    }`}
                            >
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-[2rem] border p-5 ${glassCard} transition-all duration-200`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${mutedText}`}>Filtered Results</p>
                                <p className="text-3xl font-bold tracking-tight mt-2">
                                    {filteredSessions.length}
                                </p>
                            </div>

                            <div
                                className={`p-2.5 rounded-2xl ${darkMode
                                        ? "bg-violet-500/10 text-violet-300"
                                        : "bg-violet-50 text-violet-700"
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-[2rem] border p-5 ${glassCard} transition-all duration-200`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm ${mutedText}`}>Total Enrolled</p>
                                <p className="text-3xl font-bold tracking-tight mt-2">{totalEnrolled}</p>
                            </div>

                            <div
                                className={`p-2.5 rounded-2xl ${darkMode
                                        ? "bg-emerald-500/10 text-emerald-300"
                                        : "bg-emerald-50 text-emerald-700"
                                    }`}
                            >
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className={`rounded-[2rem] border p-5 mb-6 ${glassCard}`}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search
                                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextSoft}`}
                            />

                            <input
                                type="text"
                                placeholder="Search by trainer, email, or session type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 rounded-2xl outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 ${inputBg}`}
                            />
                        </div>

                        <button
                            className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-all duration-200 ${darkMode
                                    ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                                    : "border-slate-200 bg-white/80 hover:bg-slate-50"
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className={`flex items-start gap-3 p-4 mb-6 rounded-[1.5rem] border transition-all duration-200 ${darkMode
                                ? "bg-red-500/10 border-red-400/20 text-red-300"
                                : "bg-red-50 border-red-200 text-red-700"
                            }`}
                    >
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />

                        <div>
                            <p className="font-medium">Unable to load sessions</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {/* Sessions */}
                {!error && (
                    <div className="grid gap-6">
                        {filteredSessions.length === 0 ? (
                            <div className={`text-center py-14 rounded-[2rem] border ${glassCard}`}>
                                <Users className={`w-12 h-12 mx-auto mb-4 ${mutedTextSoft}`} />

                                <h3 className="text-lg font-semibold mb-2">No sessions found</h3>

                                <p className={mutedText}>
                                    {searchTerm
                                        ? "Try adjusting your search terms"
                                        : "No sessions have been created yet"}
                                </p>
                            </div>
                        ) : (
                            filteredSessions.map((session) => {
                                const enrolled = session.clientsEnrolled?.length || 0;
                                const maxClients = session.maxClients || 0;

                                const fillWidth =
                                    maxClients > 0
                                        ? Math.min(100, (enrolled / maxClients) * 100)
                                        : 0;

                                return (
                                    <div
                                        key={session._id}
                                        className={`rounded-[2rem] border p-6 transition-all duration-200 hover:shadow-xl ${glassCard}`}
                                    >
                                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                                            {/* Left */}
                                            <div className="flex-1 space-y-5">
                                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                                    <div>
                                                        <h3 className="text-xl font-semibold">
                                                            {session.type || "Session"}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${darkMode
                                                                        ? "bg-indigo-500/10 text-indigo-300"
                                                                        : "bg-indigo-50 text-indigo-700"
                                                                    }`}
                                                            >
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {formatDate(session.date)}
                                                            </span>

                                                            <span
                                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${darkMode
                                                                        ? "bg-violet-500/10 text-violet-300"
                                                                        : "bg-violet-50 text-violet-700"
                                                                    }`}
                                                            >
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {session.time || "No time"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${darkMode
                                                                ? "bg-white/[0.05] text-slate-200"
                                                                : "bg-slate-100 text-slate-700"
                                                            }`}
                                                    >
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                        Session Detail
                                                    </div>
                                                </div>

                                                {/* Trainer */}
                                                <div
                                                    className={`rounded-[1.5rem] p-4 transition-all duration-200 ${softCard}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`p-2.5 rounded-2xl ${darkMode ? "bg-white/[0.05]" : "bg-slate-100"
                                                                }`}
                                                        >
                                                            <User className="w-4 h-4 text-slate-500" />
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold">
                                                                {session.trainer?.name || "N/A"}
                                                            </p>

                                                            <p className={`text-sm flex items-center gap-1.5 mt-1 ${mutedText}`}>
                                                                <Mail className="w-3.5 h-3.5" />
                                                                {session.trainer?.email || "No email"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Capacity */}
                                                <div
                                                    className={`rounded-[1.5rem] p-4 transition-all duration-200 ${softCard}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`p-2.5 rounded-2xl ${darkMode ? "bg-white/[0.05]" : "bg-slate-100"
                                                                }`}
                                                        >
                                                            <Users className="w-4 h-4 text-slate-500" />
                                                        </div>

                                                        <div className="flex-1">
                                                            <p className={`font-semibold ${getCapacityColor(enrolled, maxClients)}`}>
                                                                {enrolled} / {maxClients} clients
                                                            </p>

                                                            <div
                                                                className={`w-full max-w-xs h-2.5 rounded-full mt-2 overflow-hidden ${darkMode ? "bg-white/[0.08]" : "bg-slate-200"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-200 ${getCapacityBarColor(
                                                                        enrolled,
                                                                        maxClients
                                                                    )}`}
                                                                    style={{ width: `${fillWidth}%` }}
                                                                />
                                                            </div>

                                                            <p className={`text-xs mt-2 ${mutedTextSoft}`}>
                                                                Enrollment progress for this session
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right */}
                                            <div className="flex xl:flex-col gap-3">
                                                <button
                                                    onClick={() => deleteSession(session._id)}
                                                    disabled={deleteLoading === session._id}
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {deleteLoading === session._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}

                                                    {deleteLoading === session._id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminSessions;