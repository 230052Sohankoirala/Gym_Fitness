// src/pages/User/RecentActivity.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Dumbbell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const RecentActivity = () => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("today");
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:4000/api/workouts/logs?period=${activeTab}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActivities(data);
      } catch (err) {
        console.error("❌ Failed to fetch activities", err);
      }
    };
    fetchActivities();
  }, [activeTab]);

  return (
    <div className="flex justify-center p-6">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-xl p-8 transition-colors duration-200 mt-8 ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        {/* Back button */}
        <motion.button whileHover={{ scale: 1.1 }} className="absolute top-4 left-4">
          <Link to="/home">
            <FaArrowLeft size={26} className="text-blue-500" />
          </Link>
        </motion.button>

        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center"
        >
          Recent Activity
        </motion.h1>

        {/* Tabs */}
        <div
          className={`flex justify-center space-x-6 mb-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {["today", "week"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-3 font-medium text-sm capitalize ${
                activeTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "today" ? "Today" : "This Week"}
            </button>
          ))}
        </div>

        {/* Activities */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500">No activities found.</p>
          ) : (
            activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-center justify-between p-5 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01] ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-gray-600" : "bg-gray-200"
                    }`}
                  >
                    <Dumbbell size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-md font-semibold">{activity.workoutName}</h2>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(activity.completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right">
                  <p className="text-md font-bold text-pink-400">
                    {activity.duration}
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    mins
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
