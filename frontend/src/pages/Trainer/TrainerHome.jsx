// src/pages/trainer/TrainerHome.jsx
import React from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import {
  Users,
  CalendarClock,
  MessageSquare,
  DollarSign,
  Plus,
  Dumbbell,
  MessageCircle,
  CalendarDays,
  ChevronRight,
  Clock,
} from "lucide-react";
// ← adjust path if needed
import { useTheme } from "../../context/ThemeContext";

const kpi = [
  { label: "Active Clients", value: 24, delta: "+3", Icon: Users },
  { label: "Sessions Today", value: 7, delta: "+1", Icon: CalendarClock },
  { label: "New Messages", value: 12, delta: "+4", Icon: MessageSquare },
  { label: "Earnings (wk)", value: "$1,280", delta: "+8%", Icon: DollarSign },
];

const sessions = [
  { time: "09:30", client: "Suvam Parajuli", type: "Strength • Push Day", status: "Confirmed" },
  { time: "11:00", client: "Adarsh Sapkota", type: "HIIT • Cardio", status: "Confirmed" },
  { time: "13:15", client: "Shrabhya Paudel", type: "Mobility • Lower", status: "Pending" },
  { time: "16:00", client: "Sohan Koirala", type: "Hypertrophy • Pull", status: "Confirmed" },
];

const messages = [
  { name: "Samrat Bam", text: "Can we move tomorrow to 7am?", time: "2m" },
  { name: "Satya Shrestha", text: "Meal plan looks great!", time: "18m" },
  { name: "Ritwiz Acharya", text: "Please review my form video.", time: "1h" },
];

const tasks = [
  { title: "Program: 4-week Hypertrophy (Ritwiz)", done: false },
  { title: "Call lead: Oxford Academy staff intro", done: true },
  { title: "Upload demo: Goblet squat form review", done: false },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", damping: 22, stiffness: 220 } },
};

