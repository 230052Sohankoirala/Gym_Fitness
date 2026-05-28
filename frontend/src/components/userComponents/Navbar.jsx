import React, { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Dumbbell,
  Menu,
  X,
  Home as HomeIcon,
  Activity,
  Utensils,
  TrendingUp,
  CalendarDays,
  Bell,
  User,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const Navbar = ({ notifications = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const raw =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user") ||
        "null";

      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const menuRef = useRef(null);
  const { darkMode } = useTheme();
  const location = useLocation();

  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return "";

    const avatar = String(user.avatar).trim();

    if (!avatar) return "";

    if (avatar.startsWith("http://localhost:4000")) {
      return avatar.replace("http://localhost:4000", BACKEND_URL);
    }

    if (avatar.startsWith("https://localhost:4000")) {
      return avatar.replace("https://localhost:4000", BACKEND_URL);
    }

    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }

    if (avatar.startsWith("/")) {
      return `${BACKEND_URL}${avatar}`;
    }

    return `${BACKEND_URL}/${avatar}`;
  }, [user?.avatar]);

  useEffect(() => {
    const syncUserFromStorage = () => {
      try {
        const raw =
          localStorage.getItem("user") ||
          sessionStorage.getItem("user") ||
          "null";

        const parsed = JSON.parse(raw);

        setUser(parsed);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", syncUserFromStorage);
    window.addEventListener("user-profile-updated", syncUserFromStorage);
    window.addEventListener("auth-user-updated", syncUserFromStorage);

    return () => {
      window.removeEventListener("storage", syncUserFromStorage);
      window.removeEventListener("user-profile-updated", syncUserFromStorage);
      window.removeEventListener("auth-user-updated", syncUserFromStorage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const links = [
    {
      name: "Home",
      to: "/home",
      icon: <HomeIcon size={18} />,
    },
    {
      name: "Workouts",
      to: "/workouts",
      icon: <Activity size={18} />,
    },
    {
      name: "Nutrition",
      to: "/nutrition",
      icon: <Utensils size={18} />,
    },
    {
      name: "Progress",
      to: "/progress",
      icon: <TrendingUp size={18} />,
    },
    {
      name: "Meals",
      to: "/userMeals",
      icon: <Utensils size={18} />,
    },
    {
      name: "Class",
      to: "/userClasses",
      icon: <CalendarDays size={18} />,
    },
    {
      name: "Generator",
      to: "/workout-plan",
      icon: <Dumbbell size={18} />,
    },
  ];

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: "easeOut",
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  const baseBg = darkMode ? "bg-gray-800" : "bg-white";
  const baseText = darkMode ? "text-gray-200" : "text-gray-800";
  const hoverText = darkMode ? "hover:text-blue-400" : "hover:text-blue-600";

  const avatarNode = (
    <Link to="/profile" className="block">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt="Profile"
          draggable={false}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = "none";
          }}
          className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover cursor-pointer select-none"
        />
      ) : (
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 bg-gray-200 flex items-center justify-center">
          <User size={20} className="text-gray-500" />
        </div>
      )}
    </Link>
  );

  return (
    <nav
      className={`shadow-md w-full top-0 left-0 z-50 transition-colors duration-200 ${baseBg}`}
    >
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link
          to="/home"
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xl transition-colors duration-200"
        >
          <Dumbbell size={28} />
          <span>FitTrack</span>
        </Link>

        <div className="hidden md:flex items-center space-x-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${baseText} ${hoverText} ${isActive ? (darkMode ? "bg-gray-700" : "bg-gray-100") : ""
                }`
              }
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}

          <Link
            to="/notifications"
            className={`relative ml-2 p-2 rounded-full transition-colors ${hoverText}`}
            aria-label="Notifications"
          >
            <Bell
              size={20}
              className={darkMode ? "text-gray-200" : "text-gray-800"}
            />

            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] leading-none font-bold rounded-full bg-red-500 text-white h-4 min-w-4 px-1">
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </Link>

          <div className="ml-2">
            <ThemeToggle />
          </div>

          <div className="ml-2">{avatarNode}</div>
        </div>

        <div className="md:hidden flex items-center">
          <ThemeToggle />

          <div className="ml-2">{avatarNode}</div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`focus:outline-none ml-2 ${darkMode ? "text-gray-200" : "text-gray-800"
              } transition-colors duration-200`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className={`md:hidden border-t transition-colors ${darkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
              }`}
          >
            {links.map((link) => (
              <motion.div
                key={link.name}
                variants={itemVariants}
                className={`px-4 py-3 border-b transition-colors ${darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${darkMode ? "text-gray-200" : "text-gray-800"
                    } ${hoverText} ${isActive ? (darkMode ? "bg-gray-800" : "bg-gray-100") : ""
                    } px-2 py-2 rounded-lg`
                  }
                >
                  {link.icon}
                  <span>{link.name}</span>
                </NavLink>
              </motion.div>
            ))}

            <motion.div
              variants={itemVariants}
              className="px-4 py-3 flex items-center justify-between"
            >
              <ThemeToggle />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;