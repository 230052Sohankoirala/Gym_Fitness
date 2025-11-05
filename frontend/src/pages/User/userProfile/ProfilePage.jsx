import React, { useState } from "react";
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
    X,
    Video,
    Dumbbell,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import ArmsWorkout from "../../../video/ArmsWorkout.mp4";
import ChestWorkout from "../../../video/ChestWorkout.mp4";
import LegsWorkout from "../../../video/LegWorkout.mp4";
import BackWorkout from "../../../video/BackWorkout.mp4";

const ProfilePage = () => {
    const [logoutModal, setLogoutModal] = useState(false);

    const [activeSections, setActiveSections] = useState({
        Account: false,
        Fitness: false,

        Help: false,
    });

    // Track which parent item (inside a section) is expanded (e.g., "WorkoutsVideo")
    const [expandedItems, setExpandedItems] = useState({});

    const navigate = useNavigate();
    const handleBack = () => navigate("/home");
    const { darkMode } = useTheme();

    const Links = [
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
                    name: "WorkoutsVideo",
                    icon: <Video size={16} />,
                    // NOTE: no `url` here, this is a collapsible parent with nested items
                    items: [
                        { id: 1, name: "ChestWorkouts", url: ChestWorkout, icon: <Dumbbell size={16} /> },
                        { id: 2, name: "BackWorkouts", url: BackWorkout, icon: <Dumbbell size={16} /> },
                        { id: 3, name: "ArmsWorkouts", url: ArmsWorkout, icon: <Dumbbell size={16} /> },
                        { id: 4, name: "LegsWorkouts", url: LegsWorkout, icon: <Dumbbell size={16} /> },
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

    const userData = {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        joinDate: "January 2023",
        workoutsCompleted: 42,
        currentStreak: 7,
    };

    const [About, setAbout] = useState(false);
    const toggleAbout = () => setAbout((s) => !s);

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



    const handleLogout = () => {
        setLogoutModal(false);
        // Perform logout logic here
        navigate("/memberLogin");
    };

    const handleItemClick = (sectionTitle, item) => {
        if (item.options) return;

        if (Array.isArray(item.items) && item.items.length > 0) {
            toggleItemExpand(sectionTitle, item.name);
            return;
        }

        if (item.url) navigate(item.url);
    };


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { delayChildren: 0.2, staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 120, damping: 12 },
        },
    };

    return (
        <div
            className={`min-h-screen w-full overflow-x-hidden transition-colors duration-200 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                }`}
        >
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`w-full transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"
                    } `}
            >
                <div className="flex p-4 w-full max-w-2xl mx-auto">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBack}
                        className={`p-2 rounded-full mr-2 transition-colors duration-200 ${darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"
                            }`}
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <h1
                        className={`text-xl md:text-2xl font-semibold transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-800"
                            }`}
                    >
                        Profile
                    </h1>
                </div>
            </motion.div>

            {/* User Info Card */}
            <div className="w-full max-w-2xl mx-auto px-4 py-4">
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-xl shadow-sm p-4 md:p-6 mb-6 transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"
                        }`}
                >
                    <div className="flex flex-col sm:flex-row items-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold transition-colors duration-200"
                        >
                            {userData.name.charAt(0)}
                        </motion.div>
                        <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 text-center sm:text-left">
                            <h2
                                className={`text-lg sm:text-xl font-semibold transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-800"
                                    }`}
                            >
                                {userData.name}
                            </h2>
                            <p
                                className={`transition-colors duration-200 ${darkMode ? "text-gray-300" : "text-gray-600"
                                    }`}
                            >
                                {userData.email}
                            </p>
                            <p
                                className={`text-sm mt-1 transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-500"
                                    }`}
                            >
                                Member since {userData.joinDate}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0">
                        {[
                            { value: userData.workoutsCompleted, label: "Workouts" },
                            { value: userData.currentStreak, label: "Day Streak" },
                            { value: 12, label: "Achievements" },
                        ].map((stat) => (
                            <motion.div
                                key={stat.label}
                                whileHover={{ scale: 1.05 }}
                                className="text-center flex-1 transition-colors duration-200"
                            >
                                <p
                                    className={`text-xl sm:text-2xl font-bold transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-800"
                                        }`}
                                >
                                    {stat.value}
                                </p>
                                <p
                                    className={`text-sm transition-colors duration-200 ${darkMode ? "text-gray-400" : "text-gray-600"
                                        }`}
                                >
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Profile Sections */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 transition-colors duration-200 w-full"
                >
                    {Links.map((section) => (
                        <motion.div
                            key={section.title}
                            variants={itemVariants}
                            className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-200 w-full ${darkMode ? "bg-gray-800" : "bg-white"
                                }`}
                        >
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full p-4 flex items-center justify-between transition-colors duration-200"
                                onClick={() => toggleSection(section.title)}
                                aria-expanded={activeSections[section.title]}
                                aria-controls={`section-${section.title}`}
                            >
                                <div className="flex items-center">
                                    <span
                                        className={`transition-colors duration-200 ${darkMode ? "text-gray-300 mr-3" : "text-gray-600 mr-3"
                                            }`}
                                    >
                                        {section.icon}
                                    </span>
                                    <span
                                        className={`font-medium transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-800"
                                            }`}
                                    >
                                        {section.title}
                                    </span>
                                </div>
                                <motion.div
                                    animate={{ rotate: activeSections[section.title] ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="transition-transform duration-200"
                                >
                                    <ChevronRight size={20} className={darkMode ? "text-gray-400" : "text-gray-500"} />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {activeSections[section.title] && (
                                    <motion.div
                                        id={`section-${section.title}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden transition-colors duration-200 w-full"
                                    >
                                        <div className="px-4 pb-4 w-full">
                                            {section.items.map((item) => {
                                                const hasNested = Array.isArray(item.items) && item.items.length > 0;
                                                const key = `${section.title}::${item.name}`;
                                                const expanded = !!expandedItems[key];

                                                return (
                                                    <motion.div
                                                        key={item.name}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`border-b transition-colors duration-200 w-full ${darkMode ? "border-gray-700" : "border-gray-100"
                                                            } last:border-b-0`}
                                                    >
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => handleItemClick(section.title, item)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" || e.key === " ") {
                                                                    e.preventDefault();
                                                                    handleItemClick(section.title, item);
                                                                }
                                                            }}
                                                            className={`flex items-center justify-between p-3 cursor-pointer rounded-lg transition-colors duration-200 w-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            {/* Left: icon + name */}
                                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                                <span
                                                                    className={`transition-colors duration-200 ${darkMode ? "text-gray-300" : "text-gray-600"
                                                                        }`}
                                                                >
                                                                    {item.icon}
                                                                </span>
                                                                <span
                                                                    className={`font-medium transition-colors duration-200 truncate ${darkMode ? "text-white" : "text-gray-800"
                                                                        }`}
                                                                >
                                                                    {item.name}
                                                                </span>
                                                            </div>

                                                            {/* Right: indicators/toggles */}
                                                            {item.options ? (
                                                                <div className="flex flex-wrap gap-2 shrink-0">
                                                                    {item.options.map((option) => (
                                                                        <motion.button
                                                                            key={option}
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}

                                                                            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 `}
                                                                        >
                                                                            {option}
                                                                        </motion.button>
                                                                    ))}
                                                                </div>
                                                            ) : hasNested ? (
                                                                <motion.div
                                                                    animate={{ rotate: expanded ? 90 : 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <ChevronRight
                                                                        size={16}
                                                                        className={darkMode ? "text-gray-400" : "text-gray-400 shrink-0"}
                                                                    />
                                                                </motion.div>
                                                            ) : (
                                                                <ChevronRight
                                                                    size={16}
                                                                    className={darkMode ? "text-gray-400" : "text-gray-400 shrink-0"}
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Nested items (e.g., WorkoutsVideo list) */}
                                                        <AnimatePresence>
                                                            {hasNested && expanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.25 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="pl-6 pr-3 pb-3">
                                                                        {item.items.map((sub) => (
                                                                            <div
                                                                                key={sub.name}
                                                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer mt-1 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                                                                                    }`}
                                                                                onClick={() => {
                                                                                    const slug = (sub.name || "").toLowerCase(); // "ChestWorkouts" -> "chestworkouts"
                                                                                    navigate(`/workoutsVideo/${slug}`, {
                                                                                        state: { src: sub.url, title: sub.name.replace(/([A-Z])/g, ' $1').trim() },
                                                                                    });
                                                                                }}


                                                                            >
                                                                                <div className="flex items-center space-x-3">
                                                                                    <span
                                                                                        className={`transition-colors duration-200 ${darkMode ? "text-gray-300" : "text-gray-600"
                                                                                            }`}
                                                                                    >
                                                                                        {sub.icon}
                                                                                    </span>
                                                                                    <span
                                                                                        className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-800"
                                                                                            }`}
                                                                                    >
                                                                                        {sub.name}
                                                                                    </span>
                                                                                </div>
                                                                                <ChevronRight
                                                                                    size={14}
                                                                                    className={darkMode ? "text-gray-500" : "text-gray-400"}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>

                {/* About Section */}
                <motion.div
                    className={`mt-4 rounded-xl shadow-sm p-4 md:p-4 transition-colors duration-200 w-full ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
                        }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.button
                        className="w-full flex justify-between items-center"
                        onClick={toggleAbout}
                        whileTap={{ scale: 0.98 }}
                        aria-expanded={About}
                        aria-controls="about-panel"
                    >
                        <h2 className={`text-md md:text-xl font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            About
                        </h2>
                        <motion.div animate={{ rotate: About ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight size={20} className={darkMode ? "text-gray-400" : "text-gray-500"} />
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>
                        {About && (
                            <motion.div
                                id="about-panel"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden mt-4"
                            >
                                <p className="text-sm md:text-base leading-relaxed">
                                    Welcome to <span className="font-medium">FitTrack</span> – your personal companion for tracking
                                    workouts, monitoring nutrition, and staying motivated on your fitness journey. FitTrack was
                                    thoughtfully developed by <span className="font-medium">Alex Johnson</span> to make fitness management
                                    simple, intuitive, and effective for everyone.
                                </p>
                                <div
                                    className="w-full h-px my-4 transition-colors duration-200"
                                    style={{ backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
                                />
                                <p className="text-sm md:text-base leading-relaxed">
                                    With FitTrack, you can log your workouts, monitor your nutrition intake, track your progress, and
                                    achieve your health goals efficiently. Our mission is to provide an easy-to-use platform that
                                    motivates users to maintain a consistent fitness routine while giving meaningful insights into their
                                    performance and habits. We hope you enjoy your journey with FitTrack!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLogoutModal(true)}
                    className={`w-full mt-6 p-4 rounded-xl shadow-sm flex items-center justify-center font-medium transition-colors duration-200 ${darkMode ? "bg-gray-800 text-red-400 hover:bg-gray-700" : "bg-white text-red-500 hover:bg-gray-50"
                        }`}
                >
                    <LogOut size={18} className="mr-2" />
                    Log Out
                </motion.button>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {logoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-200"
                        onClick={() => setLogoutModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 20 }}
                            className={`rounded-xl p-6 w-full max-w-md mx-4 transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"
                                }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3
                                    className={`text-lg font-semibold transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-800"
                                        }`}
                                >
                                    Confirm Logout
                                </h3>
                                <button
                                    onClick={() => setLogoutModal(false)}
                                    className={`transition-colors duration-200 ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    aria-label="Close logout dialog"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <p
                                className={`transition-colors duration-200 mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"
                                    }`}
                            >
                                Are you sure you want to log out?
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setLogoutModal(false)}
                                    className={`flex-1 py-2.5 rounded-lg font-medium transition-colors duration-200 ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        }`}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
                                >
                                    Log Out
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
