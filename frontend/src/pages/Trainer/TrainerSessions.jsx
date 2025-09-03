// src/pages/trainer/TrainerSessions.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const STATUS_OPTIONS = ["Confirmed", "Pending", "Cancelled", "Completed"];

const TrainerSessions = () => {
    const { darkMode } = useTheme();
    const trainerName = "Suvam Parajuli";

    // Form state
    const [form, setForm] = useState({
        date: "",
        time: "",
        trainer: trainerName,
        type: "",
        status: "Confirmed",
    });

    // Sessions state (persisted)
    const [sessions, setSessions] = useState([]);

    // Load once
    useEffect(() => {
        const saved = localStorage.getItem("trainer_sessions");
        if (saved) {
            try {
                setSessions(JSON.parse(saved));
            } catch {
                localStorage.removeItem("trainer_sessions");
            }
        }
    }, []);

    // Persist
    useEffect(() => {
        localStorage.setItem("trainer_sessions", JSON.stringify(sessions));
    }, [sessions]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const AddSessions = () => {
        if (!form.date || !form.time || !form.trainer || !form.type) return;

        const newSession = {
            id: Date.now(),
            date: form.date,
            time: form.time,
            trainer: form.trainer.trim(),
            type: form.type.trim(),
            status: form.status,
        };
        setSessions((prev) => [newSession, ...prev]);
        setForm((f) => ({ date: "", time: "", trainer: trainerName, type: "", status: f.status }));
    };

    const DeleteSession = (id) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
    };

    // Sort upcoming first
    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            const da = new Date(`${a.date}T${a.time}`);
            const db = new Date(`${b.date}T${b.time}`);
            return da - db;
        });
    }, [sessions]);

    // Status pill classes
    const statusClass = (status) => {
        if (status === "Confirmed") return "bg-green-100 text-green-700";
        if (status === "Pending") return "bg-yellow-100 text-yellow-700";
        if (status === "Cancelled") return "bg-red-100 text-red-700";
        if (status === "Completed") return "bg-blue-100 text-blue-700"; // fixed
        return "bg-gray-100 text-gray-700";
    };

    const muted = darkMode ? "text-gray-400" : "text-gray-500";

    return (
        <div
            className={`p-6 min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
                }`}
        >
            <main className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Sessions</h1>
                </div>

                {/* Form */}
                <div
                    className={`rounded-xl p-4 mb-8 border transition-colors duration-200 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                        }`}
                >
                    <h2 className="text-lg font-semibold mb-3">Add a Session</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <div className="flex flex-col">
                            <label className="text-sm mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={onChange}
                                className={`rounded-lg px-3 py-2 border outline-none transition-colors duration-200 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
                                    }`}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm mb-1">Time</label>
                            <input
                                type="time"
                                name="time"
                                value={form.time}
                                onChange={onChange}
                                className={`rounded-lg px-3 py-2 border outline-none transition-colors duration-200 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
                                    }`}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm mb-1">Trainer</label>
                            <input
                                type="text"
                                name="trainer"
                                value={form.trainer}
                                disabled
                                placeholder="e.g., Suvam Parajuli"
                                className={`rounded-lg px-3 py-2 border outline-none transition-colors duration-200 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
                                    } cursor-not-allowed`}
                                aria-readonly="true"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm mb-1">Type</label>
                            <input
                                type="text"
                                name="type"
                                value={form.type}
                                onChange={onChange}
                                placeholder="e.g., Strength • Push Day"
                                list="type-suggestions"
                                className={`rounded-lg px-3 py-2 border outline-none transition-colors duration-200 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
                                    }`}
                            />
                            <datalist id="type-suggestions">
                                <option value="Strength • Push Day" />
                                <option value="Strength • Pull Day" />
                                <option value="HIIT • Cardio" />
                                <option value="Mobility • Full Body" />
                                <option value="Hypertrophy • Upper" />
                                <option value="Hypertrophy • Lower" />
                            </datalist>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm mb-1">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={onChange}
                                className={`rounded-lg px-3 py-2 border outline-none  transition-colors duration-200 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
                                    }`}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={AddSessions}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg"
                            disabled={!form.date || !form.time || !form.trainer || !form.type}
                            title={
                                !form.date || !form.time || !form.trainer || !form.type
                                    ? "Fill all fields to add"
                                    : "Add session"
                            }
                        >
                            Add Session
                        </button>
                    </div>
                </div>

                {/* Grid of cards */}
                {sortedSessions.length === 0 ? (
                    <p className={muted}>No sessions added yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sortedSessions.map((session) => (
                            <article
                                key={session.id}
                                className={`transition-colors duration-200 p-4 rounded-xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                    }`}
                            >
                                <div className="mb-2">
                                    <h3 className="font-semibold">{session.trainer}</h3>
                                    <p className={`text-sm ${muted}`}>{session.type}</p>
                                </div>
                                <p className="text-sm">
                                    {session.date} • {session.time}{" "}
                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${statusClass(session.status)}`}>
                                        {session.status}
                                    </span>
                                </p>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        className="bg-red-600 hover:bg-red-500 text-white font-medium py-1 px-3 rounded-lg"
                                        onClick={() => DeleteSession(session.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TrainerSessions;
