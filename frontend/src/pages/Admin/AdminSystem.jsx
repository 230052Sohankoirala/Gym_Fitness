// src/pages/admin/AdminSystem.jsx

import React from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { Cpu, HardDrive, Activity, Server, Terminal } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.35, ease: "easeOut" },
  }),
};

// Mock system data
const systemStats = [
  { label: "CPU Usage", value: "32%", icon: <Cpu size={18} />, status: "normal" },
  { label: "Memory Load", value: "68%", icon: <HardDrive size={18} />, status: "warning" },
  { label: "Server Health", value: "Online", icon: <Server size={18} />, status: "good" },
  { label: "Active Processes", value: "142", icon: <Activity size={18} />, status: "normal" },
];

const activityLogs = [
  { id: 1, text: "System backup completed.", time: "12:45 PM", type: "success" },
  { id: 2, text: "Admin logged in from new device.", time: "11:28 AM", type: "alert" },
  { id: 3, text: "Health check passed.", time: "10:15 AM", type: "success" },
  { id: 4, text: "Server load spike detected.", time: "09:50 AM", type: "warning" },
];

const AdminSystem = () => {
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
  const cardBase = "rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200";
  const cardTheme = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const borderSoft = darkMode ? "border-gray-700" : "border-gray-200";
  const subText = darkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${pageBg}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto flex flex-col gap-6"
      >
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Admin – System Monitoring</h1>
          <p className={`text-sm ${subText}`}>
            Real-time overview of system status, health, and server logs.
          </p>
        </div>

        {/* SYSTEM STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className={`${cardBase} ${cardTheme} border ${borderSoft} hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm opacity-80">{stat.label}</div>
                <div
                  className={`p-2 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="mt-2 text-2xl font-semibold">{stat.value}</div>
              <div className={`text-xs mt-1 ${
                stat.status === "warning"
                  ? "text-yellow-400"
                  : stat.status === "good"
                  ? "text-emerald-400"
                  : subText
              }`}>
                {stat.status === "warning"
                  ? "High usage"
                  : stat.status === "good"
                  ? "Optimal"
                  : "Normal"}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* SERVER DETAILS */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={`${cardBase} ${cardTheme} border ${borderSoft}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Server size={20} />
              <h3 className="font-semibold">Server Information</h3>
            </div>

            <ul className={`space-y-2 text-sm ${subText}`}>
              <li>• Server ID: <span className="text-sky-400">#SRV-9821</span></li>
              <li>• Node Version: <span className="text-sky-400">v18.17.1</span></li>
              <li>• MongoDB Status: <span className="text-emerald-400">Connected</span></li>
              <li>• Uptime: <span className="text-sky-400">14 days</span></li>
              <li>• Region: <span className="text-sky-400">Singapore / Asia-Pacific</span></li>
            </ul>
          </motion.div>

          {/* ACTIVITY LOGS */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className={`${cardBase} ${cardTheme} border ${borderSoft}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={20} />
              <h3 className="font-semibold">System Activity Logs</h3>
            </div>

            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border ${borderSoft} flex justify-between items-center ${
                    log.type === "warning"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : log.type === "alert"
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  <span className="text-sm">{log.text}</span>
                  <span className="text-xs opacity-70">{log.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSystem;
