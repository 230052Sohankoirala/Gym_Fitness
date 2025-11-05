// src/pages/trainer/TrainerAnalytics.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* ---------- small helpers ---------- */
const safeName = (u) => u?.fullname || u?.name || u?.email || "Client";

/* ---------- SVG bar chart (no extra deps) ---------- */
const BarChart = ({ data, width = 900, height = 420, padding = 48 }) => {
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const barW = chartW / Math.max(1, values.length);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sessions per client bar chart"
      style={{ display: "block" }}
    >
      {/* bg */}
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
      {/* axes */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ddd" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ddd" />
      {/* y ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = height - padding - t * chartH;
        const val = Math.round(max * t);
        return (
          <g key={i}>
            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#f3f3f3" />
            <text x={padding - 8} y={y + 4} fontSize="11" textAnchor="end" fill="#666">
              {val}
            </text>
          </g>
        );
      })}

      {/* bars */}
      {values.map((v, i) => {
        const h = (v / max) * chartH;
        const x = padding + i * barW + barW * 0.15;
        const y = height - padding - h;
        const w = barW * 0.7;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="#4f46e5" rx="6" />
            <text x={x + w / 2} y={y - 6} fontSize="11" textAnchor="middle" fill="#333">
              {v}
            </text>
          </g>
        );
      })}

      {/* x labels (rotate if many) */}
      {labels.map((lbl, i) => {
        const x = padding + i * barW + barW / 2;
        const y = height - padding + 14;
        const rotate = labels.length > 8;
        return rotate ? (
          <g key={i} transform={`translate(${x},${y + 10}) rotate(-35)`}>
            <text fontSize="10" textAnchor="end" fill="#555">
              {lbl}
            </text>
          </g>
        ) : (
          <text key={i} x={x} y={y + 12} fontSize="10" textAnchor="middle" fill="#555">
            {lbl}
          </text>
        );
      })}
    </svg>
  );
};

/* ---------- MOCK, UI-ONLY DATA ---------- */
const MOCK_TRAINER_NAME = "Your Name";
const MOCK_SESSIONS = [
  {
    _id: "s1",
    title: "Strength Fundamentals",
    date: "2025-11-03",
    time: "07:00–08:00",
    clientsEnrolled: [{ fullname: "Asha K" }, { fullname: "Bikram T" }],
  },
  {
    _id: "s2",
    title: "Mobility & Core",
    date: "2025-11-04",
    time: "18:00–19:00",
    clientsEnrolled: [{ fullname: "Asha K" }],
  },
  {
    _id: "s3",
    title: "HIIT Express",
    date: "2025-11-05",
    time: "17:30–18:10",
    clientsEnrolled: [{ fullname: "Chris L" }, { fullname: "Asha K" }, { fullname: "Deepa S" }],
  },
  {
    _id: "s4",
    title: "Yoga Flow",
    date: "2025-11-06",
    time: "06:30–07:15",
    clientsEnrolled: [{ fullname: "Deepa S" }],
  },
];

export default function TrainerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [trainerName, setTrainerName] = useState("Trainer");
  const [sessions, setSessions] = useState([]);
  const [error] = useState("");

  // container ref for PDF capture
  const pdfRef = useRef(null);

  // simulate load (no backend)
  useEffect(() => {
    const t = setTimeout(() => {
      setTrainerName(MOCK_TRAINER_NAME);
      setSessions(MOCK_SESSIONS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // aggregate: count sessions per client
  const rows = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      (s?.clientsEnrolled || []).forEach((u) => {
        const name = safeName(u);
        map.set(name, (map.get(name) || 0) + 1);
      });
    });
    const arr = Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    arr.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
    return arr;
  }, [sessions]);

  const totals = useMemo(() => {
    const uniqueClients = new Set();
    sessions.forEach((s) => (s?.clientsEnrolled || []).forEach((u) => uniqueClients.add(safeName(u))));
    return {
      totalSessions: sessions.length,
      uniqueClients: uniqueClients.size,
      totalEnrollments: rows.reduce((acc, r) => acc + r.value, 0),
    };
  }, [sessions, rows]);

  /* -------- PDF Export (html-to-image → html2canvas fallback) -------- */
  const exportPdf = async () => {
    const node = pdfRef.current;
    if (!node) return;

    node.classList.add("pdf-safe");
    try {
      let dataUrl;
      try {
        dataUrl = await toPng(node, { cacheBust: true, backgroundColor: "#ffffff" });
      } catch {
        const canvas = await html2canvas(node, {
          scale: 2,
          backgroundColor: "#ffffff",
          foreignObjectRendering: true,
          windowWidth: node.scrollWidth,
          windowHeight: node.scrollHeight,
        });
        dataUrl = canvas.toDataURL("image/png");
      }

      const pdf = new jsPDF({ unit: "pt", format: "a4" }); // 595 x 842 pt
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const img = new Image();
      await new Promise((res) => {
        img.onload = res;
        img.src = dataUrl;
      });

      const margin = 24;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;

      let w = img.width,
        h = img.height;
      const ratio = Math.min(maxW / w, maxH / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);

      const x = Math.round((pageW - w) / 2);
      const y = Math.round((pageH - h) / 2);

      pdf.addImage(dataUrl, "PNG", x, y, w, h);
      pdf.save(`Trainer_Analytics_${trainerName.replace(/\s+/g, "_")}.pdf`);
    } finally {
      node.classList.remove("pdf-safe");
    }
  };

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <div className="p-6">
        <p>Loading analytics…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Trainer Analytics</h1>
          <button
            onClick={exportPdf}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500"
          >
            Export PDF
          </button>
        </div>

        {/* capture area */}
        <div
          ref={pdfRef}
          className="rounded-xl border border-gray-200 p-16 bg-white shadow-sm overflow-hidden"
          style={{ color: "#111" }}
        >
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-xl font-bold" style={{ color: "#111" }}>
              {trainerName} — Sessions per Client
            </h2>
            <p className="text-sm" style={{ color: "#555" }}>
              Total sessions: {totals.totalSessions} • Unique clients: {totals.uniqueClients} • Enrollments:{" "}
              {totals.totalEnrollments}
            </p>
          </div>

          {/* Chart */}
          <div className="mb-10">
            <BarChart data={rows.length ? rows : [{ label: "No Data", value: 0 }]} />
          </div>

          {/* Table */}
          <div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f8f8f8" }}>
                  {["#", "Client", "Sessions"].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: i === 2 ? "right" : "left",
                        padding: "10px 12px",
                        borderBottom: "1px solid #e5e5e5",
                        color: "#444",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.label} style={{ borderBottom: "1px solid #f1f1f1" }}>
                    <td style={{ padding: "10px 12px", color: "#222" }}>{i + 1}</td>
                    <td style={{ padding: "10px 12px", color: "#222" }}>{r.label}</td>
                    <td style={{ padding: "10px 12px", color: "#222", textAlign: "right" }}>{r.value}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={3} style={{ padding: "10px 12px", color: "#666" }}>
                      No enrollments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-500">Tip: the chart counts how many of your sessions each client has joined.</p>
      </div>
    </div>
  );
}
