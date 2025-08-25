// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Dumbbell, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { name: "Home", to: "/home" },
  { name: "Workouts", to: "/workouts" },
  { name: "Nutrition", to: "/nutrition" },
  { name: "Progress", to: "/progress" },
  { name: "Meals", to: "/nutrition" },
  { name: "Class", to: "/progress" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();
  const { darkMode } = useTheme();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuVariants = {
    hidden: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Dummy profile image, replace with user avatar if available
  const profilePic = "https://i.pravatar.cc/40";

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      className={`shadow-md fixed w-full top-0 left-0 z-50 transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/home"
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xl transition-colors duration-200"
        >
          <Dumbbell size={28} />
          <span>FitTrack</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className={`text-black hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
            >
              {link.name}
            </Link>
          ))}
          <ThemeToggle />
          {/* Profile Picture */}
          <div className="ml-4">
            <Link to="/profile">
            <img
              src={profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover cursor-pointer"
            />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <img
            src={profilePic}
            alt="Profile"
            className="w-8 h-8 rounded-full border-2 border-blue-500 object-cover ml-2"
          />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none ml-2 text-white dark:text-black transition-colors duration-200"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className={`md:hidden border-t transition-colors  ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
          >
            {links.map((link) => (
              <motion.div
                key={link.name}
                variants={itemVariants}
                className={`px-4 py-3 border-b transition-colors  ${darkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <Link
                  to={link.to}
                  className={`block text-black hover:text-blue-600 dark:hover:text-blue-400 transition-colors  ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
