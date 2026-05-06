// src/pages/User/userWorkoutDetail.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import workouts from "../../data/workout.json";
import {
    FaArrowLeft,
    FaClock,
    FaFire,
    FaHeartbeat,
    FaDumbbell,
    FaRunning,
    FaPlay,
    FaStop,
    FaCheckCircle,
    FaTimesCircle,
} from "react-icons/fa";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";

const UserWorkoutDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const allWorkouts = Object.values(workouts).flat();
    const selectedWorkout = allWorkouts.find((w) => w.id === parseInt(id));

    // States for timer and feedback
    const [active, setActive] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Timer effect
    useEffect(() => {
        let interval;
        if (active && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [active, startTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // Equipment mapping
    const getEquipmentForWorkout = (workout) => {
        const baseEquipment = ["Water Bottle", "Exercise Mat"];
        if (workout.id <= 10) {
            if (workout.name.includes("Jump Rope")) return [...baseEquipment, "Jump Rope"];
            if (workout.name.includes("Sprint")) return [...baseEquipment, "Running Shoes"];
            return baseEquipment;
        }
        if (workout.id <= 20) {
            if (workout.name.includes("Pull") || workout.name.includes("Chin"))
                return [...baseEquipment, "Pull-up Bar"];
            if (workout.name.includes("Deadlift") || workout.name.includes("Rows"))
                return [...baseEquipment, "Barbell", "Weight Plates"];
            if (workout.name.includes("Lat Pulldown") || workout.name.includes("Seated Rows"))
                return [...baseEquipment, "Cable Machine"];
            return [...baseEquipment, "Dumbbells"];
        }
        if (workout.id <= 30) {
            if (workout.name.includes("Bench Press") || workout.name.includes("Incline"))
                return [...baseEquipment, "Bench", "Barbell", "Weight Plates"];
            if (workout.name.includes("Cable Crossover"))
                return [...baseEquipment, "Cable Machine"];
            if (workout.name.includes("Pec Deck"))
                return [...baseEquipment, "Pec Deck Machine"];
            return [...baseEquipment, "Dumbbells"];
        }
        if (workout.id <= 40) {
            if (
                workout.name.includes("Leg Press") ||
                workout.name.includes("Extensions") ||
                workout.name.includes("Curls")
            )
                return [...baseEquipment, "Leg Machine"];
            if (workout.name.includes("Squat") && !workout.name.includes("Split"))
                return [...baseEquipment, "Barbell", "Weight Plates"];
            if (workout.name.includes("Calf Raises"))
                return [...baseEquipment, "Step Platform"];
            return baseEquipment;
        }
        if (workout.id <= 60) {
            if (workout.name.includes("Cable")) return [...baseEquipment, "Cable Machine"];
            if (workout.name.includes("Preacher")) return [...baseEquipment, "Preacher Bench"];
            return [...baseEquipment, "Dumbbells"];
        }
        return baseEquipment;
    };

    if (!selectedWorkout) {
        return (
            <div
                className={`${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"
                    } p-6 min-h-screen flex flex-col items-center justify-center`}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                        } rounded-2xl shadow-xl p-8 max-w-md w-full text-center`}
                >
                    <button
                        className="mb-6 text-blue-500 hover:text-blue-700 flex items-center gap-2 font-medium"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft /> Back to workouts
                    </button>
                    <p>Workout not found!</p>
                </motion.div>
            </div>
        );
    }

    const workoutMetrics = {
        duration: `${Math.floor(Math.random() * 30) + 20} mins`,
        calories: Math.floor(Math.random() * 300) + 150,
        intensity: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
    };

    const equipmentNeeded = getEquipmentForWorkout(selectedWorkout);

    // Start workout
    const handleStart = () => {
        setActive(true);
        setStartTime(Date.now());
        setElapsedTime(0);
    };

    // Stop workout and log
    const handleStop = async () => {
        if (!active || !startTime) return;
        const elapsedMinutes = Math.round(elapsedTime / 60);

        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");

            await axios.post(
                "http://localhost:4000/api/workouts/complete",
                {
                    workoutId: selectedWorkout.id,
                    workoutName: selectedWorkout.name,
                    category: selectedWorkout.category || "Uncategorized",
                    duration: `${elapsedMinutes} mins`,
                    calories: workoutMetrics.calories,
                    intensity: workoutMetrics.intensity,
                    countsTowardGoal: false, // 👈 exclude from goal %
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMsg("✅ Workout logged to Recent Activity!");
            setErrorMsg("");
            setActive(false);
            setStartTime(null);
            setElapsedTime(0);
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("❌ Error logging workout:", err);
            setErrorMsg("❌ Failed to log workout. Try again.");
            setSuccessMsg("");
            setTimeout(() => setErrorMsg(""), 3000);
        }
    };

    return (
        <div
            className={`transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-50"
                } p-4 md:p-6 min-h-screen`}
        >
            {/* ✅ Success/Error Messages */}
            {successMsg && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg shadow">
                    <FaCheckCircle /> {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg shadow">
                    <FaTimesCircle /> {errorMsg}
                </div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center mb-2"
            >
                <button
                    className={`${darkMode
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-500 hover:text-blue-700"
                        } flex items-center gap-2 font-medium p-2 rounded-lg ${darkMode ? "hover:bg-gray-800" : "hover:bg-blue-50"
                        }`}
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft className="text-lg" /> Back
                </button>
            </motion.div>

            {/* Workout Card */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`w-4/12 ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                    } rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto`}
            >
                <div
                    className="h-3 w-full"
                    style={{ backgroundColor: selectedWorkout.color }}
                ></div>

                <div className="p-6 md:p-8">
                    {/* Title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.2,
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                            }}
                            className="w-28 h-28 mb-5 rounded-2xl flex items-center justify-center text-4xl text-white shadow-lg relative"
                            style={{ backgroundColor: selectedWorkout.color }}
                        >
                            {selectedWorkout.icon}
                            <div className="absolute -inset-2 bg-current opacity-20 blur-lg rounded-full"></div>
                        </motion.div>
                        <h1 className="text-3xl font-bold mb-2">{selectedWorkout.name}</h1>
                        <p
                            className={`${darkMode ? "text-gray-400" : "text-gray-600"
                                } max-w-md`}
                        >
                            {selectedWorkout.description}
                        </p>
                    </div>

                    {/* Timer + Control */}
                    <div className="flex flex-col items-center mb-6">
                        {active && (
                            <div className="mb-3 text-lg font-semibold flex items-center gap-2 text-blue-500">
                                <FaClock /> {formatTime(elapsedTime)}
                            </div>
                        )}
                        {active ? (
                            <button
                                onClick={handleStop}
                                className="px-6 py-3 bg-red-500 text-white rounded-lg flex items-center gap-2"
                            >
                                <FaStop /> Stop & Complete
                            </button>
                        ) : (
                            <button
                                onClick={handleStart}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg flex items-center gap-2"
                            >
                                <FaPlay /> Start Workout
                            </button>
                        )}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div
                            className={`${darkMode ? "bg-gray-700" : "bg-gray-50"
                                } rounded-xl p-4 text-center`}
                        >
                            <FaClock className="text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="font-semibold">{workoutMetrics.duration}</p>
                        </div>
                        <div
                            className={`${darkMode ? "bg-gray-700" : "bg-gray-50"
                                } rounded-xl p-4 text-center`}
                        >
                            <FaFire className="text-red-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Calories</p>
                            <p className="font-semibold">{workoutMetrics.calories}</p>
                        </div>
                        <div
                            className={`${darkMode ? "bg-gray-700" : "bg-gray-50"
                                } rounded-xl p-4 text-center`}
                        >
                            <FaHeartbeat className="text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Intensity</p>
                            <p className="font-semibold">{workoutMetrics.intensity}</p>
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="mb-6">
                        <h3
                            className={`text-xl font-semibold mb-4 pb-2 border-b ${darkMode ? "border-gray-700" : "border-gray-200"
                                } flex items-center gap-2`}
                        >
                            <FaDumbbell className="text-blue-500" /> Equipment Needed
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {equipmentNeeded.map((item, index) => (
                                <span
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-sm ${darkMode
                                        ? "bg-gray-700 text-gray-300"
                                        : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="mb-6">
                        <h3
                            className={`text-xl font-semibold mb-4 pb-2 border-b ${darkMode ? "border-gray-700" : "border-gray-200"
                                } flex items-center gap-2`}
                        >
                            <FaRunning className="text-blue-500" /> Exercise Steps
                        </h3>
                        <ol className="space-y-3">
                            {selectedWorkout.steps.map((step, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                    className={`${darkMode
                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                        : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                                        } flex items-start p-4 rounded-xl transition-all duration-300`}
                                >
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full mr-3 mt-1">
                                        {index + 1}
                                    </span>
                                    <span>{step}</span>
                                </motion.li>
                            ))}
                        </ol>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserWorkoutDetail;
