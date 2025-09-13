import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  ArrowLeft,
  Settings,
  Users,
  Dumbbell,
  CalendarClock,
  DollarSign,
  PlusCircle,
  UserPlus,
  Receipt,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const AdminHomepage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  // --- demo data (replace with API data) ---
  const stats = [
    { label: "Active Members", value: 1248, icon: <Users size={18} />, delta: "+3.2%" },
    { label: "Trainers", value: 28, icon: <Dumbbell size={18} />, delta: "+1" },
    { label: "Active Classes", value: 46, icon: <CalendarClock size={18} />, delta: "+8" },
    { label: "MRR", value: "$18,420", icon: <DollarSign size={18} />, delta: "+5.1%" },
  ];

  const upcoming = [
    { id: 1, name: "Morning Yoga", trainer: "Sohan Koirala", time: "Today 7:00 AM", spots: "12/15" },
    { id: 2, name: "Pilates Basics", trainer: "Anita Sharma", time: "Today 9:00 AM", spots: "9/10" },
    { id: 3, name: "Strength 101", trainer: "Rajesh Thapa", time: "Today 5:00 PM", spots: "7/8" },
    { id: 4, name: "Cardio Blast", trainer: "Priya Khatri", time: "Tomorrow 6:00 AM", spots: "14/20" },
  ];

  const activity = [
    { id: "a1", text: "New Trainer joined: Nirmal P.", time: "2m ago" },
   
  ];

  // simple sparkline points (pure SVG)
  const revenuePoints = useMemo(() => {
    const vals = [12, 13, 14, 13, 15, 18, 17, 19, 21, 20, 22, 24]; // mock
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const w = 160;
    const h = 46;
    const step = w / (vals.length - 1);
    const norm = (v) => h - ((v - min) / (max - min)) * h;
    return vals.map((v, i) => `${i * step},${norm(v)}`).join(" ");
  }, []);

  const cardBase =
    "rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200";
  const cardTheme = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const subText = darkMode ? "text-gray-300" : "text-gray-600";
  const borderSoft = darkMode ? "border-gray-700" : "border-gray-200";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 160, damping: 16 } },
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Header */}
      <div className={`w-full transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-xl sm:text-2xl font-semibold transition-colors duration-200 ${darkMode ? "text-white" : "text-gray-800"}`}>
            Admin Dashboard
          </h1>
          <div className="ml-auto">
            <button
              onClick={() => navigate("/admin/settings")}
              className={`px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors duration-200 ${darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-white hover:bg-gray-50 border border-gray-200"
                }`}
            >
              <Settings size={16} />
              Go to Settings
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 space-y-6"
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <motion.div key={s.label} variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
              <div className="flex items-center justify-between">
                <div className="text-sm opacity-80">{s.label}</div>
                <div className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>{s.icon}</div>
              </div>
              <div className="mt-2 text-2xl font-semibold">{s.value}</div>
              <div className={`mt-1 text-xs ${subText}`}>vs last period {s.delta}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions + Revenue */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              <ActionButton
                icon={<PlusCircle size={18} />}
                label="Add Class"
                onClick={() => navigate("/classes/new")}
                darkMode={darkMode}
              />
              <ActionButton
                icon={<UserPlus size={18} />}
                label="Add Trainer"
                onClick={() => navigate("/trainers/new")}
                darkMode={darkMode}
              />
              <ActionButton
                icon={<Receipt size={18} />}
                label="View Bookings"
                onClick={() => navigate("/bookings")}
                darkMode={darkMode}
              />
              <ActionButton
                icon={<CreditCard size={18} />}
                label="Billing"
                onClick={() => navigate("/billing")}
                darkMode={darkMode}
              />
            </div>
          </motion.div>

          {/* Revenue (Sparkline) */}
          <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Revenue</h3>
              <span className={`text-xs ${subText}`}>Last 12 periods</span>
            </div>
            <div className={`rounded-xl border ${borderSoft} p-3 transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
              <div className="flex items-end gap-3">
                <div>
                  <div className="text-2xl font-semibold">$24.1k</div>
                  <div className={`text-xs ${subText}`}>MTD</div>
                </div>
              </div>
              <svg width="100%" height="60" viewBox="0 0 160 46" className="mt-2">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  points={revenuePoints}
                  className={darkMode ? "text-indigo-300" : "text-indigo-600"}
                />
              </svg>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Recent Activity</h3>
              <button
                onClick={() => navigate("/admin/activity")}
                className={`text-sm inline-flex items-center gap-1 transition-colors duration-200 ${darkMode ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"}`}
              >
                View all <ChevronRight size={16} />
              </button>
            </div>
            <ul className="space-y-2">
              {activity.map((a) => (
                <li key={a.id} className={`rounded-lg px-3 py-2 transition-colors duration-200 ${darkMode ? "bg-gray-700/60 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"}`}>
                  <div className="text-sm">{a.text}</div>
                  <div className={`text-xs mt-0.5 ${subText}`}>{a.time}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Upcoming Classes */}
        <motion.div variants={itemVariants} className={`${cardBase} ${cardTheme}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Upcoming Classes</h3>
            <button
              onClick={() => navigate("/classes")}
              className={`text-sm inline-flex items-center gap-1 transition-colors duration-200 ${darkMode ? "text-indigo-300 hover:text-indigo-200" : "text-indigo-600 hover:text-indigo-700"}`}
            >
              Manage <ChevronRight size={16} />
            </button>
          </div>

          <div className={`mt-3 rounded-xl border ${borderSoft} overflow-x-auto transition-colors duration-200`}>
            <table className="min-w-full text-sm">
              <thead className={`transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <tr>
                  <Th>Class</Th>
                  <Th>Trainer</Th>
                  <Th>Time</Th>
                  <Th className="text-right pr-4">Spots</Th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`transition-colors duration-200 ${i % 2 ? (darkMode ? "bg-gray-800/60" : "bg-white") : (darkMode ? "bg-gray-800/30" : "bg-gray-50")
                      } hover:${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
                  >
                    <Td>{c.name}</Td>
                    <Td>{c.trainer}</Td>
                    <Td>{c.time}</Td>
                    <Td className="text-right pr-4">{c.spots}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ---------- small building blocks ---------- */

const ActionButton = ({ icon, label, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`w-full rounded-xl px-3 py-3 text-sm font-medium inline-flex items-center justify-start gap-2 transition-colors duration-200 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
      }`}
  >
    <span className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"}`}>{icon}</span>
    {label}
  </button>
);

const Th = ({ children, className = "" }) => (
  <th className={`text-left px-4 py-2 font-medium transition-colors duration-200 ${className}`}>{children}</th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-2 whitespace-nowrap transition-colors duration-200 ${className}`}>{children}</td>
);

export default AdminHomepage;
