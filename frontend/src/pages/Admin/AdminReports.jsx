import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Download,
    RefreshCw,
    AlertCircle,
    FileText,
    Users,
    Activity,
    DollarSign,
    Shield,
    UserCircle,
    BadgeCheck,
    BadgeX,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const BASE_URL = "http://localhost:4000";

function getToken() {
    return localStorage.getItem("token");
}

/** ---------- Helpers: CSV + downloads ---------- */
function safe(v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/\s+/g, " ").trim();
}

function toCSV(rows, headers) {
    // headers: [{ key:"email", label:"Email" }, ...]
    const headerLine = headers.map((h) => `"${safe(h.label).replaceAll('"', '""')}"`).join(",");
    const lines = rows.map((r) =>
        headers
            .map((h) => `"${safe(r?.[h.key]).replaceAll('"', '""')}"`)
            .join(",")
    );
    return [headerLine, ...lines].join("\n");
}

function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function formatMoney(n, currency = "AUD") {
    const val = Number(n || 0);
    try {
        return new Intl.NumberFormat("en-AU", { style: "currency", currency }).format(val);
    } catch {
        return `${currency} ${val.toFixed(2)}`;
    }
}

function formatDateTime(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return safe(d);
    return dt.toLocaleString();
}

const AdminReports = () => {
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // report data
    const [stats, setStats] = useState({ members: 0, trainers: 0, sessions: 0 });
    const [revenue, setRevenue] = useState({
        totalRevenue: 0,
        adminRevenue: 0,
        trainerRevenue: 0,
        transactions: 0,
    });
    const [activity, setActivity] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [users, setUsers] = useState([]);

    // filters
    const [timeRange, setTimeRange] = useState("all"); // UI only for now (since your API doesn’t accept range)
    const [roleFilter, setRoleFilter] = useState("all"); // for users list
    const [statusFilter, setStatusFilter] = useState("all"); // active/inactive

    const token = useMemo(() => getToken(), []);

    const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
    const cardBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const muted = darkMode ? "text-gray-300" : "text-gray-600";
    const subtle = darkMode ? "bg-gray-800" : "bg-white";
    const inputBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300";

    const api = useMemo(() => {
        return axios.create({
            baseURL: BASE_URL,
            headers: { Authorization: `Bearer ${token}` },
        });
    }, [token]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                setError("Admin token not found. Please login again.");
                return;
            }

            // NOTE: these endpoints must exist
            const [statsRes, revRes, actRes, trainersRes, usersRes] = await Promise.all([
                api.get("/api/admin/stats"),
                api.get("/api/admin/revenue"),
                api.get("/api/admin/activity"),
                api.get("/api/admin/trainers"),
                api.get("/api/admin/users"), // you added this route
            ]);

            setStats(statsRes.data || { members: 0, trainers: 0, sessions: 0 });
            setRevenue(
                revRes.data || { totalRevenue: 0, adminRevenue: 0, trainerRevenue: 0, transactions: 0 }
            );
            setActivity(Array.isArray(actRes.data) ? actRes.data : []);
            setTrainers(Array.isArray(trainersRes.data) ? trainersRes.data : []);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to load admin reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** ---------- Derived filtered users ---------- */
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const role = String(u.role || "member").toLowerCase();
            const isActive = u.isActive !== undefined ? Boolean(u.isActive) : true;

            const roleOk = roleFilter === "all" || role === roleFilter;
            const statusOk =
                statusFilter === "all" ||
                (statusFilter === "active" && isActive) ||
                (statusFilter === "inactive" && !isActive);

            return roleOk && statusOk;
        });
    }, [users, roleFilter, statusFilter]);

    /** ---------- Downloads: CSV ---------- */
    const downloadUsersCSV = () => {
        const rows = filteredUsers.map((u) => ({
            name: u.fullName || u.fullname || u.name || "Unnamed",
            email: u.email || "",
            role: u.role || "member",
            isActive: u.isActive !== undefined ? String(Boolean(u.isActive)) : "true",
            createdAt: formatDateTime(u.createdAt),
        }));

        const csv = toCSV(rows, [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role" },
            { key: "isActive", label: "Active" },
            { key: "createdAt", label: "Created At" },
        ]);

        downloadBlob("admin_users_report.csv", csv, "text/csv;charset=utf-8");
    };

    const downloadTrainersCSV = () => {
        const rows = trainers.map((t) => ({
            name: t.name || "",
            email: t.email || "",
            speciality: t.speciality || "",
            experience: t.experience || "",
            rating: t.rating ?? "",
            createdAt: formatDateTime(t.createdAt),
        }));

        const csv = toCSV(rows, [
            { key: "name", label: "Trainer Name" },
            { key: "email", label: "Email" },
            { key: "speciality", label: "Speciality" },
            { key: "experience", label: "Experience" },
            { key: "rating", label: "Rating" },
            { key: "createdAt", label: "Created At" },
        ]);

        downloadBlob("admin_trainers_report.csv", csv, "text/csv;charset=utf-8");
    };

    const downloadActivityCSV = () => {
        const rows = activity.map((a) => ({
            type: a.type || "",
            message: a.message || "",
            time: formatDateTime(a.time),
        }));

        const csv = toCSV(rows, [
            { key: "type", label: "Type" },
            { key: "message", label: "Message" },
            { key: "time", label: "Time" },
        ]);

        downloadBlob("admin_activity_report.csv", csv, "text/csv;charset=utf-8");
    };

    /** ---------- Downloads: PDF (Full report) ---------- */
    const downloadFullPDF = () => {
        const doc = new jsPDF("p", "mm", "a4");

        // Title
        doc.setFontSize(16);
        doc.text("Admin Report", 14, 18);

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
        doc.text(`Time Range: ${timeRange}`, 14, 29);

        // Summary cards
        autoTable(doc, {
            startY: 35,
            head: [["Metric", "Value"]],
            body: [
                ["Members", String(stats.members ?? 0)],
                ["Trainers", String(stats.trainers ?? 0)],
                ["Sessions", String(stats.sessions ?? 0)],
                ["Total Revenue", formatMoney(revenue.totalRevenue)],
                ["Admin Revenue", formatMoney(revenue.adminRevenue)],
                ["Trainer Revenue", formatMoney(revenue.trainerRevenue)],
                ["Transactions", String(revenue.transactions ?? 0)],
            ],
            styles: { fontSize: 10 },
            headStyles: { fillColor: [33, 33, 33] },
        });

        // Users table (first 25 rows to keep PDF light)
        const usersRows = filteredUsers.slice(0, 25).map((u) => [
            u.fullName || u.fullname || u.name || "Unnamed",
            u.email || "",
            u.role || "member",
            u.isActive !== undefined ? (u.isActive ? "Active" : "Inactive") : "Active",
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 8,
            head: [["Users (Top 25)", "Email", "Role", "Status"]],
            body: usersRows.length ? usersRows : [["No users", "", "", ""]],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [33, 33, 33] },
        });

        // Trainers table (first 15)
        const trainersRows = trainers.slice(0, 15).map((t) => [
            t.name || "",
            t.email || "",
            t.speciality || "",
            String(t.rating ?? ""),
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 8,
            head: [["Trainers (Top 15)", "Email", "Speciality", "Rating"]],
            body: trainersRows.length ? trainersRows : [["No trainers", "", "", ""]],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [33, 33, 33] },
        });

        // Activity table (top 10)
        const actRows = activity.slice(0, 10).map((a) => [
            a.type || "",
            a.message || "",
            formatDateTime(a.time),
        ]);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 8,
            head: [["Recent Activity (Top 10)", "Message", "Time"]],
            body: actRows.length ? actRows : [["No activity", "", ""]],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [33, 33, 33] },
        });

        doc.save("admin_full_report.pdf");
    };

    /** ---------- UI components ---------- */
    const StatCard = ({ icon, title, value, note }) => (
        <div className={`rounded-2xl border p-4 ${cardBg}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>{icon}</div>
                <div className="min-w-0">
                    <p className={`text-sm ${muted}`}>{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {note ? <p className={`text-xs mt-1 ${muted}`}>{note}</p> : null}
                </div>
            </div>
        </div>
    );

    const SectionHeader = ({ title, right }) => (
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={18} className="text-indigo-500" />
                    {title}
                </h2>
            </div>
            {right ? <div className="flex items-center gap-2">{right}</div> : null}
        </div>
    );

    const RoleIcon = ({ role }) => {
        const r = String(role || "").toLowerCase();
        if (r === "admin") return <Shield size={16} className="text-indigo-500" />;
        if (r === "trainer") return <UserCircle size={16} className="text-emerald-500" />;
        return <Users size={16} className="text-blue-500" />;
    };

    if (loading) {
        return (
            <div className={`min-h-screen p-6 ${pageBg}`}>
                <div className={`rounded-2xl border p-6 ${subtle} ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <p className={muted}>Loading admin reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen p-6 ${pageBg}`}>
                <div
                    className={`p-6 flex items-center gap-2 rounded-xl border ${darkMode ? "bg-red-900/40 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-700"
                        }`}
                >
                    <AlertCircle size={18} />
                    <div className="flex-1">{error}</div>
                    <button
                        onClick={fetchAll}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
                            }`}
                    >
                        <RefreshCw size={16} />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 transition-colors duration-200 ${pageBg}`}>
            {/* Page Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Admin Reports</h1>
                    <p className={muted}>Generate downloadable reports for users, trainers, revenue, and activity.</p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className={`px-3 py-2 rounded-xl border outline-none transition ${inputBg}`}
                        title="Time range (UI only)"
                    >
                        <option value="all">All Time</option>
                        <option value="30days">Last 30 Days (UI)</option>
                        <option value="7days">Last 7 Days (UI)</option>
                    </select>

                    <button
                        onClick={fetchAll}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${darkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700" : "border-gray-200 bg-white hover:bg-gray-100"
                            }`}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        onClick={downloadFullPDF}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <Download size={16} />
                        Download Full PDF
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard icon={<Users size={18} className="text-blue-500" />} title="Members" value={stats.members ?? 0} />
                <StatCard icon={<UserCircle size={18} className="text-emerald-500" />} title="Trainers" value={stats.trainers ?? 0} />
                <StatCard icon={<Activity size={18} className="text-purple-500" />} title="Sessions" value={stats.sessions ?? 0} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<DollarSign size={18} className="text-green-500" />}
                    title="Total Revenue"
                    value={formatMoney(revenue.totalRevenue)}
                    note={`${revenue.transactions ?? 0} transactions`}
                />
                <StatCard icon={<DollarSign size={18} className="text-indigo-500" />} title="Admin Revenue" value={formatMoney(revenue.adminRevenue)} />
                <StatCard icon={<DollarSign size={18} className="text-orange-500" />} title="Trainer Revenue" value={formatMoney(revenue.trainerRevenue)} />
                <StatCard icon={<FileText size={18} className="text-gray-500" />} title="Generated" value={new Date().toLocaleDateString()} />
            </div>

            {/* Users Section */}
            <div className={`rounded-2xl border p-5 mb-6 ${cardBg}`}>
                <SectionHeader
                    title="Users Report"
                    right={
                        <>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className={`px-3 py-2 rounded-xl border outline-none transition ${inputBg}`}
                            >
                                <option value="all">All Roles</option>
                                <option value="member">Members</option>
                                <option value="trainer">Trainers</option>
                                <option value="admin">Admins</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`px-3 py-2 rounded-xl border outline-none transition ${inputBg}`}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <button
                                onClick={downloadUsersCSV}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${darkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700" : "border-gray-200 bg-white hover:bg-gray-100"
                                    }`}
                            >
                                <Download size={16} />
                                CSV
                            </button>
                        </>
                    }
                />

                <p className={`text-sm ${muted} mb-3`}>
                    Showing <span className="font-semibold">{filteredUsers.length}</span> of{" "}
                    <span className="font-semibold">{users.length}</span> users
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={muted}>
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Email</th>
                                <th className="text-left py-2">Role</th>
                                <th className="text-left py-2">Status</th>
                                <th className="text-left py-2">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.slice(0, 20).map((u) => {
                                const name = u.fullName || u.fullname || u.name || "Unnamed";
                                const isActive = u.isActive !== undefined ? Boolean(u.isActive) : true;

                                return (
                                    <tr key={u._id} className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                                        <td className="py-2">{name}</td>
                                        <td className="py-2">{u.email || ""}</td>
                                        <td className="py-2 inline-flex items-center gap-2">
                                            <RoleIcon role={u.role} />
                                            <span className="capitalize">{u.role || "member"}</span>
                                        </td>
                                        <td className="py-2">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${isActive
                                                        ? darkMode
                                                            ? "bg-emerald-900/40 text-emerald-200"
                                                            : "bg-emerald-50 text-emerald-700"
                                                        : darkMode
                                                            ? "bg-red-900/40 text-red-200"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {isActive ? <BadgeCheck size={14} /> : <BadgeX size={14} />}
                                                {isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-2">{formatDateTime(u.createdAt)}</td>
                                    </tr>
                                );
                            })}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={`py-4 ${muted}`}>
                                        No users match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length > 20 && (
                    <p className={`text-xs mt-3 ${muted}`}>
                        Showing first 20 users on screen. Download CSV/PDF for full report.
                    </p>
                )}
            </div>

            {/* Trainers Section */}
            <div className={`rounded-2xl border p-5 mb-6 ${cardBg}`}>
                <SectionHeader
                    title="Trainers Report"
                    right={
                        <button
                            onClick={downloadTrainersCSV}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${darkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700" : "border-gray-200 bg-white hover:bg-gray-100"
                                }`}
                        >
                            <Download size={16} />
                            CSV
                        </button>
                    }
                />

                <p className={`text-sm ${muted} mb-3`}>Total trainers: {trainers.length}</p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={muted}>
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Email</th>
                                <th className="text-left py-2">Speciality</th>
                                <th className="text-left py-2">Rating</th>
                                <th className="text-left py-2">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainers.slice(0, 15).map((t) => (
                                <tr key={t._id} className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                                    <td className="py-2">{t.name || ""}</td>
                                    <td className="py-2">{t.email || ""}</td>
                                    <td className="py-2">{t.speciality || ""}</td>
                                    <td className="py-2">{String(t.rating ?? "")}</td>
                                    <td className="py-2">{formatDateTime(t.createdAt)}</td>
                                </tr>
                            ))}

                            {trainers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={`py-4 ${muted}`}>
                                        No trainers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {trainers.length > 15 && (
                    <p className={`text-xs mt-3 ${muted}`}>Showing first 15 trainers on screen. Download CSV/PDF for full report.</p>
                )}
            </div>

            {/* Activity Section */}
            <div className={`rounded-2xl border p-5 mb-6 ${cardBg}`}>
                <SectionHeader
                    title="Recent Activity Report"
                    right={
                        <button
                            onClick={downloadActivityCSV}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${darkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700" : "border-gray-200 bg-white hover:bg-gray-100"
                                }`}
                        >
                            <Download size={16} />
                            CSV
                        </button>
                    }
                />

                <p className={`text-sm ${muted} mb-3`}>Showing latest activities (top 10 on screen)</p>

                <div className="space-y-3">
                    {activity.slice(0, 10).map((a, idx) => (
                        <div
                            key={`${a.type}-${idx}`}
                            className={`rounded-xl p-3 border transition-colors ${darkMode ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-gray-50"
                                }`}
                        >
                            <p className="font-medium">{a.message}</p>
                            <p className={`text-xs mt-1 ${muted}`}>
                                Type: <span className="capitalize">{a.type}</span> • {formatDateTime(a.time)}
                            </p>
                        </div>
                    ))}

                    {activity.length === 0 && <p className={muted}>No recent activity found.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
