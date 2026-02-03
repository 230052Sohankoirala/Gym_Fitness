import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import {
    Users,
    Search,
    Filter,
    Shield,
    UserCircle,
    BadgeCheck,
    BadgeX,
    Trash2,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

const BASE_URL = "http://localhost:4000";

const AdminUserList = () => {
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(""); // for per-user action loading
    const [error, setError] = useState("");

    // filters
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all"); // all | member | trainer | admin
    const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

    const token = useMemo(() => localStorage.getItem("token"), []);

    const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
    const cardBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const muted = darkMode ? "text-gray-300" : "text-gray-600";
    const soft = darkMode ? "bg-gray-800" : "bg-white";
    const inputBg = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300";

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                setError("Admin token not found. Please login again.");
                setUsers([]);
                return;
            }

            // ✅ change this path if your backend uses a different one
            const res = await axios.get(`${BASE_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // support both: {users:[...]} or [...]
            const list = Array.isArray(res.data) ? res.data : res.data?.users || [];
            setUsers(list);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredUsers = useMemo(() => {
        const s = search.trim().toLowerCase();

        return users.filter((u) => {
            const name = String(u.fullName || u.fullname || u.name || "").toLowerCase();
            const email = String(u.email || "").toLowerCase();
            const role = String(u.role || "").toLowerCase();
            const isActive = u.isActive !== undefined ? Boolean(u.isActive) : true;

            // search
            const matchesSearch = !s || name.includes(s) || email.includes(s);

            // role
            const matchesRole = roleFilter === "all" || role === roleFilter;

            // status
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && isActive) ||
                (statusFilter === "inactive" && !isActive);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    // ---------- OPTIONAL ACTIONS (only if backend supports) ----------

    const toggleActive = async (userId, nextActive) => {
        try {
            setBusyId(userId);

            // ✅ change route if your backend differs
            await axios.patch(
                `${BASE_URL}/api/admin/users/${userId}/status`,
                { isActive: nextActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, isActive: nextActive } : u))
            );
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update user status");
        } finally {
            setBusyId("");
        }
    };

    const deleteUser = async (userId) => {
        const ok = window.confirm("Are you sure you want to delete this user?");
        if (!ok) return;

        try {
            setBusyId(userId);

            // ✅ change route if your backend differs
            await axios.delete(`${BASE_URL}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsers((prev) => prev.filter((u) => u._id !== userId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        } finally {
            setBusyId("");
        }
    };

    const RoleIcon = ({ role }) => {
        const r = String(role || "").toLowerCase();
        if (r === "admin") return <Shield size={16} className="text-indigo-500" />;
        if (r === "trainer") return <UserCircle size={16} className="text-emerald-500" />;
        return <Users size={16} className="text-blue-500" />;
    };

    // ---------- UI ----------

    if (loading) {
        return (
            <div className={`min-h-screen p-6 ${pageBg}`}>
                <div className={`${soft} rounded-2xl border ${darkMode ? "border-gray-700" : "border-gray-200"} p-6`}>
                    <p className={muted}>Loading users...</p>
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
                        onClick={fetchUsers}
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
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className={muted}>Search, filter, activate/deactivate, and manage user accounts.</p>
                </div>

                <button
                    onClick={fetchUsers}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
                        } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className={`rounded-2xl border p-4 mb-6 ${cardBg}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className={`w-full pl-9 pr-3 py-2 rounded-xl border outline-none transition ${inputBg
                                } ${darkMode ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500"}`}
                        />
                    </div>

                    {/* Role */}
                    <div className="relative">
                        <Filter size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 rounded-xl border outline-none transition ${inputBg}`}
                        >
                            <option value="all">All Roles</option>
                            <option value="member">Members</option>
                            <option value="trainer">Trainers</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <Filter size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 rounded-xl border outline-none transition ${inputBg}`}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className={`mt-3 text-sm ${muted}`}>
                    Showing <span className="font-semibold">{filteredUsers.length}</span> of{" "}
                    <span className="font-semibold">{users.length}</span> users
                </div>
            </div>

            {/* User List */}
            {filteredUsers.length === 0 ? (
                <div className={`rounded-2xl border p-6 ${cardBg}`}>
                    <p className={muted}>No users match your filters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredUsers.map((u) => {
                        const id = u._id;
                        const name = u.fullName || u.fullname || u.name || "Unnamed";
                        const email = u.email || "—";
                        const role = u.role || "member";
                        const isActive = u.isActive !== undefined ? Boolean(u.isActive) : true;

                        return (
                            <div
                                key={id}
                                className={`rounded-2xl border p-5 transition-colors duration-200 ${cardBg}`}
                            >
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    {/* Left */}
                                    <div className="min-w-[220px]">
                                        <div className="flex items-center gap-2">
                                            <RoleIcon role={role} />
                                            <h2 className="text-lg font-semibold">{name}</h2>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-lg ${isActive
                                                        ? darkMode
                                                            ? "bg-emerald-900/40 text-emerald-200"
                                                            : "bg-emerald-50 text-emerald-700"
                                                        : darkMode
                                                            ? "bg-red-900/40 text-red-200"
                                                            : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <p className={`text-sm mt-1 ${muted}`}>{email}</p>

                                        <p className={`text-sm mt-1 ${muted}`}>
                                            Role: <span className="font-medium capitalize">{role}</span>
                                        </p>

                                        <p className={`text-xs mt-2 ${muted}`}>
                                            ID: <span className="font-mono">{String(id).slice(-10)}</span>
                                        </p>
                                    </div>

                                    {/* Right actions */}
                                    <div className="flex items-center gap-2">
                                        {/* Toggle Active */}
                                        <button
                                            disabled={busyId === id}
                                            onClick={() => toggleActive(id, !isActive)}
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${darkMode ? "border-gray-700" : "border-gray-200"
                                                } ${isActive
                                                    ? darkMode
                                                        ? "bg-gray-800 hover:bg-gray-700"
                                                        : "bg-white hover:bg-gray-50"
                                                    : darkMode
                                                        ? "bg-emerald-900/30 hover:bg-emerald-900/40"
                                                        : "bg-emerald-50 hover:bg-emerald-100"
                                                }`}
                                            title={isActive ? "Deactivate user" : "Activate user"}
                                        >
                                            {isActive ? (
                                                <>
                                                    <BadgeX size={16} className="text-red-400" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <BadgeCheck size={16} className="text-emerald-500" />
                                                    Activate
                                                </>
                                            )}
                                        </button>

                                        {/* Delete */}
                                        <button
                                            disabled={busyId === id}
                                            onClick={() => deleteUser(id)}
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${darkMode
                                                    ? "border-gray-700 bg-red-900/30 hover:bg-red-900/40"
                                                    : "border-gray-200 bg-red-50 hover:bg-red-100"
                                                }`}
                                            title="Delete user"
                                        >
                                            <Trash2 size={16} className={darkMode ? "text-red-200" : "text-red-700"} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminUserList;
