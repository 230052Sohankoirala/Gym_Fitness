// src/pages/User/UserHomePage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Dumbbell,
  Utensils,
  Clock,
  Target,
  Award,
  Flame,
  ChevronRight,
  Play,
  Activity,
} from "lucide-react";
import { GiClassicalKnowledge, GiWaterDrop } from "react-icons/gi";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import workoutData from "../../data/workoutplans.json";
import UserTaskBoard from "../../components/userComponents/userTaskBoard";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_BASE = `${API_ROOT}/api`;

/* -------------------- Animation Variants -------------------- */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -5, transition: { duration: 0.2 } },
};

/* -------------------- Stats Card -------------------- */
const StatsCard = ({ icon, value, label, color }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`p-4 rounded-xl shadow-sm border transition-colors duration-200 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>

        <div className="ml-4">
          <h3
            className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
              }`}
          >
            {value}
          </h3>

          <p
            className={`transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"
              }`}
          >
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* -------------------- Workout Plan Card -------------------- */
const WorkoutPlanCard = ({ planName, exercises }) => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const exerciseCount = exercises.length;

  const totalTime = exercises.reduce((acc, ex) => {
    const match = ex.duration.match(/\d+/);
    return acc + (match ? parseInt(match[0]) : 0);
  }, 0);

  const handleClick = () => {
    navigate(`/workoutPlan/${encodeURIComponent(planName)}`);
  };

  return (
    <motion.div
      className={`p-5 rounded-xl shadow-sm border transition-colors duration-200 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3
            className={`font-semibold text-lg transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
              }`}
          >
            {planName}
          </h3>

          <div
            className={`flex items-center mt-2 transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"
              }`}
          >
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{totalTime} mins</span>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${darkMode
              ? "bg-blue-900 text-blue-200"
              : "bg-blue-100 text-blue-800"
            }`}
        >
          {exerciseCount} exercises
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span
          className={`text-sm transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"
            }`}
        >
          Ready to train?
        </span>

        <button
          className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          onClick={handleClick}
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

/* -------------------- Activity Item -------------------- */
const ActivityItem = ({ icon, title, time, value, unit }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`flex items-center py-3 border-b transition-colors duration-200 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } last:border-0`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div
        className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? "bg-blue-900 text-blue-400" : "bg-blue-100 text-blue-600"
          }`}
      >
        {icon}
      </div>

      <div className="ml-4 flex-1">
        <h4
          className={`font-medium transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
            }`}
        >
          {title}
        </h4>

        <p
          className={`text-sm transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"
            }`}
        >
          {time}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`font-semibold transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
            }`}
        >
          {value}
        </p>

        <p
          className={`text-xs transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"
            }`}
        >
          {unit}
        </p>
      </div>
    </motion.div>
  );
};

/* -------------------- Quick Action -------------------- */
const QuickAction = ({ icon, title, description, color, onClick }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`p-4 rounded-xl shadow-sm border cursor-pointer h-full transition-colors duration-200 ${darkMode
          ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
          : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div
        className={`p-2 rounded-lg ${color} text-white w-10 h-10 flex items-center justify-center mb-3`}
      >
        {icon}
      </div>

      <h3
        className={`font-semibold mb-1 transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
          }`}
      >
        {title}
      </h3>

      <p
        className={`text-xs transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"
          }`}
      >
        {description}
      </p>
    </motion.div>
  );
};

