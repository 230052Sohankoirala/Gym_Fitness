// src/pages/User/InfoUser/UserInfo.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const UserInfo = () => {
  const [weight, setWeight] = useState(60);
  const [age, setAge] = useState(20);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const genders = ["Male", "Female", "Other"];

  const handleSubmit = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await axios.put(
        `${API_BASE}/api/users/me`,
        { weight, age, height, gender },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/userGoal"); // go to goals page
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user info");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-lg"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-3xl"></div>

        <h2 className="text-2xl sm:text-3xl font-bold text-center mt-4 mb-2 text-gray-800">
          Tell Us About You
        </h2>
        <p className="text-center text-gray-500 mb-6 sm:mb-8">
          Help us personalize your experience
        </p>

        {error && (
          <p className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 mb-4 rounded-lg text-sm">
            {error}
          </p>
        )}

        {/* Weight */}
        <motion.div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 font-medium">Weight</label>
            <span className="text-lg font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {weight} kg
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="150"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-purple-500"
          />
        </motion.div>

        {/* Age */}
        <motion.div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 font-medium">Age</label>
            <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {age} years
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-500"
          />
        </motion.div>

        {/* Height */}
        <motion.div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 font-medium">Height</label>
            <span className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {height} cm
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="220"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-indigo-500"
          />
        </motion.div>

        {/* Gender */}
        <motion.div className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
          <label className="block text-gray-700 font-medium mb-4">Gender</label>
          <div className="flex gap-3 justify-between">
            {genders.map((g) => (
              <motion.button
                key={g}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGender(g)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                  gender === g
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300"
                }`}
              >
                {g}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-md mt-2"
        >
          Save & Continue →
        </motion.button>
      </motion.div>
    </div>
  );
};

export default UserInfo;
