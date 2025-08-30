import React, { useState } from "react";
import { motion } from "framer-motion"; //eslint-disable-line no-unused-vars
import { Link } from "react-router-dom";

const UserInfo = () => {
  const [weight, setWeight] = useState(60);
  const [age, setAge] = useState(20);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState("");

  const genders = ["Male", "Female", "Other"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 sm:p-6">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-black"
      >
        <Link to="/register">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </motion.button>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-lg"
      >
        {/* Decorative header */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-3xl"></div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center mt-4 mb-2 text-gray-800">
          Tell Us About You
        </h2>
        <p className="text-center text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Help us personalize your experience
        </p>

        {/* Weight */}
        <motion.div whileHover={{ scale: 1.01 }} className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 font-medium">Weight</label>
            <span className="text-lg font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{weight} kg</span>
          </div>
          <input
            type="range"
            min="30"
            max="150"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>30kg</span>
            <span>150kg</span>
          </div>
        </motion.div>

        {/* Age */}
        <motion.div whileHover={{ scale: 1.01 }} className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 font-medium">Age</label>
            <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{age} years</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10</span>
            <span>100</span>
          </div>
        </motion.div>

        {/* Height */}
        <motion.div whileHover={{ scale: 1.01 }} className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-700 font-medium">Height</label>
            <span className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{height} cm</span>
          </div>
          <input
            type="range"
            min="100"
            max="220"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>100cm</span>
            <span>220cm</span>
          </div>
        </motion.div>

        {/* Gender */}
        <motion.div whileHover={{ scale: 1.01 }} className="mb-6 sm:mb-8 p-4 bg-gray-50 rounded-xl">
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
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 25px -5px rgba(128, 90, 213, 0.5)",
          }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-md mt-2 flex items-center justify-center gap-2"
        >
          <Link to="/userGoal">Set Up Your Goals</Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default UserInfo;
