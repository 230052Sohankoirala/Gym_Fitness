// src/pages/User/InfoUser/UserGoal.jsx
import React, { useState } from "react";
import { FaArrowLeft, FaCheck, FaRunning, FaDumbbell, FaHeartbeat, FaYinYang, FaFistRaised } from "react-icons/fa";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserGoal = () => {
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [error, setError] = useState("");

  const goals = [
    { id: "Lose Weight", title: "Lose Weight", icon: <FaRunning /> },
    { id: "Build Muscle", title: "Build Muscle", icon: <FaDumbbell /> },
    { id: "Improve Cardio", title: "Improve Cardio", icon: <FaHeartbeat /> },
    { id: "Improve Flexibility", title: "Improve Flexibility", icon: <FaYinYang /> },
    { id: "Improve Strength", title: "Improve Strength", icon: <FaFistRaised /> },
  ];

  const toggleGoal = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) return;
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        "http://localhost:4000/api/users/me",
        { goals: selectedGoals },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/home"); // go to dashboard after saving
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save goals");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="w-full max-w-lg">
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 font-medium"
        >
          <FaArrowLeft /> Back
        </motion.button>

        <motion.div className="bg-white shadow-2xl rounded-3xl p-8 relative">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Your Fitness Goals
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Select one or more:
          </p>

          {error && (
            <p className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 mb-4 rounded-lg text-sm">
              {error}
            </p>
          )}

          {/* Goal cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => toggleGoal(goal.id)}
                className={`text-black p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center ${
                  selectedGoals.includes(goal.id)
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-blue-500 border-blue-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">{goal.icon}</div>
                  <span className="font-medium">{goal.title}</span>
                </div>
                {selectedGoals.includes(goal.id) && (
                  <FaCheck className="text-green-400" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Continue button */}
          <motion.button
            whileHover={{ scale: selectedGoals.length > 0 ? 1.02 : 1 }}
            whileTap={{ scale: selectedGoals.length > 0 ? 0.98 : 1 }}
            onClick={handleContinue}
            disabled={selectedGoals.length === 0}
            className={`w-full py-3 rounded-xl font-semibold text-lg ${
              selectedGoals.length > 0
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Save & Continue →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default UserGoal;