/* -------------------- Main Component -------------------- */
const UserHomePage = () => {
  const [activeTab, setActiveTab] = useState("today");

  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [streak, setStreak] = useState(0);
  const [user, setUser] = useState(null);
  const [exerciseLevel, setExerciseLevel] = useState("medium");
  const [calories, setCalories] = useState(0);
  const [waterIntake, setWaterIntake] = useState("3L");
  const [goalProgress, setGoalProgress] = useState(0);
  const [activities, setActivities] = useState([]);

  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  /* -------------------- Fetch user -------------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();

        const { data } = await axios.get(`${API_BASE}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(data);
        setStreak(data.streak || 0);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };

    fetchUser();
  }, []);

  /* -------------------- Fetch progress -------------------- */
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = getToken();

        const { data } = await axios.get(`${API_BASE}/workouts/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setGoalProgress(data.percentage || 0);
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };

    fetchProgress();
  }, []);

  /* -------------------- Fetch activities -------------------- */
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = getToken();

        const { data } = await axios.get(
          `${API_BASE}/workouts/logs?period=${activeTab}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };

    fetchActivities();
  }, [activeTab]);

  /* -------------------- Calorie Calculation -------------------- */
  const calculateCalories = (weight, height, age, gender, level) => {
    let bmr = 0;

    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const factors = {
      soft: 1.375,
      medium: 1.55,
      hard: 1.725,
    };

    return Math.round(bmr * factors[level]);
  };

  /* -------------------- Update calories + water -------------------- */
  useEffect(() => {
    if (user?.weight && user?.height && user?.age) {
      const totalCalories = calculateCalories(
        user.weight,
        user.height,
        user.age,
        user.gender || "male",
        exerciseLevel
      );

      setCalories(totalCalories);
    }

    if (exerciseLevel === "soft") {
      setWaterIntake("2.5L");
    } else if (exerciseLevel === "medium") {
      setWaterIntake("3.5L");
    } else if (exerciseLevel === "hard") {
      setWaterIntake("4.5L");
    }
  }, [exerciseLevel, user]);

  const userStats = [
    {
      icon: <Flame size={20} />,
      value: calories,
      label: "Calories Needed",
      color: "bg-orange-500",
    },
    {
      icon: <Target size={20} />,
      value: `${goalProgress}%`,
      label: "Goals Completed",
      color: "bg-green-500",
    },
    {
      icon: <Award size={20} />,
      value: streak,
      label: "Workout Streak",
      color: "bg-purple-500",
    },
    {
      icon: <GiWaterDrop size={20} />,
      value: waterIntake,
      label: "Water Intake Daily",
      color: "bg-blue-500",
    },
  ];

  const quickActions = [
    {
      icon: <Play size={20} />,
      title: "Start Workout",
      description: "Begin a new exercise session",
      color: "bg-blue-500",
      link: "/workouts",
    },
    {
      icon: <Utensils size={20} />,
      title: "Log Nutrition",
      description: "Track meals & calories",
      color: "bg-green-500",
      link: "/nutrition",
    },
    {
      icon: <Activity size={20} />,
      title: "Track Progress",
      description: "Record measurements",
      color: "bg-orange-500",
      link: "/progress",
    },
    {
      icon: <GiClassicalKnowledge size={20} />,
      title: "Classes",
      description: "Find classes",
      color: "bg-indigo-500",
      link: "/userClasses",
    },
  ];

  const handleQuickAction = (link) => navigate(link);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-white"
        }`}
    >
      <main className="container mx-auto px-4 pt-2 pb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
                }`}
            >
              Welcome back, {user?.fullname || user?.username || "User"}!
            </h1>

            <p
              className={`transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
              Here's your fitness overview for today
            </p>
          </motion.div>
        </div>

        {/* Exercise Intensity Picker */}
        <div className="flex space-x-4 mb-6">
          {["soft", "medium", "hard"].map((level) => (
            <label
              key={level}
              className={`flex items-center space-x-2 cursor-pointer transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
                }`}
            >
              <input
                type="radio"
                value={level}
                checked={exerciseLevel === level}
                onChange={(e) => setExerciseLevel(e.target.value)}
              />

              <span className="capitalize">{level} exercise</span>
            </label>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {userStats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Workout Plans */}
            <div
              className={`rounded-xl shadow-sm p-5 border transition-colors duration-200 ${darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
                }`}
            >
              <h2
                className={`text-xl font-bold mb-6 transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
              >
                Your Workout Plans
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(workoutData.workoutPlans).map(
                  ([planName, exercises]) => (
                    <WorkoutPlanCard
                      key={planName}
                      planName={planName}
                      exercises={exercises}
                    />
                  )
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className={`rounded-xl shadow-sm p-5 border transition-colors duration-200 ${darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
                }`}
            >
              <h2
                className={`text-xl font-bold mb-6 transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
              >
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action, i) => (
                  <QuickAction
                    key={i}
                    {...action}
                    onClick={() => handleQuickAction(action.link)}
                  />
                ))}
              </div>
            </div>

            <UserTaskBoard />
          </div>

          {/* Recent Activity */}
          <div className="sticky top-32">
            <div
              className={`rounded-xl shadow-sm p-5 border transition-colors duration-200 ${darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
                }`}
            >
              <h2
                className={`text-xl font-bold mb-6 transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
              >
                Recent Activity
              </h2>

              <div
                className={`flex space-x-4 border-b mb-4 transition-colors duration-200 ${darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
              >
                <button
                  className={`pb-2 px-1 font-medium text-sm transition-colors duration-200 ${activeTab === "today"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : darkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveTab("today")}
                >
                  Today
                </button>

                <button
                  className={`pb-2 px-1 font-medium text-sm transition-colors duration-200 ${activeTab === "week"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : darkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveTab("week")}
                >
                  This Week
                </button>
              </div>

              {activities.length === 0 ? (
                <p
                  className={`text-sm text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  No activities found.
                </p>
              ) : (
                activities.map((activity, i) => (
                  <ActivityItem
                    key={activity?._id || i}
                    icon={<Dumbbell size={16} />}
                    title={activity.workoutName || "Workout"}
                    time={
                      activity.completedAt
                        ? new Date(activity.completedAt).toLocaleString()
                        : "No date"
                    }
                    value={activity.duration || 0}
                    unit="mins"
                  />
                ))
              )}

              <Link to={"/recentActivity"}>
                <motion.button
                  className={`w-full mt-4 py-2 text-center font-medium text-sm border rounded-lg transition-colors duration-200 ${darkMode
                      ? "text-blue-400 border-blue-700 hover:bg-blue-900"
                      : "text-blue-600 border-blue-200 hover:bg-blue-50"
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Activity
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserHomePage;