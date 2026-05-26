// src/pages/User/userProfile/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  ChevronRight,
  LogOut,
  ArrowLeft,
  User,
  Activity,
  Bell,
  Utensils,
  TrendingUp,
  HelpCircle,
  Settings,
  Video,
  Dumbbell,
  Briefcase,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import ArmsWorkout from "../../../video/ArmsWorkout.mp4";
import ChestWorkout from "../../../video/ChestWorkout.mp4";
import LegsWorkout from "../../../video/LegWorkout.mp4";
import BackWorkout from "../../../video/BackWorkout.mp4";
import axios from "axios";

const ProfilePage = () => {
  const [logoutModal, setLogoutModal] = useState(false);
  const [activeSections, setActiveSections] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [about, setAbout] = useState(false);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get("http://localhost:4000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const links = [
    {
      title: "Account",
      icon: <Settings size={18} />,
      items: [
        { name: "Edit Profile", url: "/editProfile", icon: <User size={16} /> },
        { name: "Notifications", url: "/notifications", icon: <Bell size={16} /> },
      ],
    },
    {
      title: "Fitness",
      icon: <Activity size={18} />,
      items: [
        { name: "Workouts", url: "/workouts", icon: <Activity size={16} /> },
        { name: "Nutrition", url: "/nutrition", icon: <Utensils size={16} /> },
        { name: "Progress", url: "/progress", icon: <TrendingUp size={16} /> },
        {
          name: "Workout Videos",
          icon: <Video size={16} />,
          items: [
            { id: 1, name: "Chest Workouts", url: ChestWorkout, icon: <Dumbbell size={16} /> },
            { id: 2, name: "Back Workouts", url: BackWorkout, icon: <Dumbbell size={16} /> },
            { id: 3, name: "Arms Workouts", url: ArmsWorkout, icon: <Dumbbell size={16} /> },
            { id: 4, name: "Legs Workouts", url: LegsWorkout, icon: <Dumbbell size={16} /> },
          ],
        },
      ],
    },
    {
      title: "Help",
      icon: <HelpCircle size={18} />,
      items: [{ name: "Help Center", url: "/help", icon: <HelpCircle size={16} /> }],
    },
  ];

  const toggleAbout = () => setAbout((prev) => !prev);

  const toggleSection = (title) => {
    setActiveSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const toggleItemExpand = (sectionTitle, itemName) => {
    const key = `${sectionTitle}::${itemName}`;
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/auth/logout");
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      navigate("/memberLogin");
    }
  };

  const handleItemClick = (sectionTitle, item) => {
    if (Array.isArray(item.items) && item.items.length > 0) {
      toggleItemExpand(sectionTitle, item.name);
      return;
    }

    if (item.url) {
      navigate(item.url);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 18, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
  };

  const pageBg = darkMode
    ? "bg-gray-900 text-white"
    : "bg-gray-100 text-gray-900";

  const topBg = darkMode ? "bg-gray-900/90" : "bg-gray-100/90";

  const cardBg = darkMode
    ? "bg-gray-800 border border-white/10"
    : "bg-white border border-gray-200";

  const hoverBg = darkMode ? "hover:bg-gray-700/70" : "hover:bg-gray-100";

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-200 ${pageBg}`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-10 py-4 px-6 backdrop-blur-md transition-colors duration-200 ${topBg}`}
      >
        <div className="flex items-center space-x-4 max-w-3xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className={`p-2 rounded-full transition-colors duration-200 ${hoverBg}`}
          >
            <ArrowLeft size={20} />
          </motion.button>

          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Profile</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* User Info Card */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-200 ${cardBg}`}
        >
          {userData ? (
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden transition-colors duration-200 ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  {userData?.avatar ? (
                    typeof userData.avatar === "string" ? (
                      <img
                        src={userData.avatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(userData.avatar)}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <User size={24} className="text-gray-500" />
                  )}
                </motion.div>

                <span className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"></span>
              </div>

              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h2 className="text-xl font-bold">{userData.fullname}</h2>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {userData.email}
                </p>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-sm`}>
                  Role: {userData.role}
                </p>
              </div>
            </div>
          ) : (
            <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Loading profile...
            </p>
          )}
        </motion.div>

        {/* Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {links.map((section) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className={`rounded-2xl shadow-md overflow-hidden transition-colors duration-200 ${cardBg}`}
            >
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => toggleSection(section.title)}
              >
                <div className="flex items-center space-x-3">
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </div>

                <motion.div
                  animate={{ rotate: activeSections[section.title] ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={20} className="text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {activeSections[section.title] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    {section.items.map((item) => {
                      const hasNested = Array.isArray(item.items) && item.items.length > 0;
                      const key = `${section.title}::${item.name}`;
                      const expanded = expandedItems[key];

                      return (
                        <div key={item.name}>
                          <div
                            onClick={() => handleItemClick(section.title, item)}
                            className={`flex items-center justify-between py-3 px-3 rounded-xl cursor-pointer transition-colors duration-200 ${hoverBg}`}
                          >
                            <div className="flex items-center space-x-3">
                              {item.icon}
                              <span>{item.name}</span>
                            </div>

                            {hasNested ? (
                              <motion.div
                                animate={{ rotate: expanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight size={16} className="text-gray-400" />
                              </motion.div>
                            ) : (
                              <ChevronRight size={16} className="text-gray-400" />
                            )}
                          </div>

                          <AnimatePresence>
                            {hasNested && expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-6"
                              >
                                {item.items.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className={`flex items-center justify-between py-3 px-3 rounded-xl cursor-pointer transition-colors duration-200 ${hoverBg}`}
                                    onClick={() =>
                                      navigate(`/workoutsVideo/${sub.name.toLowerCase()}`, {
                                        state: { src: sub.url, title: sub.name },
                                      })
                                    }
                                  >
                                    <div className="flex items-center space-x-3">
                                      {sub.icon}
                                      <span className="text-sm">{sub.name}</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-400" />
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* About */}
        <div
          className={`mt-6 p-4 rounded-2xl shadow-md transition-colors duration-200 ${cardBg}`}
        >
          <button
            onClick={toggleAbout}
            className="w-full flex items-center justify-between"
          >
            <h2 className="font-medium">About</h2>
            <motion.div animate={{ rotate: about ? 90 : 0 }}>
              <ChevronRight size={20} className="text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {about && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`mt-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Welcome to <b>FitTrack</b> – your companion for workouts, nutrition,
                and progress. Stay motivated and achieve your fitness goals.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setLogoutModal(true)}
          className={`w-full mt-6 p-4 rounded-2xl shadow-md flex items-center justify-center font-medium transition-colors duration-200 ${
            darkMode
              ? "bg-gray-800 border border-white/10 text-red-400 hover:bg-gray-700"
              : "bg-white border border-gray-200 text-red-500 hover:bg-gray-50"
          }`}
        >
          <LogOut size={18} className="mr-2" />
          Log Out
        </motion.button>
      </div>

      {/* Logout Modal */}
      <AnimatePresence>
        {logoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className={`rounded-2xl p-6 w-full max-w-md transition-colors duration-200 ${cardBg}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mb-6`}>
                Are you sure you want to log out?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setLogoutModal(false)}
                  className={`flex-1 py-2 rounded-xl transition-colors duration-200 ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;