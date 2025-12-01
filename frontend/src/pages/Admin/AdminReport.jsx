// src/pages/admin/AdminReport.jsx

import React from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { useTheme } from "../../context/ThemeContext";

const statCards = [
  {
    label: "Total Users",
    value: "1,248",
    change: "+12.4%",
    trend: "up",
  },
  {
    label: "Active Subscriptions",
    value: "326",
    change: "+4.2%",
    trend: "up",
  },
  {
    label: "New Reports (7 days)",
    value: "19",
    change: "-8.1%",
    trend: "down",
  },
  {
    label: "Open Issues",
    value: "7",
    change: "—",
    trend: "neutral",
  },
];

const recentReports = [
  {
    id: "#RPT-1024",
    title: "Monthly usage summary",
    type: "Analytics",
    createdAt: "24 Nov 2025",
    status: "Generated",
  },
  {
    id: "#RPT-1023",
    title: "Payment reconciliation",
    type: "Finance",
    createdAt: "23 Nov 2025",
    status: "In review",
  },
  {
    id: "#RPT-1022",
    title: "User feedback & complaints",
    type: "Support",
    createdAt: "22 Nov 2025",
    status: "Generated",
  },
  {
    id: "#RPT-1021",
    title: "System health overview",
    type: "System",
    createdAt: "20 Nov 2025",
    status: "Generated",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.35, ease: "easeOut" },
  }),
};

