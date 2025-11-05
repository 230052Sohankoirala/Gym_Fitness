/* eslint-disable no-unused-vars */
// src/pages/member/UserClasses.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
    MessageCircle,
    Star,
    Calendar,
    Clock,
    Users,
    Search,
    Filter,
    ChevronDown,
    CheckCircle2,
    XCircle
} from "lucide-react";

// ---------------------------
// Mock Data (UI-only)
// ---------------------------
const MOCK_TRAINERS = [
    {
        _id: "t1",
        name: "Adarsh Sapkota",
        speciality: "Strength & Conditioning",
        experience: "5 yrs",
        rating: 4.6,
        bio: "Focus on compound lifts, proper form, and sustainable habit building.",
    },
    {
        _id: "t2",
        name: "Suvam Parajuli",
        speciality: "Yoga & Mobility",
        experience: "3 yrs",
        rating: 4.9,
        bio: "Breath-led mobility sequences that enhance flexibility and calm.",
    },
    {
        _id: "t3",
        name: "Shrabhya Paudel",
        speciality: "HIIT & Fat Loss",
        experience: "4 yrs",
        rating: 4.4,
        bio: "Time-efficient intervals that keep intensity high and results higher.",
    },
];

const MOCK_SESSIONS = [
    {
        _id: "s1",
        trainer: "t1",
        date: "2025-11-10",
        time: "07:00–08:00",
        maxClients: 6,
        clientsEnrolled: [],
        status: "Pending",
        title: "Barbell Foundations",
    },
    {
        _id: "s2",
        trainer: "t1",
        date: "2025-11-12",
        time: "18:00–19:00",
        maxClients: 8,
        clientsEnrolled: ["me"],
        status: "Confirmed",
        title: "Upper Body Strength",
    },
    {
        _id: "s3",
        trainer: "t2",
        date: "2025-11-11",
        time: "06:30–07:15",
        maxClients: 12,
        clientsEnrolled: [],
        status: "Pending",
        title: "Morning Vinyasa Flow",
    },
    {
        _id: "s4",
        trainer: "t3",
        date: "2025-11-13",
        time: "17:30–18:10",
        maxClients: 10,
        clientsEnrolled: ["me", "u2", "u3", "u4", "u5"],
        status: "Confirmed",
        title: "After-Work HIIT",
    },
];

// Utility: star array
const StarRow = ({ value = 0 }) => {
    const full = Math.floor(value);
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={16}
                    className={i < full ? "text-yellow-400" : "text-gray-300 dark:text-gray-500"}
                />
            ))}
            <span className="ml-2 text-sm font-medium">{typeof value === "number" ? value.toFixed(1) : "N/A"}</span>
        </div>
    );
};

// Tag
const Tag = ({ children }) => (
    <span className="inline-block px-2 py-0.5 text-[11px] rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
        {children}
    </span>
);

// Skeleton Card
const TrainerCardSkeleton = ({ darkMode }) => (
    <div className={`rounded-xl overflow-hidden shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"} p-5`}>
        <div className="animate-pulse space-y-3">
            <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
    </div>
);

// Variants
const cardVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    hover: { y: -5, transition: { duration: 0.2 } },
};

