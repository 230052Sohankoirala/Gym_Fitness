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
    Sparkles,
    CalendarRange,
    BarChart3,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const BASE_URL = "http://localhost:4000";

function getToken() {
    return localStorage.getItem("token");
}

/** ---------- Helpers ---------- */
function safe(v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/\s+/g, " ").trim();
}

function toCSV(rows, headers) {
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

    const [timeRange, setTimeRange] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const token = useMemo(() => getToken(), []);

    const pageBg = darkMode
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
        : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900";

    const cardBg = darkMode
        ? "bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
        : "bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)]";

    const muted = darkMode ? "text-slate-300" : "text-slate-600";
    const mutedSoft = darkMode ? "text-slate-400" : "text-slate-500";

    const inputBg = darkMode
        ? "bg-slate-900/80 border-white/10 text-white"
        : "bg-white border-slate-300 text-slate-900";

    const tableHeader = darkMode ? "text-slate-300" : "text-slate-600";
    const rowBorder = darkMode ? "border-white/10" : "border-slate-200";
    const pillBg = darkMode ? "bg-white/[0.05]" : "bg-slate-100";

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

            const [statsRes, revRes, actRes, trainersRes, usersRes] = await Promise.all([
                api.get("/api/admin/stats"),
                api.get("/api/admin/revenue"),
                api.get("/api/admin/activity"),
                api.get("/api/admin/trainers"),
                api.get("/api/admin/users"),
            ]);

            setStats(statsRes.data || { members: 0, trainers: 0, sessions: 0 });
            setRevenue(
                revRes.data || {
                    totalRevenue: 0,
                    adminRevenue: 0,
                    trainerRevenue: 0,
                    transactions: 0,
                }
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

    /** ---------- CSV ---------- */
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

    /** ---------- PDF ---------- */
    const downloadFullPDF = () => {
        const doc = new jsPDF("p", "mm", "a4");

        doc.setFontSize(16);
        doc.text("Admin Report", 14, 18);

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
        doc.text(`Time Range: ${timeRange}`, 14, 29);

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

    /** ---------- Small UI ---------- */
    const StatCard = ({ icon, title, value, note, accent }) => (
        <div className={`rounded-3xl p-5 transition-all duration-200 ${cardBg}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className={`text-sm ${muted}`}>{title}</p>
                    <p className="text-3xl font-bold tracking-tight mt-2">{value}</p>
                    {note ? <p className={`text-xs mt-2 ${mutedSoft}`}>{note}</p> : null}
                </div>
                <div className={`p-3 rounded-2xl ${accent || pillBg}`}>{icon}</div>
            </div>
        </div>
    );

    const SectionHeader = ({ title, desc, right, icon }) => (
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    {icon || <FileText size={18} className="text-indigo-500" />}
                    {title}
                </h2>
                {desc ? <p className={`text-sm mt-1 ${muted}`}>{desc}</p> : null}
            </div>
            {right ? <div className="flex items-center gap-2 flex-wrap">{right}</div> : null}
        </div>
    );

    const RoleIcon = ({ role }) => {
        const r = String(role || "").toLowerCase();
        if (r === "admin") return <Shield size={16} className="text-indigo-500" />;
        if (r === "trainer") return <UserCircle size={16} className="text-emerald-500" />;
        return <Users size={16} className="text-blue-500" />;
    };

    const ActionButton = ({ children, onClick, primary = false, icon }) => (
        <button
            onClick={onClick}
            className={
                primary
                    ? "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 shadow-lg"
                    : `inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium border transition-all duration-200 ${darkMode
                        ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`
            }
        >
            {icon}
            {children}
        </button>
    );

    const SelectField = ({ value, onChange, children, title }) => (
        <select
            value={value}
            onChange={onChange}
            title={title}
            className={`px-3 py-2.5 rounded-2xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
        >
            {children}
        </select>
    );

    if (loading) {
        return (
            <div className={`min-h-screen p-6 ${pageBg}`}>
                <div className={`max-w-7xl mx-auto rounded-3xl p-6 ${cardBg}`}>
                    <div className="animate-pulse space-y-4">
                        <div className={`h-6 w-52 rounded-xl ${darkMode ? "bg-white/10" : "bg-slate-200"}`} />
                        <div className={`h-4 w-80 rounded-xl ${darkMode ? "bg-white/10" : "bg-slate-200"}`} />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-28 rounded-3xl ${darkMode ? "bg-white/10" : "bg-slate-200"}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen p-6 ${pageBg}`}>
                <div className="max-w-7xl mx-auto">
                    <div
                        className={`p-5 flex items-center gap-3 rounded-3xl border transition-all duration-200 ${darkMode
                            ? "bg-red-900/20 border-red-500/20 text-red-200"
                            : "bg-red-50 border-red-200 text-red-700"
                            }`}
                    >
                        <AlertCircle size={20} />
                        <div className="flex-1">{error}</div>
                        <ActionButton onClick={fetchAll} icon={<RefreshCw size={16} />}>
                            Retry
                        </ActionButton>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 transition-all duration-200 ${pageBg}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className={`rounded-[2rem] p-6 sm:p-7 mb-6 relative overflow-hidden ${cardBg}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${darkMode
                                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-400/20"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                }`}>
                                <Sparkles size={14} />
                                Reporting Center
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Reports</h1>
                            <p className={`mt-2 ${muted}`}>
                                Generate downloadable reports for users, trainers, revenue, and activity.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <SelectField
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                title="Time range"
                            >
                                <option value="all">All Time</option>
                                <option value="30days">Last 30 Days (UI)</option>
                                <option value="7days">Last 7 Days (UI)</option>
                            </SelectField>

                            <ActionButton onClick={fetchAll} icon={<RefreshCw size={16} />}>
                                Refresh
                            </ActionButton>

                            <ActionButton onClick={downloadFullPDF} primary icon={<Download size={16} />}>
                                Download Full PDF
                            </ActionButton>
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <StatCard
                        icon={<Users size={20} className="text-blue-500" />}
                        title="Members"
                        value={stats.members ?? 0}
                        accent={darkMode ? "bg-blue-500/10" : "bg-blue-50"}
                    />
                    <StatCard
                        icon={<UserCircle size={20} className="text-emerald-500" />}
                        title="Trainers"
                        value={stats.trainers ?? 0}
                        accent={darkMode ? "bg-emerald-500/10" : "bg-emerald-50"}
                    />
                    <StatCard
                        icon={<Activity size={20} className="text-violet-500" />}
                        title="Sessions"
                        value={stats.sessions ?? 0}
                        accent={darkMode ? "bg-violet-500/10" : "bg-violet-50"}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<DollarSign size={20} className="text-green-500" />}
                        title="Total Revenue"
                        value={formatMoney(revenue.totalRevenue)}
                        note={`${revenue.transactions ?? 0} transactions`}
                        accent={darkMode ? "bg-green-500/10" : "bg-green-50"}
                    />
                    <StatCard
                        icon={<BarChart3 size={20} className="text-indigo-500" />}
                        title="Admin Revenue"
                        value={formatMoney(revenue.adminRevenue)}
                        accent={darkMode ? "bg-indigo-500/10" : "bg-indigo-50"}
                    />
                    <StatCard
                        icon={<DollarSign size={20} className="text-orange-500" />}
                        title="Trainer Revenue"
                        value={formatMoney(revenue.trainerRevenue)}
                        accent={darkMode ? "bg-orange-500/10" : "bg-orange-50"}
                    />
                    <StatCard
                        icon={<CalendarRange size={20} className="text-slate-500" />}
                        title="Generated"
                        value={new Date().toLocaleDateString()}
                        accent={darkMode ? "bg-white/10" : "bg-slate-100"}
                    />
                </div>

                {/* Users Section */}
                <div className={`rounded-[2rem] p-5 sm:p-6 mb-6 ${cardBg}`}>
                    <SectionHeader
                        title="Users Report"
                        desc="Review member, trainer, and admin accounts."
                        icon={<Users size={18} className="text-indigo-500" />}
                        right={
                            <>
                                <SelectField value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="all">All Roles</option>
                                    <option value="member">Members</option>
                                    <option value="trainer">Trainers</option>
                                    <option value="admin">Admins</option>
                                </SelectField>

                                <SelectField value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </SelectField>

                                <ActionButton onClick={downloadUsersCSV} icon={<Download size={16} />}>
                                    CSV
                                </ActionButton>
                            </>
                        }
                    />

                    <p className={`text-sm ${muted} mb-4`}>
                        Showing <span className="font-semibold">{filteredUsers.length}</span> of{" "}
                        <span className="font-semibold">{users.length}</span> users
                    </p>

                    <div className={`overflow-x-auto rounded-2xl border ${darkMode ? "border-white/10" : "border-slate-200"}`}>
                        <table className="w-full text-sm">
                            <thead className={darkMode ? "bg-white/[0.03]" : "bg-slate-50"}>
                                <tr className={tableHeader}>
                                    <th className="text-left py-3 px-4">Name</th>
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">Role</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.slice(0, 20).map((u) => {
                                    const name = u.fullName || u.fullname || u.name || "Unnamed";
                                    const isActive = u.isActive !== undefined ? Boolean(u.isActive) : true;

                                    return (
                                        <tr
                                            key={u._id}
                                            className={`border-t transition-all duration-200 ${rowBorder} ${darkMode ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                                                }`}
                                        >
                                            <td className="py-3 px-4 font-medium">{name}</td>
                                            <td className="py-3 px-4">{u.email || ""}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-2">
                                                    <RoleIcon role={u.role} />
                                                    <span className="capitalize">{u.role || "member"}</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl ${isActive
                                                        ? darkMode
                                                            ? "bg-emerald-500/10 text-emerald-300"
                                                            : "bg-emerald-50 text-emerald-700"
                                                        : darkMode
                                                            ? "bg-red-500/10 text-red-300"
                                                            : "bg-red-50 text-red-700"
                                                        }`}
                                                >
                                                    {isActive ? <BadgeCheck size={14} /> : <BadgeX size={14} />}
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{formatDateTime(u.createdAt)}</td>
                                        </tr>
                                    );
                                })}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className={`py-6 px-4 ${muted}`}>
                                            No users match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length > 20 && (
                        <p className={`text-xs mt-3 ${mutedSoft}`}>
                            Showing first 20 users on screen. Download CSV/PDF for full report.
                        </p>
                    )}
                </div>

                {/* Trainers Section */}
                <div className={`rounded-[2rem] p-5 sm:p-6 mb-6 ${cardBg}`}>
                    <SectionHeader
                        title="Trainers Report"
                        desc="Trainer list with basic profile information."
                        icon={<UserCircle size={18} className="text-emerald-500" />}
                        right={
                            <ActionButton onClick={downloadTrainersCSV} icon={<Download size={16} />}>
                                CSV
                            </ActionButton>
                        }
                    />

                    <p className={`text-sm ${muted} mb-4`}>Total trainers: {trainers.length}</p>

                    <div className={`overflow-x-auto rounded-2xl border ${darkMode ? "border-white/10" : "border-slate-200"}`}>
                        <table className="w-full text-sm">
                            <thead className={darkMode ? "bg-white/[0.03]" : "bg-slate-50"}>
                                <tr className={tableHeader}>
                                    <th className="text-left py-3 px-4">Name</th>
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">Speciality</th>
                                    <th className="text-left py-3 px-4">Rating</th>
                                    <th className="text-left py-3 px-4">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainers.slice(0, 15).map((t) => (
                                    <tr
                                        key={t._id}
                                        className={`border-t transition-all duration-200 ${rowBorder} ${darkMode ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
                                            }`}
                                    >
                                        <td className="py-3 px-4 font-medium">{t.name || ""}</td>
                                        <td className="py-3 px-4">{t.email || ""}</td>
                                        <td className="py-3 px-4">{t.speciality || ""}</td>
                                        <td className="py-3 px-4">{String(t.rating ?? "")}</td>
                                        <td className="py-3 px-4">{formatDateTime(t.createdAt)}</td>
                                    </tr>
                                ))}

                                {trainers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className={`py-6 px-4 ${muted}`}>
                                            No trainers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {trainers.length > 15 && (
                        <p className={`text-xs mt-3 ${mutedSoft}`}>
                            Showing first 15 trainers on screen. Download CSV/PDF for full report.
                        </p>
                    )}
                </div>

                {/* Activity Section */}
                <div className={`rounded-[2rem] p-5 sm:p-6 ${cardBg}`}>
                    <SectionHeader
                        title="Recent Activity Report"
                        desc="Latest activity entries from the admin system."
                        icon={<Activity size={18} className="text-violet-500" />}
                        right={
                            <ActionButton onClick={downloadActivityCSV} icon={<Download size={16} />}>
                                CSV
                            </ActionButton>
                        }
                    />

                    <p className={`text-sm ${muted} mb-4`}>Showing latest activities (top 10 on screen)</p>

                    <div className="space-y-3">
                        {activity.slice(0, 10).map((a, idx) => (
                            <div
                                key={`${a.type}-${idx}`}
                                className={`rounded-2xl p-4 border transition-all duration-200 ${darkMode
                                    ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                                    : "border-slate-200 bg-slate-50/80 hover:bg-slate-100"
                                    }`}
                            >
                                <p className="font-medium">{a.message}</p>
                                <p className={`text-xs mt-1.5 ${muted}`}>
                                    Type: <span className="capitalize">{a.type}</span> • {formatDateTime(a.time)}
                                </p>
                            </div>
                        ))}

                        {activity.length === 0 && <p className={muted}>No recent activity found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;