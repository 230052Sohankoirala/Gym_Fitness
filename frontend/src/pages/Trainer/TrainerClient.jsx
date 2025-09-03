// src/pages/trainer/TrainerClient.jsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars

const clients = [
    { name: "Suvam Parajuli", email: "suvam@example.com", enroll: "Strength Training", MemberShip: "Gold", weight: "80kg", height: "1.8m", bmi: "24.5" },
    { name: "Adarsh Sapkota", email: "adarsh@example.com", enroll: "HIIT", MemberShip: "Silver", weight: "70kg", height: "1.6m", bmi: "22.5" },
    { name: "Shrabhya Paudel", email: "shrabhya@example.com", enroll: "Mobility", MemberShip: "Gold", weight: "60kg", height: "1.5m", bmi: "20.5" },
    { name: "Sohan Koirala", email: "sohan@example.com", enroll: "Hypertrophy", MemberShip: "Normal", weight: "90kg", height: "1.9m", bmi: "25.5" },
];

export default function TrainerClient() {
    const { darkMode } = useTheme();

    const baseBg = darkMode ? "bg-gray-900" : "bg-gray-100";
    const cardBg = darkMode ? "bg-gray-800" : "bg-white";
    const text = darkMode ? "text-gray-100" : "text-gray-900";
    const border = darkMode ? "border-gray-700" : "border-gray-200";
    const muted = darkMode ? "text-gray-400" : "text-gray-600";

    const getBadgeColor = (type) => {
        switch (type) {
            case "Gold":
                return "bg-yellow-100 text-yellow-700";
            case "Silver":
                return "bg-gray-200 text-gray-700";
            case "Normal":
                return "bg-indigo-100 text-indigo-700";
            default:
                return "bg-gray-200 text-gray-600";
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className={`min-h-screen ${baseBg} ${text} transition-colors duration-200`}>
                <main className="mx-auto max-w-5xl p-6">
                    <h1 className="mb-6 text-3xl font-bold">Clients</h1>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {clients.map((c, i) => (
                            <div
                                key={i}
                                className={`rounded-xl border ${border} ${cardBg} p-5 shadow-sm hover:shadow-md transition`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold">{c.name}</h2>
                                    <span
                                        className={`px-3 py-1 text-xs rounded-full font-medium ${getBadgeColor(
                                            c.MemberShip
                                        )}`}
                                    >
                                        {c.MemberShip}
                                    </span>
                                </div>
                                <p className={`text-sm ${muted}`}>{c.email}</p>
                                <div className="mt-3 space-y-1 text-sm">
                                    <p><span className="font-medium">Enrolled:</span> {c.enroll}</p>
                                    <p><span className="font-medium">Weight:</span> {c.weight}</p>
                                    <p><span className="font-medium">Height:</span> {c.height}</p>
                                    <p><span className="font-medium">BMI:</span> {c.bmi}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                                        View Profile
                                    </button>
                                    <button className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </motion.div>
    );
}
