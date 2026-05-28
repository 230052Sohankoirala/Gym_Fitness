// src/pages/User/UserWorkout.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import workouts from "../../data/workout.json";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com"
const API_BASE = `${API_ROOT}/api`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
  },
};

const UserWorkout = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [userGoals, setUserGoals] = useState([]);
  const [goalWorkouts, setGoalWorkouts] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const { data } = await axios.get(`${API_BASE}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserGoals(data.goals || []);
      } catch (err) {
        console.error("Failed to fetch user goals:", err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (userGoals.length > 0) {
      const filtered = {};

      Object.keys(workouts).forEach((category) => {
        workouts[category].forEach((workout) => {
          if (workout.goals?.some((goal) => userGoals.includes(goal))) {
            if (!filtered[category]) {
              filtered[category] = [];
            }

            if (!filtered[category].some((item) => item.id === workout.id)) {
              filtered[category].push(workout);
            }
          }
        });
      });

      setGoalWorkouts(filtered);
    } else {
      setGoalWorkouts({});
    }
  }, [userGoals]);

  const handleCardClick = (workout) => {
    navigate(`/workout/${workout.id}`);
  };

  return (
    <div
      className={`${darkMode ? "bg-gray-900" : "bg-gray-50"
        } min-h-screen transition-colors duration-200`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 flex items-center gap-3 p-4 border-b transition-colors duration-200 ${darkMode
            ? "border-gray-700 bg-gray-900"
            : "border-gray-200 bg-gray-50"
          }`}
      >
        <button
          className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
          onClick={() => navigate("/home")}
        >
          <FaArrowLeft className="text-xl" />
        </button>

        <h1
          className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"
            }`}
        >
          Your Workouts
        </h1>
      </div>

      <div className="p-6">
        {/* Goal-based workouts section */}
        {userGoals.length > 0 && (
          <div className="mb-12">
            <h2
              className={`text-3xl font-extrabold mb-6 pb-2 border-b-2 transition-colors duration-200 ${darkMode
                  ? "text-indigo-300 border-indigo-500"
                  : "text-indigo-700 border-indigo-500"
                }`}
            >
              Your Goal Workouts
            </h2>

            {Object.keys(goalWorkouts).length === 0 ? (
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                No workouts matched your goals yet. Try updating your profile.
              </p>
            ) : (
              Object.keys(goalWorkouts).map((category) => (
                <div key={category} className="mb-10">
                  <h3
                    className={`text-2xl font-bold mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    {category}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {goalWorkouts[category].map((workout) => (
                      <motion.div
                        key={workout.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ duration: 0.4 }}
                        onClick={() => handleCardClick(workout)}
                        className={`rounded-xl p-5 flex flex-col items-center text-center cursor-pointer shadow-md transition-colors duration-200 ${darkMode
                            ? "bg-gray-800 text-gray-200"
                            : "bg-white text-gray-800"
                          }`}
                      >
                        <div
                          className="w-24 h-24 mb-4 rounded-full flex items-center justify-center text-3xl text-white"
                          style={{ backgroundColor: workout.color }}
                        >
                          {workout.icon}
                        </div>

                        <h3 className="font-bold text-xl mb-2">
                          {workout.name}
                        </h3>

                        <p
                          className={`mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                          {workout.description}
                        </p>

                        <span
                          className="mt-auto px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: workout.color }}
                        >
                          {workout.duration}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Show all workouts when user has no goals or only one goal */}
        {(userGoals.length === 0 || userGoals.length === 1) && (
          <div className="mb-12">
            <h1
              className={`text-3xl font-extrabold mb-6 ${darkMode ? "text-gray-200" : "text-gray-800"
                }`}
            >
              All Workouts
            </h1>

            {Object.keys(workouts).map((category) => (
              <div key={category} className="mb-10">
                <h2
                  className={`text-2xl font-bold mb-6 pb-2 transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                >
                  {category}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {workouts[category].map((workout) => (
                    <motion.div
                      key={workout.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ duration: 0.4 }}
                      onClick={() => handleCardClick(workout)}
                      className={`rounded-xl p-5 flex flex-col items-center text-center cursor-pointer shadow-md transition-shadow duration-200 ${darkMode
                          ? "bg-gray-800 text-gray-200"
                          : "bg-white text-gray-800"
                        }`}
                    >
                      <div
                        className="w-24 h-24 mb-4 rounded-full flex items-center justify-center text-3xl text-white"
                        style={{ backgroundColor: workout.color }}
                      >
                        {workout.icon}
                      </div>

                      <h3 className="font-bold text-xl mb-2">{workout.name}</h3>

                      <p
                        className={`mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        {workout.description}
                      </p>

                      <span
                        className="mt-auto px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: workout.color }}
                      >
                        {workout.duration}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWorkout;