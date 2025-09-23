import React, { useMemo } from "react";// eslint-disable-line no-unused-vars
import { DollarSign, Receipt, CreditCard, RefreshCcw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const AdminPayments = () => {
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  // Mock KPI data
  const stats = [
    { label: "Total Revenue", value: "$45,200", icon: <DollarSign size={18} />, delta: "+12.4%" },
    { label: "Pending Invoices", value: "18", icon: <Receipt size={18} />, delta: "-2" },
    { label: "Completed Payments", value: "342", icon: <CreditCard size={18} />, delta: "+23" },
    { label: "Refunds", value: "$1,250", icon: <RefreshCcw size={18} />, delta: "+3" },
  ];

  // Mock transactions
  const transactions = [
    { id: 1, user: "Adarsh Sapkota", amount: "$120", method: "Credit Card", status: "Completed", date: "2025-09-21" },
    { id: 2, user: "Suvam Parajuli", amount: "$90", method: "PayPal", status: "Pending", date: "2025-09-20" },
    { id: 3, user: "Shrabhya Paudel", amount: "$150", method: "Bank Transfer", status: "Completed", date: "2025-09-19" },
    { id: 4, user: "Sohan Koirala", amount: "$200", method: "Credit Card", status: "Refunded", date: "2025-09-18" },
  ];

  const cardBase =
    "rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200";
  const cardTheme = darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const subText = darkMode ? "text-gray-300" : "text-gray-600";
  const borderSoft = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-200 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 transition-colors duration-200">
        Admin – Payments
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`${cardBase} ${cardTheme}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-80">{s.label}</div>
              <div
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                {s.icon}
              </div>
            </div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
            <div className={`mt-1 text-xs ${subText}`}>
              vs last period {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className={`${cardBase} ${cardTheme}`}>
        <h3 className="font-semibold mb-3">Recent Transactions</h3>
        <div
          className={`rounded-xl border overflow-x-auto transition-colors duration-200 ${borderSoft}`}
        >
          <table className="min-w-full text-sm">
            <thead
              className={`transition-colors duration-200 ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <tr>
                <Th>User</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr
                  key={t.id}
                  className={`transition-colors duration-200 ${
                    i % 2
                      ? darkMode
                        ? "bg-gray-800/60"
                        : "bg-white"
                      : darkMode
                      ? "bg-gray-800/30"
                      : "bg-gray-50"
                  } ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <Td>{t.user}</Td>
                  <Td>{t.amount}</Td>
                  <Td>{t.method}</Td>
                  <Td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                        t.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : t.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {t.status}
                    </span>
                  </Td>
                  <Td>{t.date}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------- small building blocks ---------- */
const Th = ({ children }) => (
  <th className="text-left px-4 py-2 font-medium transition-colors duration-200">
    {children}
  </th>
);

const Td = ({ children }) => (
  <td className="px-4 py-2 whitespace-nowrap transition-colors duration-200">
    {children}
  </td>
);

export default AdminPayments;
