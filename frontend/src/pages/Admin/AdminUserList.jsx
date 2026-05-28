import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import {
  Users,
  Search,
  Filter,
  Shield,
  UserCircle,
  Trash2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Mail,
  Activity,
  ChevronRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AdminUserList = () => {
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = useMemo(() => localStorage.getItem("token"), []);

  const pageBg = darkMode
    ? "bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#0f172a] text-white"
    : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60 text-slate-900";

  const glassCard = darkMode
    ? "bg-white/[0.04] border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.35)]"
    : "bg-white/90 border-slate-200/80 shadow-[0_12px_36px_rgba(15,23,42,0.08)]";

  const softCard = darkMode
    ? "bg-white/[0.03] border-white/10"
    : "bg-white border-slate-200";

  const muted = darkMode ? "text-slate-300" : "text-slate-600";
  const faint = darkMode ? "text-slate-400" : "text-slate-500";

  const inputBg = darkMode
    ? "bg-white/[0.05] border-white/10 text-white placeholder:text-slate-400"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400";

  const hoverSoft = darkMode ? "hover:bg-white/[0.06]" : "hover:bg-slate-50";


  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Admin token not found. Please login again.");
        setUsers([]);
        return;
      }

      const res = await axios.get(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

      const matchesSearch = !s || name.includes(s) || email.includes(s);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const deleteUser = async (userId) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      setBusyId(userId);

      await axios.delete(`${API_BASE}/api/admin/users/${userId}`, {
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

  const totalUsers = users.length;
  const activeUsers = users.filter((u) =>
    u.isActive !== undefined ? Boolean(u.isActive) : true
  ).length;
  const inactiveUsers = totalUsers - activeUsers;

  const membersCount = users.filter(
    (u) => String(u.role || "").toLowerCase() === "member"
  ).length;

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${pageBg}`}>
        <div className={`rounded-[2rem] border p-6 ${glassCard}`}>
          <p className={muted}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-6 ${pageBg}`}>
        <div
          className={`p-6 flex items-center gap-3 rounded-[2rem] border ${glassCard}`}
        >
          <AlertCircle size={18} className="text-red-500" />
          <div className="flex-1">{error}</div>
          <button
            onClick={fetchUsers}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium border transition-colors duration-200 ${softCard} ${hoverSoft}`}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div
          className={`relative overflow-hidden rounded-[2rem] border p-6 sm:p-7 mb-6 ${glassCard}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-blue-500/10 pointer-events-none" />
          <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${darkMode
                    ? "bg-indigo-500/10 text-indigo-300 border-indigo-400/20"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Admin User Control
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
                User Management
              </h1>

              <p className={`mt-2 text-sm sm:text-base max-w-2xl ${muted}`}>
                Search, filter, review, and manage all registered user accounts
                from one professional dashboard.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 text-white hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500 transition-colors duration-200 shadow-lg"
            >
              <RefreshCw size={16} />
              Refresh Users
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            icon={<Users size={20} />}
            label="Total Users"
            value={totalUsers}
            darkMode={darkMode}
            tone="blue"
          />
          <SummaryCard
            icon={<Activity size={20} />}
            label="Active Users"
            value={activeUsers}
            darkMode={darkMode}
            tone="emerald"
          />
          <SummaryCard
            icon={<AlertCircle size={20} />}
            label="Inactive Users"
            value={inactiveUsers}
            darkMode={darkMode}
            tone="red"
          />
          <SummaryCard
            icon={<UserCircle size={20} />}
            label="Members"
            value={membersCount}
            darkMode={darkMode}
            tone="indigo"
          />
        </div>

        {/* Filters */}
        <div className={`rounded-[2rem] border p-5 mb-6 ${glassCard}`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className={darkMode ? "text-indigo-300" : "text-indigo-600"} />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${faint}`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border outline-none transition-colors duration-200 ${inputBg}`}
              />
            </div>

            <div className="relative">
              <Filter size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${faint}`} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border outline-none transition-colors duration-200 ${inputBg}`}
              >
                <option value="all">All Roles</option>
                <option value="member">Members</option>
                <option value="trainer">Trainers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="relative">
              <Filter size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${faint}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border outline-none transition-colors duration-200 ${inputBg}`}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className={`mt-4 text-sm ${muted}`}>
            Showing <span className="font-semibold">{filteredUsers.length}</span> of{" "}
            <span className="font-semibold">{users.length}</span> users
          </div>
        </div>

        {/* User list */}
        {filteredUsers.length === 0 ? (
          <div className={`rounded-[2rem] border p-6 ${glassCard}`}>
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
                  className={`rounded-[1.75rem] border p-5 transition-colors duration-200 ${glassCard}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    {/* Left */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${darkMode ? "bg-white/[0.05]" : "bg-slate-100"
                          }`}
                      >
                        <RoleIcon role={role} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold truncate">{name}</h2>

                          <span
                            className={`text-xs px-2.5 py-1 rounded-full ${isActive
                                ? darkMode
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-emerald-50 text-emerald-700"
                                : darkMode
                                  ? "bg-red-500/15 text-red-300"
                                  : "bg-red-50 text-red-700"
                              }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>

                          <span
                            className={`text-xs px-2.5 py-1 rounded-full capitalize ${darkMode
                                ? "bg-indigo-500/10 text-indigo-300"
                                : "bg-indigo-50 text-indigo-700"
                              }`}
                          >
                            {role}
                          </span>
                        </div>

                        <div className={`mt-2 flex items-center gap-2 text-sm ${muted}`}>
                          <Mail size={14} />
                          <span className="truncate">{email}</span>
                        </div>

                        <p className={`text-xs mt-2 ${faint}`}>
                          User ID: <span className="font-mono">{String(id).slice(-10)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        disabled={busyId === id}
                        onClick={() => deleteUser(id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-colors duration-200 ${darkMode
                            ? "border-red-500/20 bg-red-500/10 hover:bg-red-500/15 text-red-200"
                            : "border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                          }`}
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                        {busyId === id ? "Deleting..." : "Delete"}
                      </button>

                      <div
                        className={`inline-flex items-center gap-2 text-sm ${faint}`}
                      >
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, darkMode, tone = "indigo" }) => {
  const toneStyles = {
    blue: darkMode
      ? "bg-blue-500/10 text-blue-300"
      : "bg-blue-50 text-blue-700",
    emerald: darkMode
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-emerald-50 text-emerald-700",
    red: darkMode
      ? "bg-red-500/10 text-red-300"
      : "bg-red-50 text-red-700",
    indigo: darkMode
      ? "bg-indigo-500/10 text-indigo-300"
      : "bg-indigo-50 text-indigo-700",
  };

  return (
    <div
      className={`rounded-[1.75rem] border p-5 transition-colors duration-200 ${darkMode
          ? "bg-white/[0.04] border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.30)]"
          : "bg-white border-slate-200 text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
        }`}
    >
      <div className="flex items-center justify-between">
        <div className={darkMode ? "text-slate-300 text-sm" : "text-slate-600 text-sm"}>
          {label}
        </div>
        <div className={`p-3 rounded-2xl ${toneStyles[tone]}`}>{icon}</div>
      </div>

      <div className="mt-4 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
};

export default AdminUserList;