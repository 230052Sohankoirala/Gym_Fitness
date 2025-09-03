import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaClock, FaRunning } from "react-icons/fa";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { useTheme } from "../../context/ThemeContext";
import workoutData from "../../data/workoutplans.json";

const UserPlanCard = () => {
  const { category } = useParams(); // ✅ param is category
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Get exercises for this category
  const exercises = workoutData.workoutPlans[category];

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
      className={`transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } p-4 md:p-6 min-h-screen`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-4"
      >
        <button
          className={`${
            darkMode
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-500 hover:text-blue-700"
          } flex items-center gap-2 font-medium p-2 rounded-lg ${
            darkMode ? "hover:bg-gray-800" : "hover:bg-blue-50"
          }`}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back
        </button>
      </motion.div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 text-center">{category}</h1>

      {/* Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-xl p-6 shadow-md ${
              darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
            }`}
          >
            {/* Icon + name */}
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg mb-3 text-2xl"
              style={{ backgroundColor: exercise.color }}
            >
              {exercise.icon}
            </div>
            <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>
            <p
              className={`mb-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {exercise.description}
            </p>
            <p className="text-sm font-medium text-blue-500 flex items-center gap-2">
              <FaClock /> {exercise.duration}
            </p>

            {/* Steps */}
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