const UserClasses = () => {
    const { darkMode } = useTheme();
    const [loading, setLoading] = useState(true);

    // Local UI state (no backend)
    const [trainers, setTrainers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [me] = useState("me"); // fake logged-in user id
    const [search, setSearch] = useState("");
    const [speciality, setSpeciality] = useState("All");
    const [onlyEnrolled, setOnlyEnrolled] = useState(false);
    const [joinMessage, setJoinMessage] = useState("");

    // Simulate initial load
    useEffect(() => {
        const t = setTimeout(() => {
            setTrainers(MOCK_TRAINERS);
            setSessions(MOCK_SESSIONS);
            setLoading(false);
        }, 600);
        return () => clearTimeout(t);
    }, []);

    // Helpers
    const isEnrolled = (session) => (session?.clientsEnrolled || []).includes(me);
    const trainerIdOf = (s) => (typeof s?.trainer === "string" ? s.trainer : s?.trainer?._id || s?.trainer?.id);

    // Filters
    const specialities = useMemo(() => ["All", ...Array.from(new Set(MOCK_TRAINERS.map((t) => t.speciality)))], []);

    const visibleTrainers = useMemo(() => {
        const q = search.trim().toLowerCase();
        return trainers.filter((t) => {
            const matchesText =
                !q ||
                t.name.toLowerCase().includes(q) ||
                t.bio.toLowerCase().includes(q) ||
                (t.speciality || "").toLowerCase().includes(q);
            const matchesSpec = speciality === "All" || t.speciality === speciality;
            return matchesText && matchesSpec;
        });
    }, [trainers, search, speciality]);

    const sessionsByTrainer = useMemo(() => {
        const map = new Map();
        sessions.forEach((s) => {
            if (onlyEnrolled && !isEnrolled(s)) return;
            const tid = trainerIdOf(s);
            if (!map.has(tid)) map.set(tid, []);
            map.get(tid).push(s);
        });
        return map;
    }, [sessions, onlyEnrolled]);

    // UI Actions
    const handleBook = (sessionId) => {
        setSessions((prev) =>
            prev.map((s) => {
                if (s._id !== sessionId) return s;
                // capacity check
                const full = (s.clientsEnrolled?.length || 0) >= (s.maxClients || 0);
                if (full || isEnrolled(s)) return s;
                const firstEnrollment = (s.clientsEnrolled?.length ?? 0) === 0;
                return {
                    ...s,
                    clientsEnrolled: [...(s.clientsEnrolled || []), me],
                    status: s.status === "Pending" && firstEnrollment ? "Confirmed" : s.status,
                };
            })
        );
        setJoinMessage("Joined!");
        setTimeout(() => setJoinMessage(""), 1500);
    };

    const handleChat = (trainerId) => {
        setJoinMessage("Opening chat…");
        setTimeout(() => setJoinMessage(""), 1200);
        // In real app: navigate(`/chat/${trainerId}`)
    };

    // UI Formatting helpers
    const prettyDate = (iso) => {
        try {
            const d = new Date(iso + "T00:00:00");
            return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
        } catch {
            return iso;
        }
    };

    const StatusBadge = ({ status }) => {
        const ok = status === "Confirmed";
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full ${ok
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                    }`}
            >
                {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} className="opacity-70" />}
                {status}
            </span>
        );
    };

    return (
        <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <h1 className={`${darkMode ? "text-white" : "text-gray-800"} text-3xl font-bold text-center mt-2 mb-6`}>
                    Trainers & Classes
                </h1>

                {/* Controls */}
                <div
                    className={`grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 ${darkMode ? "text-white" : "text-gray-900"
                        }`}
                >
                    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${darkMode ? "bg-gray-800" : "bg-white"} shadow`}>
                        <Search size={18} className="opacity-70" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search trainers, specialties, bios…"
                            className={`w-full bg-transparent outline-none text-sm ${darkMode ? "placeholder-gray-400" : "placeholder-gray-500"}`}
                        />
                    </div>

                    <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${darkMode ? "bg-gray-800" : "bg-white"} shadow`}>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="opacity-70" />
                            <span className="text-sm font-medium">Speciality</span>
                        </div>
                        <div className="relative">
                            <select
                                className={`appearance-none bg-transparent pr-6 text-sm outline-none cursor-pointer ${darkMode ? "text-white" : "text-gray-800"}`}
                                value={speciality}
                                onChange={(e) => setSpeciality(e.target.value)}
                            >
                                {specialities.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-70" />
                        </div>
                    </div>

                    <label
                        className={`flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer select-none ${darkMode ? "bg-gray-800" : "bg-white"} shadow`}
                    >
                        <span className="text-sm font-medium">Show my enrollments only</span>
                        <input
                            type="checkbox"
                            checked={onlyEnrolled}
                            onChange={(e) => setOnlyEnrolled(e.target.checked)}
                            className="h-4 w-4 accent-blue-600"
                        />
                    </label>
                </div>

                {/* Grid */}
                <motion.section
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {loading ? (
                        <>
                            <TrainerCardSkeleton darkMode={darkMode} />
                            <TrainerCardSkeleton darkMode={darkMode} />
                            <TrainerCardSkeleton darkMode={darkMode} />
                        </>
                    ) : (
                        <AnimatePresence initial={false}>
                            {visibleTrainers.length === 0 ? (
                                <div
                                    className={`col-span-full rounded-xl p-8 text-center ${darkMode ? "bg-gray-800" : "bg-white"} shadow`}
                                >
                                    <p className="text-sm opacity-80">No trainers match your filters.</p>
                                </div>
                            ) : (
                                visibleTrainers.map((trainer) => {
                                    const tSessions = (sessionsByTrainer.get(trainer._id) || []).sort(
                                        (a, b) => new Date(a.date) - new Date(b.date)
                                    );

                                    return (
                                        <motion.div
                                            key={trainer._id}
                                            variants={cardVariants}
                                            initial="initial"
                                            animate="animate"
                                            whileHover="hover"
                                            exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
                                            className={`rounded-xl overflow-hidden flex flex-col shadow-lg transition-colors ${darkMode ? "bg-gray-800" : "bg-white"
                                                }`}
                                        >
                                            <div className="p-5 flex-1 flex flex-col">
                                                {/* Trainer header */}
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold ${darkMode ? "bg-gray-700" : "bg-gray-100"
                                                            }`}
                                                        title={trainer.name}
                                                    >
                                                        {trainer.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold leading-tight">{trainer.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Tag>{trainer.speciality || "Fitness"}</Tag>
                                                            <Tag>{trainer.experience || "N/A"} exp</Tag>
                                                        </div>
                                                        <div className="mt-2">
                                                            <StarRow value={trainer.rating} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bio */}
                                                <p className="text-sm mt-3 line-clamp-3 opacity-90">{trainer.bio}</p>

                                                {/* Sessions */}
                                                <div className="mt-5 space-y-3">
                                                    {tSessions.length === 0 ? (
                                                        <p className="text-sm text-gray-400 dark:text-gray-500">No sessions available</p>
                                                    ) : (
                                                        tSessions.map((session) => {
                                                            const enrolled = isEnrolled(session);
                                                            const current = session.clientsEnrolled?.length || 0;
                                                            const cap = session.maxClients || 0;
                                                            const full = cap > 0 && current >= cap;

                                                            return (
                                                                <div
                                                                    key={session._id}
                                                                    className={`p-3 rounded-lg border ${darkMode ? "border-gray-700" : "border-gray-200"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-sm font-medium">{session.title || "Class"}</span>
                                                                        <StatusBadge status={session.status} />
                                                                    </div>

                                                                    <div className="flex justify-between items-center mb-2 text-sm">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar size={14} /> {prettyDate(session.date)}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock size={14} /> {session.time}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="flex items-center gap-1">
                                                                            <Users size={14} /> {current}/{cap || "∞"}
                                                                        </span>

                                                                        {enrolled ? (
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.05 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                                onClick={() => handleChat(trainer._id)}
                                                                                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium"
                                                                            >
                                                                                <MessageCircle size={14} /> Chat Now
                                                                            </motion.button>
                                                                        ) : (
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.05 }}
                                                                                whileTap={{ scale: 0.95 }}
                                                                                disabled={full}
                                                                                onClick={() => handleBook(session._id)}
                                                                                className={`px-3 py-1 rounded-lg text-xs font-medium ${full
                                                                                        ? "bg-gray-500 cursor-not-allowed text-white"
                                                                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                                                                    }`}
                                                                            >
                                                                                {full ? "Full" : "Book"}
                                                                            </motion.button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    )}
                </motion.section>

                {/* Booking status feedback */}
                <AnimatePresence>
                    {joinMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-6 text-center"
                        >
                            <p className="inline-block px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                                {joinMessage}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserClasses;
