import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Receipt,
  CreditCard,
  RefreshCcw,
  Search,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const AdminPayments = () => {
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  const token = useMemo(() => localStorage.getItem("token"), []);
  const api = useMemo(() => {
    return axios.create({
      baseURL: "http://localhost:4000/api",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [token]);

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAdminShare: 0,
    totalTrainerShare: 0,
    totalRefunded: 0,
    completedCount: 0,
    pendingCount: 0,
    refundCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const formatCurrency = (amountInCents = 0) => {
    return `$${(Number(amountInCents || 0) / 100).toFixed(2)}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
  };

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await api.get("/admin/payments", {
        params: {
          search,
          status,
        },
      });

      setPayments(Array.isArray(res?.data?.payments) ? res.data.payments : []);
      setStats(
        res?.data?.stats || {
          totalRevenue: 0,
          totalAdminShare: 0,
          totalTrainerShare: 0,
          totalRefunded: 0,
          completedCount: 0,
          pendingCount: 0,
          refundCount: 0,
        }
      );
    } catch (err) {
      console.error("Failed to fetch admin payments:", err?.response?.data || err?.message);
      setErrorMsg(err?.response?.data?.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [api, search, status]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarSign size={18} />,
      sub: "All recorded payments",
    },
    {
      label: "Admin Share",
      value: formatCurrency(stats.totalAdminShare),
      icon: <Receipt size={18} />,
      sub: "Platform earnings",
    },
    {
      label: "Completed Payments",
      value: String(stats.completedCount || 0),
      icon: <CreditCard size={18} />,
      sub: "Succeeded payments",
    },
    {
      label: "Refunded Amount",
      value: formatCurrency(stats.totalRefunded),
      icon: <RefreshCcw size={18} />,
      sub: "Refund total",
    },
  ];

  const pageBg = darkMode
    ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white"
    : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900";

  const cardBg = darkMode
    ? "bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl"
    : "bg-white/80 backdrop-blur-lg border border-gray-200 shadow-lg";

  const inputBg = darkMode
    ? "bg-gray-900/70 border border-gray-700 text-white placeholder-gray-400"
    : "bg-white border border-gray-300 text-gray-900";

  const subText = darkMode ? "text-gray-300" : "text-gray-600";
  const borderSoft = darkMode ? "border-white/10" : "border-gray-200";

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 ${pageBg}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin – Payments</h1>
            <p className={`mt-1 text-sm ${subText}`}>
              View all payment records, platform share, trainer share, and refunds.
            </p>
          </div>

          <button
            onClick={fetchPayments}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${darkMode
                ? "bg-white/5 border border-white/10 hover:bg-white/10"
                : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${darkMode
                ? "bg-red-500/10 border-red-500/20 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
              }`}
          >
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Filters */}
        <div className={`rounded-2xl p-4 mb-6 ${cardBg}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${subText}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member, trainer, session..."
                className={`w-full pl-10 p-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${inputBg}`}
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`p-3 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            >
              <option value="all">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially Refunded</option>
            </select>

            <button
              onClick={fetchPayments}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-md hover:shadow-xl"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm opacity-80">{item.label}</div>
                <div
                  className={`p-2 rounded-xl ${darkMode ? "bg-white/10" : "bg-gray-100"
                    }`}
                >
                  {item.icon}
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold">{item.value}</div>
              <div className={`mt-1 text-xs ${subText}`}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Payments Table */}
        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Payment Transactions</h3>
              <p className={`text-sm mt-1 ${subText}`}>
                {loading ? "Loading payments..." : `${payments.length} payment(s) found`}
              </p>
            </div>
          </div>

          <div className={`rounded-2xl border overflow-x-auto ${borderSoft}`}>
            <table className="min-w-full text-sm">
              <thead className={darkMode ? "bg-white/5" : "bg-gray-100"}>
                <tr>
                  <Th>User</Th>
                  <Th>Trainer</Th>
                  <Th>Session</Th>
                  <Th>Total</Th>
                  <Th>Admin Share</Th>
                  <Th>Trainer Share</Th>
                  <Th>Method</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>

              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment, index) => {
                    const memberName =
                      payment?.member?.fullname ||   // 🔥 THIS is your actual field
                      payment?.member?.fullName ||
                      payment?.member?.name ||
                      "Unknown Member";

                    const trainerName =
                      payment?.trainer?.name || "Unknown Trainer";

                    const sessionType =
                      payment?.session?.type || "N/A";

                    return (
                      <tr
                        key={payment._id}
                        className={`transition-all duration-300 ${index % 2 === 0
                            ? darkMode
                              ? "bg-white/[0.03]"
                              : "bg-white"
                            : darkMode
                              ? "bg-white/[0.01]"
                              : "bg-gray-50"
                          } ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                      >
                        <Td>
                          <div className="font-medium">{memberName}</div>
                          <div className={`text-xs ${subText}`}>
                            {payment?.member?.email || "No email"}
                          </div>
                        </Td>

                        <Td>
                          <div className="font-medium">{trainerName}</div>
                          <div className={`text-xs ${subText}`}>
                            {payment?.trainer?.email || "No email"}
                          </div>
                        </Td>

                        <Td>
                          <div className="font-medium">{sessionType}</div>
                          <div className={`text-xs ${subText}`}>
                            {payment?.session?.status || "N/A"}
                          </div>
                        </Td>

                        <Td>{formatCurrency(payment.amountTotal)}</Td>
                        <Td>{formatCurrency(payment.adminShare)}</Td>
                        <Td>{formatCurrency(payment.trainerShare)}</Td>
                        <Td>{payment.method || "card"}</Td>
                        <Td>
                          <StatusBadge status={payment.status} />
                        </Td>
                        <Td>{formatDate(payment.createdAt)}</Td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center opacity-70">
                      {loading ? "Loading..." : "No payments found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Th = ({ children }) => {
  return (
    <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">
      {children}
    </th>
  );
};

const Td = ({ children }) => {
  return (
    <td className="px-4 py-3 whitespace-nowrap align-top">
      {children}
    </td>
  );
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();

  let classes =
    "px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center";

  if (normalized === "succeeded") {
    classes += " bg-green-100 text-green-700";
  } else if (normalized === "pending") {
    classes += " bg-yellow-100 text-yellow-700";
  } else if (
    normalized === "refunded" ||
    normalized === "partially_refunded"
  ) {
    classes += " bg-red-100 text-red-700";
  } else {
    classes += " bg-gray-100 text-gray-700";
  }

  return <span className={classes}>{status || "unknown"}</span>;
};

export default AdminPayments;