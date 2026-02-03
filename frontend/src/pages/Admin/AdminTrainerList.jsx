import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, Dumbbell, Plus, RefreshCw, UserPlus, AlertTriangle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";

const AdminTrainerList = () => {
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    // ----------------------------
    // Config
    // ----------------------------
    const token = useMemo(() => localStorage.getItem("token"), []);
    const api = useMemo(() => {
        return axios.create({
            baseURL: "http://localhost:4000/api",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }, [token]);

    // ----------------------------
    // State
    // ----------------------------
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        speciality: "Yoga",
        experience: "",
        bio: "",
        rating: "",
    });

    // ----------------------------
    // Helpers
    // ----------------------------
    const resetForm = useCallback(() => {
        setForm({
            name: "",
            email: "",
            password: "",
            speciality: "Yoga",
            experience: "",
            bio: "",
            rating: "",
        });
    }, []);

    const fetchTrainers = useCallback(async () => {
        try {
            setErrorMsg("");
            setLoading(true);

            // ✅ correct admin endpoint
            const res = await api.get("/admin/trainers");
            setTrainers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch trainers:", err?.response?.data || err?.message);
            setErrorMsg(err?.response?.data?.message || "Failed to fetch trainers");
        } finally {
            setLoading(false);
        }
    }, [api]);

    // ----------------------------
    // Effects
    // ----------------------------
    useEffect(() => {
        fetchTrainers();
    }, [fetchTrainers]);

    // ----------------------------
    // Form handlers
    // ----------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        // light cleanup
        if (name === "rating") {
            setForm((prev) => ({ ...prev, [name]: value }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ----------------------------
    // Create trainer
    // ----------------------------
    const handleAdd = async (e) => {
        e.preventDefault();

        setErrorMsg("");

        if (!form.name?.trim() || !form.email?.trim() || !form.password?.trim()) {
            setErrorMsg("Name, email, and password are required.");
            return;
        }

        const ratingNumber =
            form.rating === "" ? undefined : Number(form.rating);

        if (ratingNumber !== undefined && (!Number.isFinite(ratingNumber) || ratingNumber < 0 || ratingNumber > 5)) {
            setErrorMsg("Rating must be a number between 0 and 5.");
            return;
        }

        try {
            setSubmitting(true);

            // ✅ correct admin endpoint
            const res = await api.post("/admin/trainers", {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                speciality: form.speciality,
                experience: form.experience,
                bio: form.bio,
                rating: ratingNumber,
            });

            // controller returns { trainer: {...} }
            const created = res?.data?.trainer;

            if (created) {
                setTrainers((prev) => [created, ...prev]);
                resetForm();
            } else {
                // fallback: refetch
                await fetchTrainers();
                resetForm();
            }
        } catch (err) {
            console.error("Add trainer failed:", err?.response?.data || err?.message);
            setErrorMsg(err?.response?.data?.message || "Add trainer failed");
        } finally {
            setSubmitting(false);
        }
    };

    // ----------------------------
    // Delete trainer
    // ----------------------------
    const handleRemove = async (id) => {
        setErrorMsg("");

        if (!id) return;

        const ok = window.confirm("Delete this trainer? This action cannot be undone.");
        if (!ok) return;

        try {
            // ✅ correct admin endpoint
            await api.delete(`/admin/trainers/${id}`);

            // remove from UI
            setTrainers((prev) => prev.filter((t) => (t._id || t.id) !== id));
        } catch (err) {
            console.error("Delete trainer failed:", err?.response?.data || err?.message);
            setErrorMsg(err?.response?.data?.message || "Delete trainer failed");
        }
    };

    // ----------------------------
    // UI classes
    // ----------------------------
    const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
    const cardBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const inputBg = darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900";

    return (
        <div className={`min-h-screen p-6 transition-colors duration-200 ${pageBg}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Admin – Trainer Management</h1>
                        <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Create and manage trainers. Trainers must connect Stripe later to receive payouts.
                        </p>
                    </div>

                    <button
                        onClick={fetchTrainers}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${darkMode
                                ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                                : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Error banner */}
                {errorMsg && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${darkMode ? "bg-red-950/40 border-red-900 text-red-200" : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                        <AlertTriangle className="w-5 h-5 mt-0.5" />
                        <div className="text-sm font-medium">{errorMsg}</div>
                    </div>
                )}

                {/* Add Trainer Form */}
                <form
                    onSubmit={handleAdd}
                    className={`rounded-2xl border shadow-sm p-5 mb-8 ${cardBg}`}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <UserPlus className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Add New Trainer</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Trainer Name"
                            className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                        />

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Trainer Email"
                            className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                        />

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Temporary Password (min 6 chars)"
                            className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                        />

                        <select
                            name="speciality"
                            value={form.speciality}
                            onChange={handleChange}
                            className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                        >
                            <option value="Yoga">Yoga</option>
                            <option value="Weight Lifting">Weight Lifting</option>
                            <option value="Diet">Diet</option>
                            <option value="Cardio">Cardio</option>
                            <option value="CrossFit">CrossFit</option>
                        </select>

                        <input
                            type="text"
                            name="experience"
                            value={form.experience}
                            onChange={handleChange}
                            placeholder="Experience (e.g. 5 years)"
                            className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                        />

                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            name="rating"
                            value={form.rating}
                            onChange={handleChange}
                            placeholder="Rating (0–5)"
                            className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                        />

                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            placeholder="Trainer Bio"
                            rows={3}
                            className={`md:col-span-2 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold transition ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            <Plus className="w-5 h-5" />
                            {submitting ? "Adding..." : "Add Trainer"}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className={`px-4 py-3 rounded-xl border font-semibold transition ${darkMode
                                    ? "border-gray-700 bg-gray-900 hover:bg-gray-800"
                                    : "border-gray-300 bg-white hover:bg-gray-50"
                                }`}
                        >
                            Clear
                        </button>
                    </div>
                </form>

                {/* Trainer List */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}>
                    <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                        <h2 className="text-lg font-semibold">Trainers</h2>
                        <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {loading ? "Loading..." : `${trainers.length} trainer(s) found`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-6 text-sm opacity-80">Loading trainers...</div>
                    ) : trainers.length > 0 ? (
                        <div className={`${darkMode ? "divide-gray-700" : "divide-gray-200"} divide-y`}>
                            {trainers.map((trainer) => {
                                const id = trainer._id || trainer.id;

                                return (
                                    <div
                                        key={id}
                                        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 ${darkMode ? "hover:bg-gray-700/40" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-xl ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                                                <Dumbbell className={`w-6 h-6 ${darkMode ? "text-gray-200" : "text-gray-700"}`} />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-base">{trainer.name}</p>
                                                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                    {trainer.email} • <span className="font-medium">{trainer.speciality || "N/A"}</span>
                                                </p>
                                                <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    {trainer.experience || "No experience set"} • ⭐ {trainer.rating ?? "N/A"}
                                                </p>
                                                {trainer.bio ? (
                                                    <p className={`text-xs mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"} line-clamp-2`}>
                                                        {trainer.bio}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleRemove(id)}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition ${darkMode
                                                        ? "bg-red-950/40 hover:bg-red-950/70 border border-red-900 text-red-200"
                                                        : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-700"
                                                    }`}
                                                title="Delete trainer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-6 text-sm opacity-80 text-center">No trainers found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTrainerList;
