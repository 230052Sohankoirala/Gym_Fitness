import React, { useMemo, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import jsPDF from "jspdf";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function UserProgress() {
  const { darkMode } = useTheme();

  // ---------- Challenge Catalog ----------
  const CHALLENGES = ["HIIT Blast", "Strength Day", "Yoga & Mobility", "Rest & Recovery"];
  const [challenge, setChallenge] = useState("HIIT Blast");

  // in-progress session state
  const [inProgress, setInProgress] = useState(false);
  const [duration, setDuration] = useState(45);   // minutes
  const [intensity, setIntensity] = useState(1);  // 0.5 - 1.5

  // Completed logs: { date:"YYYY-MM-DD", challenge, duration, intensity, calories }
  const [logs, setLogs] = useState([]);

  // ---------- Utilities ----------
  const fmtKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const labelOf = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const today = new Date();
  const todayKey = fmtKey(today);

  // last 14 days (labels & keys)
  const last14 = useMemo(() => {
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push({ key: fmtKey(d), label: labelOf(d) });
    }
    return arr;
  }, []);

  // Current week (Mon-Sun) for weekly calories
  const weekDays = useMemo(() => {
    const d = new Date();
    const day = d.getDay(); // 0=Sun...6=Sat
    const mondayOffset = ((day + 6) % 7); // days since Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() - mondayOffset);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const di = new Date(monday);
      di.setDate(monday.getDate() + i);
      days.push({ key: fmtKey(di), label: di.toLocaleDateString(undefined, { weekday: "short" }) });
    }
    return days;
  }, []);

  // ---------- Challenge Profiles ----------
  const profileFor = (name) => {
    switch (name) {
      case "Strength Day":
        return {
          baseCalories: 480, // base per ~45min
          performance: { Strength: 90, Endurance: 70, Flexibility: 55, Speed: 65, Consistency: 85 },
          split: { Cardio: 20, Strength: 55, Yoga: 10, HIIT: 15 }
        };
      case "Yoga & Mobility":
        return {
          baseCalories: 260,
          performance: { Strength: 60, Endurance: 65, Flexibility: 90, Speed: 60, Consistency: 80 },
          split: { Cardio: 15, Strength: 15, Yoga: 55, HIIT: 15 }
        };
      case "Rest & Recovery":
        return {
          baseCalories: 140,
          performance: { Strength: 55, Endurance: 60, Flexibility: 70, Speed: 55, Consistency: 95 },
          split: { Cardio: 10, Strength: 15, Yoga: 45, HIIT: 30 }
        };
      default: // HIIT Blast
        return {
          baseCalories: 620,
          performance: { Strength: 75, Endurance: 85, Flexibility: 60, Speed: 90, Consistency: 80 },
          split: { Cardio: 35, Strength: 25, Yoga: 10, HIIT: 30 }
        };
    }
  };

  // ---------- Start / Complete Challenge ----------
  const startChallenge = () => {
    if (inProgress) return;
    setInProgress(true);
  };

  const completeChallenge = () => {
    if (!inProgress) return;
    const prof = profileFor(challenge);
    const cal = Math.round(prof.baseCalories * (duration / 45) * intensity);

    setLogs((prev) => {
      // If a log already exists today, replace it (one completion/day)
      const others = prev.filter(l => l.date !== todayKey);
      return [...others, { date: todayKey, challenge, duration, intensity, calories: cal }];
    });

    setInProgress(false);
  };

  // ---------- Derived Data from Logs ----------
  const logsByDate = useMemo(() => {
    const map = {};
    for (const l of logs) {
      map[l.date] = (map[l.date] || 0) + 1;
    }
    return map;
  }, [logs]);

  // Daily login (1 if completed challenge that day)
  const dailyLoginSeries = useMemo(() => {
    return last14.map(d => (logsByDate[d.key] ? 1 : 0));
  }, [last14, logsByDate]);

  // Streak (cumulative, resets on 0) over last 14 days
  const streakSeries = useMemo(() => {
    let run = 0;
    return dailyLoginSeries.map(v => (run = v ? run + 1 : 0));
  }, [dailyLoginSeries]);

  // Weekly calories: sum calories of logs within current week
  const weeklyCalories = useMemo(() => {
    const map = Object.create(null);           // no prototype
    for (const day of weekDays) map[day.key] = 0;
    for (const l of logs) {
      if (l.date in map) map[l.date] += l.calories;
    }
    return weekDays.map(d => map[d.key]);
  }, [logs, weekDays]);

  // Workout distribution: sum split across logs from last 7 days
  const last7Keys = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(fmtKey(d));
    }
    return arr;
  }, []);
  const distribution = useMemo(() => {
    const totals = { Cardio: 0, Strength: 0, Yoga: 0, HIIT: 0 };
    let sessions = 0;
    for (const l of logs) {
      if (!last7Keys.includes(l.date)) continue;
      const p = profileFor(l.challenge).split;
      totals.Cardio += p.Cardio;
      totals.Strength += p.Strength;
      totals.Yoga += p.Yoga;
      totals.HIIT += p.HIIT;
      sessions++;
    }
    if (sessions === 0) return [0, 0, 0, 0];
    return [
      totals.Cardio / sessions,
      totals.Strength / sessions,
      totals.Yoga / sessions,
      totals.HIIT / sessions
    ];
  }, [logs, last7Keys]);

  // Performance: average challenge performance over last 7 days
  const performanceCurrent = useMemo(() => {
    const acc = { Strength: 0, Endurance: 0, Flexibility: 0, Speed: 0, Consistency: 0 };
    let n = 0;
    for (const l of logs) {
      if (!last7Keys.includes(l.date)) continue;
      const p = profileFor(l.challenge).performance;
      acc.Strength += p.Strength;
      acc.Endurance += p.Endurance;
      acc.Flexibility += p.Flexibility;
      acc.Speed += p.Speed;
      acc.Consistency += p.Consistency;
      n++;
    }
    if (n === 0) {
      // no history → show selected challenge baseline so UI isn't empty
      return profileFor(challenge).performance;
    }
    return {
      Strength: Math.round(acc.Strength / n),
      Endurance: Math.round(acc.Endurance / n),
      Flexibility: Math.round(acc.Flexibility / n),
      Speed: Math.round(acc.Speed / n),
      Consistency: Math.round(acc.Consistency / n)
    };
  }, [logs, last7Keys, challenge]);

  // ---------- Chart Refs (for PDF export) ----------
  const streakRef = useRef(null);
  const dailyLoginRef = useRef(null);
  const caloriesRef = useRef(null);
  const doughnutRef = useRef(null);
  const radarRef = useRef(null);

  // ---------- Chart Data ----------
  const streakData = {
    labels: last14.map(d => d.label),
    datasets: [
      {
        label: "Login Streak (Cumulative)",
        data: streakSeries,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.35,
        fill: true,
        pointRadius: 3
      }
    ]
  };

  const dailyLoginData = {
    labels: last14.map(d => d.label),
    datasets: [
      {
        label: "Daily Login (1=Logged In, 0=Missed)",
        data: dailyLoginSeries,
        backgroundColor: "rgba(16, 185, 129, 0.45)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const caloriesData = {
    labels: weekDays.map(d => d.label),
    datasets: [
      {
        label: "Calories Burned (This Week)",
        data: weeklyCalories,
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1
      }
    ]
  };

  const workoutDistributionData = {
    labels: ["Cardio", "Strength", "Yoga", "HIIT"],
    datasets: [
      {
        label: "Workout Distribution (last 7 days)",
        data: distribution,
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 159, 64, 0.7)"
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 159, 64, 1)"
        ],
        borderWidth: 1
      }
    ]
  };

  const performanceData = {
    labels: ["Strength", "Endurance", "Flexibility", "Speed", "Consistency"],
    datasets: [
      {
        label: "Current (from completed challenges)",
        data: [
          performanceCurrent.Strength,
          performanceCurrent.Endurance,
          performanceCurrent.Flexibility,
          performanceCurrent.Speed,
          performanceCurrent.Consistency
        ],
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        borderColor: "rgba(79, 70, 229, 1)",
        pointBackgroundColor: "rgba(79, 70, 229, 1)"
      },
      {
        label: "Last Month (static demo)",
        data: [70, 65, 60, 70, 75],
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        borderColor: "rgba(239, 68, 68, 1)",
        pointBackgroundColor: "rgba(239, 68, 68, 1)"
      }
    ]
  };

  // ---------- Chart Options ----------
  const baseOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { color: darkMode ? "#e5e7eb" : "#374151" }
      },
      title: {
        display: true,
        text: title,
        color: darkMode ? "#e5e7eb" : "#374151",
        font: { size: 16, weight: "bold" }
      }
    },
    scales: {
      y: {
        grid: { color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
        ticks: { color: darkMode ? "#e5e7eb" : "#374151" }
      },
      x: {
        grid: { color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
        ticks: { color: darkMode ? "#e5e7eb" : "#374151" }
      }
    },
    maintainAspectRatio: false
  });

  const streakOptions = useMemo(() => ({
    ...baseOptions("Login Streak (Cumulative)"),
    scales: {
      ...baseOptions("").scales,
      y: {
        ...baseOptions("").scales.y,
        suggestedMin: 0,
        suggestedMax: Math.max(...streakSeries, 5) + 1
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [darkMode, streakSeries]);

  const dailyLoginOptions = useMemo(() => ({
    ...baseOptions("Daily Login (Last 14 Days)"),
    scales: {
      ...baseOptions("").scales,
      y: {
        ...baseOptions("").scales.y,
        min: 0,
        max: 1,
        ticks: { ...baseOptions("").scales.y.ticks, stepSize: 1 }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [darkMode]);

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top", labels: { color: darkMode ? "#e5e7eb" : "#374151" } },
      title: {
        display: true,
        text: "Performance (from your completed challenges)",
        color: darkMode ? "#e5e7eb" : "#374151",
        font: { size: 16, weight: "bold" }
      }
    },
    scales: {
      r: {
        angleLines: { color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
        grid: { color: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
        pointLabels: { color: darkMode ? "#e5e7eb" : "#374151" },
        ticks: { backdropColor: "transparent", color: darkMode ? "#e5e7eb" : "#374151" }
      }
    },
    maintainAspectRatio: false
  };

  // ---------- PDF Export ----------
  const downloadPDF = () => {
    const pdf = new jsPDF("landscape", "pt", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin + 20;

    pdf.setFontSize(16);
    pdf.text(`My Progress Report — ${new Date().toLocaleDateString()}`, margin, margin);
    pdf.setFontSize(12);
    pdf.text(`Selected Challenge: ${challenge}`, margin, margin + 14);

    const addChart = (ref, title) => {
      const chart = ref.current;
      if (!chart) return;
      const canvas = chart.canvas;
      const img = canvas.toDataURL("image/png", 1.0);
      const maxW = pageW - margin * 2;
      const ratio = canvas.height / canvas.width;
      const h = maxW * ratio;

      if (y + h + 30 > pageH - margin) {
        pdf.addPage();
        y = margin + 10;
      }
      pdf.setFontSize(12);
      pdf.text(title, margin, y);
      y += 10;
      pdf.addImage(img, "PNG", margin, y, maxW, h);
      y += h + 20;
    };

    addChart(streakRef, "Login Streak (Cumulative)");
    addChart(dailyLoginRef, "Daily Login (1/0)");
    addChart(caloriesRef, "Weekly Calories (from completed challenges)");
    addChart(doughnutRef, "Workout Distribution (last 7 days)");
    addChart(radarRef, "Performance (from completed challenges)");

    pdf.save("progress-all-charts.pdf");
  };

  // ---------- Render ----------
  return (
    <div className={`p-6 space-y-6 max-w-6xl mx-auto min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Fitness Progress</h1>

        {/* Challenge Selector */}
        <div className="flex flex-wrap gap-2">
          {CHALLENGES.map(c => (
            <button
              key={c}
              onClick={() => setChallenge(c)}
              disabled={inProgress} // lock selection during a session
              className={`px-3 py-1 rounded border text-sm ${challenge === c
                ? (darkMode ? "bg-white text-black" : "bg-zinc-900 text-white")
                : (darkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-gray-100 text-gray-800 border-gray-200")
                } ${inProgress ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={downloadPDF}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
            }`}
        >
          <span>Download PDF</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Challenge Control Card */}
      <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Today’s Challenge</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{challenge}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration (min)</span>
              <input
                type="number" min="10" max="180" step="5"
                className={`w-24 px-2 py-1 rounded border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={!inProgress}
              />
            </label>

            <label className="flex items-center gap-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Intensity</span>
              <input
                type="range" min="0.5" max="1.5" step="0.1"
                className="w-40"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                disabled={!inProgress}
              />
              <span className="w-10 text-center">{intensity.toFixed(1)}×</span>
            </label>

            {!inProgress ? (
              <button
                onClick={startChallenge}
                className={`${darkMode ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} px-4 py-2 rounded-lg`}
              >
                Start Challenge
              </button>
            ) : (
              <button
                onClick={completeChallenge}
                className={`${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-4 py-2 rounded-lg`}
              >
                Complete Challenge
              </button>
            )}
          </div>
        </div>

        {/* Helpful hint */}
        <p className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Completing the challenge adds a log for <b>{today.toLocaleDateString()}</b>. Charts update only when you complete.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-900'}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-orange-500">🔥</span> Current Streak
          </h2>
          <div className="text-3xl font-bold mt-2">{Math.max(...streakSeries, 0)} Days</div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>In a row from your completed challenges.</p>
        </div>

        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-900'}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-green-500">📆</span> Week Calories (avg)
          </h2>
          <div className="text-3xl font-bold mt-2">
            {(() => {
              const sum = weeklyCalories.reduce((a, b) => a + b, 0);
              return Math.round(sum / 7);
            })()} kcal
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Only from completed sessions this week.</p>
        </div>

        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-900'}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-blue-500">✅</span> Sessions (7d)
          </h2>
          <div className="text-3xl font-bold mt-2">
            {logs.filter(l => last7Keys.includes(l.date)).length}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed challenges in the last 7 days.</p>
        </div>

        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white text-gray-900'}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-purple-500">🏁</span> Today
          </h2>
          <div className="text-base mt-2">
            {logsByDate[todayKey] ? "Completed 🎉" : inProgress ? "In Progress…" : "Not started"}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start & complete to update charts.</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Streak */}
        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Progress — Login Streak</h3>
          <div className="h-72">
            <Line ref={streakRef} data={streakData} options={streakOptions} />
          </div>
        </div>

        {/* Daily Login */}
        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Daily Login</h3>
          <div className="h-72">
            <Bar ref={dailyLoginRef} data={dailyLoginData} options={dailyLoginOptions} />
          </div>
        </div>

        {/* Workout Distribution */}
        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Workout Distribution</h3>
          <div className="h-72">
            <Doughnut ref={doughnutRef} data={workoutDistributionData} options={baseOptions("Workout Types")} />
          </div>
        </div>

        {/* Performance */}
        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Performance Analysis</h3>
          <div className="h-72">
            <Radar ref={radarRef} data={performanceData} options={radarOptions} />
          </div>
        </div>

        {/* Weekly Calories */}
        <div className={`border rounded-xl p-4 shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} lg:col-span-2`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Calories</h3>
          <div className="h-72">
            <Bar ref={caloriesRef} data={caloriesData} options={baseOptions("Calories Burned (This Week)")} />
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className={`border rounded-xl p-4 shadow transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gamification Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: "First Workout", emoji: "🏆", earned: true },
            { name: "5-Week Goal", emoji: "🎯", earned: true },
            { name: "Streak Master", emoji: "🔥", earned: true },
            { name: "Consistency King", emoji: "👑", earned: true },
            { name: "Marathon Runner", emoji: "🏃", earned: false },
            { name: "Early Bird", emoji: "🐦", earned: false },
          ].map((badge, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-4 rounded-lg ${badge.earned
                ? darkMode ? 'bg-indigo-900/30 border border-indigo-700' : 'bg-indigo-100 border border-indigo-200'
                : darkMode ? 'bg-gray-700 opacity-50' : 'bg-gray-100 opacity-50'
                }`}
            >
              <span className="text-3xl mb-2">{badge.emoji}</span>
              <span className={`text-sm font-medium text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {badge.name}
              </span>
              <span className={`text-xs mt-1 ${badge.earned ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                {badge.earned ? 'Earned' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
