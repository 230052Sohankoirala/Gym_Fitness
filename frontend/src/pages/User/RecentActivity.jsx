import { BarChart3, Dumbbell, Utensils } from "lucide-react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars

import { useTheme } from "../../context/ThemeContext";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const RecentActivity = () => {
  const recentActivities = [
    {
      icon: <Dumbbell size={22} className="text-blue-500" />,
      title: "Chest Workout",
      time: "Today, 9:30 AM",
      value: 45,
      unit: "mins",
    },
    {
      icon: <Utensils size={22} className="text-green-500" />,
      title: "Breakfast logged",
      time: "Today, 8:15 AM",
      value: 420,
      unit: "cal",
    },
    {
      icon: <BarChart3 size={22} className="text-purple-500" />,
      title: "Weight recorded",
      time: "Yesterday, 8:00 AM",
      value: 165,
      unit: "lbs",
    },
  ];

  const { darkMode } = useTheme();

  return (
    <div className="flex justify-center p-6">

      {/* Card Container */}
      <div
        className={`w-full max-w-3xl h-108 rounded-2xl shadow-xl p-8 transition-colors duration-200 mt-8 ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
          }`}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 text-black"
        >
          <Link to="/home">
            <FaArrowLeft size={30} className="text-blue-500" />
          </Link>
        </motion.button>
        {/* Card Header */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
        >
          Recent Activity
        </motion.h1>

        {/* Activities List */}
        <div className="space-y-6">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`flex items-center justify-between p-4 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.02] ${darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-50 hover:bg-gray-100"
                }`}
            >
              {/* Left: Icon + Info */}
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-lg ${darkMode ? "bg-gray-600" : "bg-gray-200"
                    }`}
                >
                  {activity.icon}
                </div>
                <div>
                  <h2 className="text-md font-semibold">{activity.title}</h2>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {activity.time}
                  </p>
                </div>
              </div>

              {/* Right: Value */}
              <div className="text-right">
                <p className="text-md font-bold text-pink-400">{activity.value}</p>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {activity.unit}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