const AdminReport = () => {
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
  const cardBase = "rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200";
  const cardTheme = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const subText = darkMode ? "text-gray-300" : "text-gray-600";
  const borderSoft = darkMode ? "border-gray-700" : "border-gray-200";
  const softBg = darkMode ? "bg-gray-800" : "bg-gray-100";

  return (
    <div className={`min-h-screen w-full p-6 transition-colors duration-200 ${pageBg}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto flex max-w-6xl flex-col gap-6"
      >
        {/* Header */}
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Admin Reports
              </span>
            </h1>
            <p className={`mt-1 text-sm ${subText}`}>
              Overview of platform activity, key metrics, and generated reports at a glance.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              className={`rounded-xl border px-3 py-2 text-xs shadow-sm outline-none transition ${borderSoft} ${
                darkMode ? "bg-gray-900 text-white hover:border-gray-500" : "bg-white text-gray-800 hover:border-gray-400"
              } focus:border-sky-400 focus:ring-2 focus:ring-sky-300`}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>

            <button
              className={`rounded-xl border px-4 py-2 text-xs font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${borderSoft} ${
                darkMode
                  ? "bg-gray-900 text-gray-100 hover:border-sky-500 hover:text-sky-400"
                  : "bg-white text-gray-800 hover:border-sky-400 hover:text-sky-500"
              }`}
            >
              Export summary
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className={`${cardBase} ${cardTheme} border ${borderSoft} hover:shadow-md hover:-translate-y-1`}
            >
              <p className={`text-xs font-medium uppercase tracking-wide ${subText}`}>
                {card.label}
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-semibold tracking-tight">{card.value}</span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                    card.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : card.trend === "down"
                      ? "bg-rose-500/10 text-rose-400"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {card.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
          {/* Activity chart */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={1}
            className={`${cardBase} ${cardTheme} border ${borderSoft}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Activity overview</h2>
                <p className={`text-xs ${subText}`}>
                  Daily generated reports and admin actions (dummy data).
                </p>
              </div>
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-medium text-sky-400">
                Live
              </span>
            </div>

            <div
              className={`mt-2 h-48 w-full rounded-xl p-4 ${
                darkMode
                  ? "bg-gradient-to-br from-gray-900 via-black to-gray-900"
                  : "bg-gradient-to-br from-gray-900 via-gray-950 to-black"
              }`}
            >
              {/* Simple bar chart using divs */}
              <div className="flex h-full items-end justify-between gap-2">
                {[
                  { label: "Mon", value: 40 },
                  { label: "Tue", value: 60 },
                  { label: "Wed", value: 75 },
                  { label: "Thu", value: 55 },
                  { label: "Fri", value: 90 },
                  { label: "Sat", value: 35 },
                  { label: "Sun", value: 50 },
                ].map((day) => (
                  <div
                    key={day.label}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div className="relative flex h-full w-full items-end justify-center">
                      <div className="w-3 rounded-full bg-gray-700/70">
                        <div
                          className="w-3 rounded-full bg-sky-400"
                          style={{ height: `${day.value}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary / notes */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={2}
            className={`${cardBase} ${cardTheme} border ${borderSoft} flex flex-col gap-3`}
          >
            <h2 className="text-sm font-semibold tracking-tight">Summary insights</h2>
            <p className={`text-xs leading-relaxed ${subText}`}>
              Quick written snapshot of the current state of the platform. Use this when
              you just need the narrative instead of raw numbers. You can later bind
              this to real analytics coming from your backend.
            </p>

            <ul className={`mt-1 space-y-1 text-xs ${subText}`}>
              <li>• User growth is stable with a slight upward trend.</li>
              <li>• Most reports are generated between Thursday and Friday.</li>
              <li>• Open issues remain low and manageable for the team.</li>
              <li>• Financial and system reports are generated regularly.</li>
            </ul>

            <textarea
              rows={4}
              placeholder="Admin notes for this period (e.g. anomalies, follow-ups, tasks for dev team)…"
              className={`mt-2 w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${borderSoft} ${
                darkMode
                  ? "bg-gray-900 text-gray-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-500"
                  : "bg-gray-50 text-gray-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-300"
              }`}
            />
            <div className="flex justify-end">
              <button className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300">
                Save note
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recent reports table */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={3}
          className={`overflow-hidden rounded-2xl border ${borderSoft} ${cardTheme} shadow-sm`}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 text-sm font-semibold border-b ${borderSoft}`}
          >
            <span>Recent report runs</span>
            <button
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${borderSoft} ${
                darkMode
                  ? "text-gray-300 hover:border-sky-500 hover:text-sky-400"
                  : "text-gray-600 hover:border-sky-400 hover:text-sky-500"
              }`}
            >
              View all
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className={`${softBg} ${subText}`}>
                <tr>
                  <Th>ID</Th>
                  <Th>Title</Th>
                  <Th>Type</Th>
                  <Th>Created</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, idx) => (
                  <tr
                    key={report.id}
                    className={`border-t ${borderSoft} ${
                      idx % 2 === 0
                        ? darkMode
                          ? "bg-gray-900/40"
                          : "bg-white"
                        : darkMode
                        ? "bg-gray-900/10"
                        : "bg-gray-50"
                    } ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
                  >
                    <Td mono>{report.id}</Td>
                    <Td>{report.title}</Td>
                    <Td>{report.type}</Td>
                    <Td>{report.createdAt}</Td>
                    <Td>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                          report.status === "Generated"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : report.status === "In review"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {report.status}
                      </span>
                    </Td>
                    <Td align="right">
                      <button className="rounded-full px-3 py-1 text-[11px] font-medium text-sky-400 hover:bg-sky-500/10">
                        Download
                      </button>
                      <button className="ml-1 rounded-full px-3 py-1 text-[11px] font-medium text-gray-400 hover:bg-gray-500/10">
                        Details
                      </button>
                    </Td>
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

/* ---------- small table helpers (same pattern as AdminPayments) ---------- */
const Th = ({ children, align = "left" }) => (
  <th
    className={`px-4 py-2 text-[11px] font-medium transition-colors duration-200 text-${align}`}
  >
    {children}
  </th>
);

const Td = ({ children, mono = false, align = "left" }) => (
  <td
    className={`px-4 py-2 whitespace-nowrap text-[11px] transition-colors duration-200 text-${align} ${
      mono ? "font-mono" : ""
    }`}
  >
    {children}
  </td>
);

export default AdminReport;
