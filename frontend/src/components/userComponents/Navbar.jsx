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

const normalizeAvatarUrl = (avatar) => {
  if (!avatar) {
    return "";
  }

  const cleanAvatar = String(avatar).trim();

  if (!cleanAvatar) {
    return "";
  }

  if (cleanAvatar.startsWith("blob:")) {
    return cleanAvatar;
  }

  if (cleanAvatar.startsWith("http://localhost:4000")) {
    return cleanAvatar.replace(
      "http://localhost:4000",
      "https://gym-fitness-hgq7.onrender.com"
    );
  }

  if (cleanAvatar.startsWith("https://localhost:4000")) {
    return cleanAvatar.replace(
      "https://localhost:4000",
      "https://gym-fitness-hgq7.onrender.com"
    );
  }

  if (cleanAvatar.startsWith("http://gym-fitness-hgq7.onrender.com")) {
    return cleanAvatar.replace(
      "http://gym-fitness-hgq7.onrender.com",
      "https://gym-fitness-hgq7.onrender.com"
    );
  }

  if (cleanAvatar.startsWith("https://gym-fitness-hgq7.onrender.com")) {
    return cleanAvatar;
  }

  if (cleanAvatar.startsWith("http://")) {
    return cleanAvatar.replace("http://", "https://");
  }

  if (cleanAvatar.startsWith("https://")) {
    return cleanAvatar;
  }

  if (cleanAvatar.startsWith("/")) {
    return `${BACKEND_URL}${cleanAvatar}`;
  }

  return `${BACKEND_URL}/${cleanAvatar}`;
};

const Navbar = ({ notifications = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [backendUser, setBackendUser] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const menuRef = useRef(null);
  const { darkMode } = useTheme();
  const location = useLocation();

  const avatarSrc = useMemo(() => {
    return normalizeAvatarUrl(backendUser?.avatar);
  }, [backendUser?.avatar]);

  useEffect(() => {
    const fetchUserFromBackend = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setBackendUser(null);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setBackendUser(null);
          return;
        }

        setBackendUser(data);
        setAvatarFailed(false);
      } catch (error) {
        console.error("Navbar user fetch failed:", error);
        setBackendUser(null);
      }
    };

    fetchUserFromBackend();

    window.addEventListener("user-profile-updated", fetchUserFromBackend);
    window.addEventListener("auth-user-updated", fetchUserFromBackend);

    return () => {
      window.removeEventListener("user-profile-updated", fetchUserFromBackend);
      window.removeEventListener("auth-user-updated", fetchUserFromBackend);
    };
  }, []);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarSrc]);

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
      {avatarSrc && !avatarFailed ? (
        <img
          src={avatarSrc}
          alt="Profile"
          draggable={false}
          onError={() => {
            setAvatarFailed(true);
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
                `px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${baseText} ${hoverText} ${
                  isActive ? (darkMode ? "bg-gray-700" : "bg-gray-100") : ""
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
            className={`focus:outline-none ml-2 ${
              darkMode ? "text-gray-200" : "text-gray-800"
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
            className={`md:hidden border-t transition-colors ${
              darkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {links.map((link) => (
              <motion.div
                key={link.name}
                variants={itemVariants}
                className={`px-4 py-3 border-b transition-colors ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    } ${hoverText} ${
                      isActive ? (darkMode ? "bg-gray-800" : "bg-gray-100") : ""
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