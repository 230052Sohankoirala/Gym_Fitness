// src/components/admin/AdminNavbar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    Building2,
    LayoutGrid,
    Users,
    ClipboardList,
    CreditCard,
    FileText,
    Database,

    Bell,
    Menu,
    X,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

/** Main nav links for Admin */
const ADMIN_LINKS = [
    { name: "Dashboard", to: "/admin", icon: <LayoutGrid size={18} /> },
    { name: "Users", to: "/admin/users", icon: <Users size={18} /> },
    { name: "Trainers", to: "/admin/trainers", icon: <ClipboardList size={18} /> },
    { name: "Payments", to: "/admin/payments", icon: <CreditCard size={18} /> },
    { name: "Reports", to: "/admin/report", icon: <FileText size={18} /> },
    { name: "System", to: "/admin/system", icon: <Database size={18} /> },


];

/**
 * AdminNavbar
 * Responsive, animated admin top navigation with dark mode support.
 */
const AdminNavbar = ({ notifications = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { darkMode } = useTheme();
    const location = useLocation();

    // close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // animation variants
    const menuVariants = {
        hidden: { opacity: 0, y: -8, transition: { duration: 0.15 } },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2, when: "beforeChildren", staggerChildren: 0.03 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
    };

    // theming tokens
    const baseBg = darkMode ? "bg-gray-800" : "bg-white";
    const baseBorder = darkMode ? "border-gray-800" : "border-gray-200";
    const baseText = darkMode ? "text-gray-100" : "text-gray-900";
    const mutedText = darkMode ? "text-gray-300" : "text-gray-600";
    const hoverBg = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100";
    const activeBg = darkMode ? "bg-gray-800" : "bg-gray-100";

    return (
        <nav
            className={`${baseBg} ${baseText} border-b ${baseBorder} sticky top-0 z-40 transition-colors duration-200`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top bar */}
                <div className="h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <Link to="/admin" className="flex items-center gap-2">
                            <Building2 size={26} className="text-indigo-500" />
                            <span className="text-xl font-semibold">FitTrack Admin</span>
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {ADMIN_LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isActive ? `${activeBg}` : `${mutedText} ${hoverBg}`
                                    }`
                                }
                            >
                                {link.icon}
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Notifications */}
                        <Link
                            to="/admin/notifications"
                            className={`relative p-2 rounded-full ${hoverBg} transition-colors`}
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] leading-none font-bold rounded-full bg-red-500 text-white h-4 min-w-4 px-1">
                                    {notifications > 9 ? "9+" : notifications}
                                </span>
                            )}
                        </Link>

                        {/* Theme toggle */}
                        <ThemeToggle />
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className={`md:hidden p-2 rounded-lg ${hoverBg} transition-colors duration-200`}
                        onClick={() => setIsOpen((s) => !s)}
                        aria-expanded={isOpen}
                        aria-controls="admin-mobile-menu"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="admin-mobile-menu"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={menuVariants}
                        className={`${baseBg} border-t ${baseBorder} md:hidden transition-colors duration-200`}
                    >
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 size={20} className="text-indigo-500" />
                                <span className="font-semibold">Menu</span>
                            </div>
                            <ThemeToggle />
                        </div>

                        <div className="px-2 pb-3 space-y-1">
                            {ADMIN_LINKS.map((link) => (
                                <motion.div key={link.to} variants={itemVariants}>
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? activeBg : hoverBg
                                            }`
                                        }
                                    >
                                        {link.icon}
                                        <span>{link.name}</span>
                                    </NavLink>
                                </motion.div>
                            ))}

                            {/* Notifications (mobile) */}
                            <motion.div variants={itemVariants}>
                                <Link
                                    to="/admin/notifications"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${hoverBg}`}
                                >
                                    <div className="relative">
                                        <Bell size={18} />
                                        {notifications > 0 && (
                                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] leading-none font-bold rounded-full bg-red-500 text-white h-4 min-w-4 px-1">
                                                {notifications > 9 ? "9+" : notifications}
                                            </span>
                                        )}
                                    </div>
                                    <span>Notifications</span>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default AdminNavbar;
