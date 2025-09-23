import React, { useState } from "react";
import { Trash2, Dumbbell, Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * AdminTrainerList Component
 * Displays and manages trainers with add/remove functionality.
 * Dark/Light mode matches AdminHomepage.
 */
const AdminTrainerList = () => {
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    const [trainers, setTrainers] = useState([
        { id: 1, name: "Ramesh Thapa", email: "ramesh@example.com", type: "Yoga" },
        { id: 2, name: "Sita Koirala", email: "sita@example.com", type: "Weight Lifting" },
        { id: 3, name: "Bikash Lama", email: "bikash@example.com", type: "Diet" },
    ]);

    const [form, setForm] = useState({ name: "", email: "", type: "Yoga" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!form.name || !form.email) return;
        setTrainers((prev) => [...prev, { id: Date.now(), ...form }]);
        setForm({ name: "", email: "", type: "Yoga" });
    };

    const handleRemove = (id) => {
        setTrainers((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div
            className={`min-h-screen p-6 transition-colors duration-200 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                }`}
        >
            <h1 className="text-2xl font-bold mb-6">Admin – Trainer List</h1>

            {/* ➕ Add Trainer Form */}
            <form
                onSubmit={handleAdd}
                className={`shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"
                    }`}
            >
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Trainer Name"
                    className={`flex-1 p-2 border rounded-md transition-colors duration-200 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300 text-gray-800"
                        }`}
                />
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Trainer Email"
                    className={`flex-1 p-2 border rounded-md transition-colors duration-200 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300 text-gray-800"
                        }`}
                />
                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={`flex-1 p-2 border rounded-md transition-colors duration-200 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                        }`}
                >
                    <option value="Yoga">Yoga</option>
                    <option value="Weight Lifting">Weight Lifting</option>
                    <option value="Diet">Diet</option>
                    <option value="Cardio">Cardio</option>
                    <option value="CrossFit">CrossFit</option>
                </select>
                <button
                    type="submit"
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Trainer
                </button>
            </form>

            {/* 📋 Trainer List */}
            <div
                className={`shadow-md rounded-lg divide-y transition-colors duration-200 ${darkMode
                        ? "bg-gray-800 divide-gray-700"
                        : "bg-white divide-gray-200"
                    }`}
            >
                {trainers.length > 0 ? (
                    trainers.map((trainer) => (
                        <div
                            key={trainer.id}
                            className={`flex items-center justify-between p-4 transition-colors duration-200 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <Dumbbell className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                                <div>
                                    <p className="font-medium">{trainer.name}</p>
                                    <p className="text-sm opacity-75">
                                        {trainer.email} – <span className="font-semibold">{trainer.type}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRemove(trainer.id)}
                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                            >
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center opacity-75">No trainers found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminTrainerList;