export default function TrainerHome() {
  const { darkMode } = useTheme();

  // mirror your Navbar color strategy
  const baseBg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const baseText = darkMode ? "text-gray-100" : "text-gray-900";
  const mutedText = darkMode ? "text-gray-300" : "text-gray-600";
  const cardBg = darkMode ? "bg-gray-900/60" : "bg-white";
  const cardBorder = darkMode ? "border-gray-800" : "border-gray-200";
  const hoverRow = darkMode ? "hover:bg-gray-900/70" : "hover:bg-gray-100";
  const chipGood = darkMode ? "text-emerald-400" : "text-emerald-600";

  const Button = ({ children, variant = "solid", className = "", ...props }) => {
    const base =
      "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors";
    const styles =
      variant === "outline"
        ? `${darkMode ? "border-gray-700 text-gray-100 hover:bg-gray-900" : "border-gray-300 text-gray-900 hover:bg-gray-100"} border`
        : `${darkMode ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`;
    return (
      <button className={`${base} ${styles} ${className}`} {...props}>
        {children}
      </button>
    );
  };

  const Badge = ({ children, tone = "default" }) => {
    const cls =
      tone === "default"
        ? `s${darkMode ? "bg-indigo-600/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`
        : `${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"}`;
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
  };

  const Progress = ({ value }) => (
    <div className={` transition-colors duration-200 h-2 w-full overflow-hidden rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}>
      <div
        className="h-full rounded-full bg-indigo-600"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );

  return (
    <div className={`min-h-screen ${baseBg} ${baseText} transition-colors duration-200`}>


      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, Coach 👋</h1>
            <p className={`mt-1 text-sm ${mutedText}`}>Here’s your snapshot for today. Let’s crush it.</p>
          </div>
         
        </motion.div>

        {/* KPI cards */}
        {/* KPI cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {kpi.map(({ label, value, delta, Icon }, idx) => (
            <motion.div variants={item} key={idx}>
              <div className={`transition-colors duration-200 overflow-hidden rounded-2xl border ${cardBorder} ${cardBg} p-4`}>
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-sm font-medium ${mutedText}`}>{label}</span>
                  {/* FIX: Call Icon as a component */}
                  {Icon && <Icon className="h-6 w-6" />}
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <p className={`mt-1 text-xs ${chipGood}`}>{delta} this week</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className={`transition-colors duration-200 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`}>
          {/* Left column */}
          <div className="space-y-6 xl:col-span-2">
            {/* Today's Schedule */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <div className={`transition-colors duration-200 rounded-2xl border ${cardBorder} ${cardBg}`}>
                <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <CalendarDays className="h-5 w-5" />
                    Today’s Schedule
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Add Program
                    </Button>
                    <Button className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Message Client
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
                  {/* Sessions list */}
                  <div className="space-y-3">
                    {sessions.map((s, i) => (
                      <div
                        key={i}
                        className={`group flex items-start justify-between rounded-2xl border ${cardBorder} p-4 transition-colors ${hoverRow}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full border p-2 ${cardBorder}`}>
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{s.time}</p>
                              <Badge tone={s.status === "Confirmed" ? "default" : "secondary"}>{s.status}</Badge>
                            </div>
                            <p className="text-sm">{s.client}</p>
                            <p className={`text-xs ${mutedText}`}>{s.type}</p>
                          </div>
                        </div>
                        <button
                          aria-label="Open session"
                          className="rounded-lg p-1 opacity-0 transition-opacity hover:bg-indigo-600/10 group-hover:opacity-100"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Weekly progress */}
                  <div className={`transition-colors duration-200 rounded-2xl border ${cardBorder} p-4`}>
                    <p className="mb-2 text-sm font-semibold">Weekly Target</p>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className={mutedText}>Sessions</span>
                          <span>28 / 35</span>
                        </div>
                        <Progress value={80} />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className={mutedText}>Program Updates</span>
                          <span>12 / 15</span>
                        </div>
                        <Progress value={72} />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className={mutedText}>Check-ins</span>
                          <span>18 / 20</span>
                        </div>
                        <Progress value={90} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <div className={`transition-colors duration-200 rounded-2xl border ${cardBorder} ${cardBg}`}>
                <div className="border-b p-4 text-lg font-semibold">Trainer Tasks</div>
                <div className="space-y-3 p-4">
                  {tasks.map((t, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border ${cardBorder} px-4 py-3 transition-colors ${hoverRow}`}
                    >
                      <input type="checkbox" defaultChecked={t.done} className="h-4 w-4 accent-indigo-600" />
                      <span className={`text-sm ${t.done ? "line-through opacity-70" : ""}`}>{t.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Messages */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <div className={`transition-colors duration-200 rounded-2xl border ${cardBorder} ${cardBg}`}>
                <div className="border-b p-4 text-lg font-semibold">Recent Messages</div>
                <div className="space-y-3 p-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-start justify-between rounded-xl border ${cardBorder} p-3 transition-colors ${hoverRow}`}
                    >
                      <div>
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className={`text-xs ${mutedText}`}>{m.text}</p>
                      </div>
                      <span className={`text-[11px] ${mutedText}`}>{m.time}</span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Open Inbox
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              <div className={`transition-colors duration-200 rounded-2xl border ${cardBorder} ${cardBg}`}>
                <div className="border-b p-4 text-lg font-semibold">Quick Actions</div>
                <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 ">
                  <Button className="justify-start gap-2" variant="outline">
                    <Dumbbell className="h-4 w-4" />
                    Create Program
                  </Button>
                  <Button className="justify-start gap-2 " variant="outline">
                    <CalendarClock className="h-4 w-4" />
                    Schedule Session
                  </Button>
                  <Button className="justify-start gap-2" variant="outline">
                    <Users className="h-4 w-4" />
                    Add Client
                  </Button>
                  <Button className="justify-start gap-2" variant="outline">
                    <DollarSign className="h-4 w-4" />
                    Record Payment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
