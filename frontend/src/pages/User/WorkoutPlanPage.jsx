import React, { useEffect, useMemo, useState } from "react";
import {
    Crown,
    Sparkles,
    Dumbbell,
    Clock3,
    Target,
    ShieldAlert,
    Lock,
    ListChecks,
    Lightbulb,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const WorkoutPlanPage = () => {
    const { darkMode } = useTheme();

    const [statusLoading, setStatusLoading] = useState(true);
    const [generateLoading, setGenerateLoading] = useState(false);

    const [statusData, setStatusData] = useState({
        isMembershipUser: false,
        usedToday: 0,
        freeDailyLimit: 2,
        remaining: 2,
        membershipExpiresAt: null,
    });

    const [formData, setFormData] = useState({
        goal: "muscle_gain",
        bodyPart: "chest",
        level: "beginner",
        duration: 30,
        equipment: "dumbbell",
    });

    const [plan, setPlan] = useState(null);
    const [error, setError] = useState("");
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const token = localStorage.getItem("token");

    const pageBg = darkMode
        ? "min-h-screen bg-gray-900 text-white transition-colors duration-200"
        : "min-h-screen bg-gray-100 text-gray-900 transition-colors duration-200";

    const glassCard = darkMode
        ? "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
        : "rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

    const inputClass = darkMode
        ? "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black outline-none transition-colors duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        : "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";

    const labelClass = darkMode
        ? "mb-2 block text-sm font-medium text-gray-300"
        : "mb-2 block text-sm font-medium text-gray-700";

    const subtleText = darkMode ? "text-gray-300" : "text-gray-600";
    const titleText = darkMode ? "text-white" : "text-gray-900";

    const progressPercent = useMemo(() => {
        if (statusData?.isMembershipUser) return 100;

        const limit = Number(statusData?.freeDailyLimit || 0);
        const used = Number(statusData?.usedToday || 0);

        if (!limit) return 0;

        return Math.min((used / limit) * 100, 100);
    }, [statusData]);

    const fetchStatus = async () => {
        try {
            setStatusLoading(true);
            setError("");

            const response = await fetch(`${API_BASE}/api/workout-plans/status`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to load status");
            }

            setStatusData(data);
        } catch (err) {
            setError(err.message || "Something went wrong while loading status.");
        } finally {
            setStatusLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "duration" ? Number(value) : value,
        }));
    };

    const handleGeneratePlan = async (e) => {
        e.preventDefault();

        try {
            setGenerateLoading(true);
            setError("");

            const response = await fetch(`${API_BASE}/api/workout-plans/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.status === 403) {
                setShowUpgradeModal(true);

                setStatusData((prev) => ({
                    ...prev,
                    remaining: 0,
                }));

                throw new Error(
                    data?.message || "Limit reached. Upgrade to membership."
                );
            }

            if (!response.ok) {
                throw new Error(data?.message || "Failed to generate plan");
            }

            setPlan(data.plan);

            setStatusData((prev) => ({
                ...prev,
                isMembershipUser: data.isMembershipUser,
                usedToday: data.usedToday,
                freeDailyLimit: data.freeDailyLimit,
                remaining: data.remaining,
                membershipExpiresAt: data.membershipExpiresAt,
            }));
        } catch (err) {
            setError(err.message || "Could not generate workout plan.");
        } finally {
            setGenerateLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <div className={pageBg}>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400">
                            <Sparkles className="h-4 w-4" />
                            Premium Workout Generator
                        </div>

                        <h1 className={`text-3xl font-bold tracking-tight ${titleText}`}>
                            Custom Workout Plan Generator
                        </h1>

                        <p className={`mt-2 max-w-2xl text-sm sm:text-base ${subtleText}`}>
                            Generate structured gym workout plans based on goal, body part,
                            level, duration, and equipment. Free users get limited daily use.
                            Membership users get unlimited access.
                        </p>
                    </div>

                    <div
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold ${
                            statusData?.isMembershipUser
                                ? "border border-emerald-400/20 bg-emerald-500/15 text-emerald-400"
                                : "border border-amber-400/20 bg-amber-500/15 text-amber-400"
                        }`}
                    >
                        <Crown className="h-5 w-5" />
                        {statusData?.isMembershipUser ? "Membership Active" : "Free Access"}
                    </div>
                </div>

                {error ? (
                    <div
                        className={`mb-6 rounded-2xl border px-4 py-3 ${
                            darkMode
                                ? "border-red-500/30 bg-red-500/10 text-red-300"
                                : "border-red-200 bg-red-50 text-red-700"
                        }`}
                    >
                        {error}
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-1">
                        <div className={`${glassCard} p-6`}>
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-400">
                                    <Target className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className={`text-lg font-semibold ${titleText}`}>
                                        Usage Status
                                    </h2>
                                    <p className={`text-sm ${subtleText}`}>
                                        Daily feature access summary
                                    </p>
                                </div>
                            </div>

                            {statusLoading ? (
                                <p className={subtleText}>Loading status...</p>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className={subtleText}>Used Today</span>

                                        <span className="font-semibold">
                                            {statusData?.isMembershipUser
                                                ? `${statusData?.usedToday} / Unlimited`
                                                : `${statusData?.usedToday} / ${statusData?.freeDailyLimit}`}
                                        </span>
                                    </div>

                                    <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>

                                    <div className="mb-6 flex items-center justify-between text-sm">
                                        <span className={subtleText}>Remaining</span>

                                        <span className="font-medium">
                                            {String(statusData?.remaining)}
                                        </span>
                                    </div>

                                    <div
                                        className={`rounded-2xl border p-4 ${
                                            darkMode
                                                ? "border-white/10 bg-white/5"
                                                : "border-gray-200 bg-gray-50"
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            {statusData?.isMembershipUser ? (
                                                <Crown className="h-4 w-4 text-emerald-400" />
                                            ) : (
                                                <Lock className="h-4 w-4 text-amber-400" />
                                            )}

                                            <p className="font-semibold">
                                                {statusData?.isMembershipUser
                                                    ? "Unlimited Plan Access"
                                                    : "Free Tier Access"}
                                            </p>
                                        </div>

                                        <p className={`text-sm ${subtleText}`}>
                                            {statusData?.isMembershipUser
                                                ? "Your membership is active. You can generate unlimited workout plans."
                                                : "You are on the free tier. Upgrade to membership for unlimited workout plan generation."}
                                        </p>
                                    </div>

                                    {!statusData?.isMembershipUser ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowUpgradeModal(true)}
                                            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white transition hover:scale-[1.01]"
                                        >
                                            Upgrade to Membership
                                        </button>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-2">
                        <div className={`${glassCard} p-6`}>
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-2xl bg-pink-500/15 p-3 text-pink-400">
                                    <Dumbbell className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className={`text-lg font-semibold ${titleText}`}>
                                        Generate Your Plan
                                    </h2>

                                    <p className={`text-sm ${subtleText}`}>
                                        Create a personalized gym workout in seconds
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleGeneratePlan}
                                className="grid grid-cols-1 gap-5 md:grid-cols-2"
                            >
                                <div>
                                    <label className={labelClass}>Goal</label>

                                    <select
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="muscle_gain">Muscle Gain</option>
                                        <option value="fat_loss">Fat Loss</option>
                                        <option value="strength">Strength</option>
                                        <option value="general_fitness">General Fitness</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Body Part</label>

                                    <select
                                        name="bodyPart"
                                        value={formData.bodyPart}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="chest">Chest</option>
                                        <option value="back">Back</option>
                                        <option value="legs">Legs</option>
                                        <option value="shoulders">Shoulders</option>
                                        <option value="arms">Arms</option>
                                        <option value="core">Core</option>
                                        <option value="full_body">Full Body</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Level</label>

                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Duration (minutes)</label>

                                    <select
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value={20}>20</option>
                                        <option value={30}>30</option>
                                        <option value={45}>45</option>
                                        <option value={60}>60</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Equipment</label>

                                    <select
                                        name="equipment"
                                        value={formData.equipment}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="dumbbell">Dumbbell</option>
                                        <option value="barbell">Barbell</option>
                                        <option value="machine">Machine</option>
                                        <option value="bodyweight">Bodyweight</option>
                                        <option value="gym">Full Gym</option>
                                    </select>
                                </div>

                                <div className="pt-2 md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={generateLoading}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3.5 font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {generateLoading ? (
                                            <>
                                                <Clock3 className="h-5 w-5 animate-spin" />
                                                Generating Plan...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                Generate Workout Plan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {plan ? (
                            <div className={`${glassCard} mt-6 p-6`}>
                                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${titleText}`}>
                                            {plan.title}
                                        </h3>

                                        <p className={`mt-2 text-sm ${subtleText}`}>
                                            Goal:{" "}
                                            <span className="font-medium">{plan.goal}</span> •
                                            Level:{" "}
                                            <span className="font-medium">{plan.level}</span> •
                                            Duration:{" "}
                                            <span className="font-medium">
                                                {plan.duration} mins
                                            </span>
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400">
                                        Equipment: {plan.equipment}
                                    </div>
                                </div>

                                <div
                                    className={`mb-5 rounded-2xl border p-4 ${
                                        darkMode
                                            ? "border-indigo-400/20 bg-indigo-500/10"
                                            : "border-indigo-200 bg-indigo-50"
                                    }`}
                                >
                                    <p className="font-semibold text-indigo-400">
                                        Trainer Note
                                    </p>

                                    <p className={`mt-1 text-sm ${subtleText}`}>
                                        {plan.note}
                                    </p>
                                </div>

                                <div className="space-y-5">
                                    {plan.exercises?.map((exercise, index) => (
                                        <div
                                            key={`${exercise.name}-${index}`}
                                            className={`rounded-2xl border p-5 ${
                                                darkMode
                                                    ? "border-white/10 bg-white/5"
                                                    : "border-gray-200 bg-white"
                                            }`}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h4 className={`text-lg font-semibold ${titleText}`}>
                                                        {index + 1}. {exercise.name}
                                                    </h4>

                                                    <p className={`mt-1 text-sm ${subtleText}`}>
                                                        Sets: {exercise.sets} • Reps: {exercise.reps}
                                                    </p>
                                                </div>

                                                <div className="w-fit rounded-xl bg-pink-500/10 px-3 py-1.5 text-sm font-medium text-pink-400">
                                                    Rest: {exercise.rest}
                                                </div>
                                            </div>

                                            {exercise.steps && exercise.steps.length > 0 ? (
                                                <div
                                                    className={`mt-5 rounded-2xl border p-4 ${
                                                        darkMode
                                                            ? "border-indigo-400/20 bg-indigo-500/10"
                                                            : "border-indigo-200 bg-indigo-50"
                                                    }`}
                                                >
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <ListChecks className="h-4 w-4 text-indigo-400" />

                                                        <h5 className="font-semibold text-indigo-400">
                                                            How to perform this exercise
                                                        </h5>
                                                    </div>

                                                    <ol
                                                        className={`list-decimal space-y-2 pl-5 text-sm leading-relaxed ${
                                                            darkMode
                                                                ? "text-gray-300"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {exercise.steps.map((step, stepIndex) => (
                                                            <li
                                                                key={`${exercise.name}-step-${stepIndex}`}
                                                            >
                                                                {step}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`mt-5 rounded-2xl border p-4 ${
                                                        darkMode
                                                            ? "border-yellow-400/20 bg-yellow-500/10"
                                                            : "border-yellow-200 bg-yellow-50"
                                                    }`}
                                                >
                                                    <p
                                                        className={`text-sm ${
                                                            darkMode
                                                                ? "text-yellow-200"
                                                                : "text-yellow-700"
                                                        }`}
                                                    >
                                                        No detailed steps were provided for this exercise.
                                                    </p>
                                                </div>
                                            )}

                                            {exercise.tips && exercise.tips.length > 0 ? (
                                                <div
                                                    className={`mt-4 rounded-2xl border p-4 ${
                                                        darkMode
                                                            ? "border-emerald-400/20 bg-emerald-500/10"
                                                            : "border-emerald-200 bg-emerald-50"
                                                    }`}
                                                >
                                                    <div className="mb-3 flex items-center gap-2">
                                                        <Lightbulb className="h-4 w-4 text-emerald-400" />

                                                        <h5 className="font-semibold text-emerald-400">
                                                            Form tips
                                                        </h5>
                                                    </div>

                                                    <ul
                                                        className={`list-disc space-y-2 pl-5 text-sm leading-relaxed ${
                                                            darkMode
                                                                ? "text-gray-300"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {exercise.tips.map((tip, tipIndex) => (
                                                            <li key={`${exercise.name}-tip-${tipIndex}`}>
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {showUpgradeModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div
                        className={`w-full max-w-md rounded-3xl border p-6 ${
                            darkMode
                                ? "border-white/10 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-900"
                        }`}
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-400">
                                <ShieldAlert className="h-6 w-6" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">Upgrade Required</h3>

                                <p className={`text-sm ${subtleText}`}>
                                    Unlock unlimited workout plan generation
                                </p>
                            </div>
                        </div>

                        <div
                            className={`rounded-2xl border p-4 ${
                                darkMode
                                    ? "border-white/10 bg-white/5"
                                    : "border-gray-200 bg-gray-50"
                            }`}
                        >
                            <ul className={`space-y-2 text-sm ${subtleText}`}>
                                <li>• Unlimited custom workout plans</li>
                                <li>• No daily usage restriction</li>
                                <li>• Better premium experience for active gym members</li>
                            </ul>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowUpgradeModal(false)}
                                className={`flex-1 rounded-2xl border px-4 py-3 font-medium ${
                                    darkMode
                                        ? "border-white/10 bg-white/5 text-white"
                                        : "border-gray-200 bg-white text-gray-900"
                                }`}
                            >
                                Maybe Later
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowUpgradeModal(false);
                                    window.location.href = "/userClasses";
                                }}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white"
                            >
                                Get Membership
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default WorkoutPlanPage;