// src/pages/User/UserPlanCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaRunning,
  FaPlay,
  FaStop,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useTheme } from "../../context/ThemeContext";
import workoutData from "../../data/workoutplans.json";
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_BASE = `${API_ROOT}/api`;

const UserPlanCard = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const exercises = workoutData.workoutPlans[category];

  const [planActive, setPlanActive] = useState(false);
  const [planStartTime, setPlanStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let interval;

    if (planActive && planStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - planStartTime) / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [planActive, planStartTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStartPlan = () => {
    setPlanActive(true);
    setPlanStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleStopPlan = async () => {
    if (!planActive || !planStartTime) return;

    const elapsedMinutes = Math.round(elapsedTime / 60);

    const estimatedMinutes = exercises.reduce((acc, ex) => {
      const match = ex.duration.match(/\d+/);
      return acc + (match ? parseInt(match[0]) : 0);
    }, 0);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.post(
        `${API_BASE}/workouts/complete`,
        {
          workoutId: Date.now(),
          workoutName: `${category} Plan`,
          category,
          duration: `${elapsedMinutes} mins (est. ${estimatedMinutes} mins)`,
          countsTowardGoal: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMsg("✅ Workout plan logged successfully!");
      setErrorMsg("");
      setPlanActive(false);
      setPlanStartTime(null);
      setElapsedTime(0);

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("❌ Failed to log workout plan:", err);

      setErrorMsg("❌ Failed to log workout plan. Try again.");
      setSuccessMsg("");

      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  if (!exercises) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500">
          Workout category not found
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-500 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className={`transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-50"
        } p-4 md:p-6 min-h-screen`}
    >
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

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-4"
      >
        <button
          className={`${darkMode
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-500 hover:text-blue-700"
            } flex items-center gap-2 font-medium p-2 rounded-lg ${darkMode ? "hover:bg-gray-800" : "hover:bg-blue-50"
            }`}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back
        </button>
      </motion.div>

      <h1 className="text-3xl font-bold mb-6 text-center">{category}</h1>

      <div className="flex flex-col items-center mb-6">
        {planActive && (
          <div className="mb-3 text-lg font-semibold flex items-center gap-2 text-blue-500">
            <FaClock /> {formatTime(elapsedTime)}
          </div>
        )}

        {planActive ? (
          <button
            onClick={handleStopPlan}
            className="px-6 py-3 bg-red-500 text-white rounded-lg flex items-center gap-2"
          >
            <FaStop /> Stop & Complete Plan
          </button>
        ) : (
          <button
            onClick={handleStartPlan}
            className="px-6 py-3 bg-green-500 text-white rounded-lg flex items-center gap-2"
          >
            <FaPlay /> Start Plan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-6 shadow-md ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
              }`}
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg mb-3 text-2xl"
              style={{ backgroundColor: exercise.color }}
            >
              {exercise.icon}
            </div>

            <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>

            <p
              className={`mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
              {exercise.description}
            </p>

            <p className="text-sm font-medium text-blue-500 flex items-center gap-2">
              <FaClock /> {exercise.duration}
            </p>

            <h3 className="mt-3 font-semibold flex items-center gap-2">
              <FaRunning /> Steps
            </h3>

            <ul className="list-disc list-inside text-sm mt-1">
              {exercise.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UserPlanCard;