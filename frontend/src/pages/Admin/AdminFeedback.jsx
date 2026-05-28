/* eslint-disable no-unused-vars */
// src/pages/admin/AdminFeedback.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    RefreshCw,
    Trash2,
    Eye,
    X,
    Save,
    ShieldAlert,
    Filter,
    CalendarDays,
    Tag,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API_BASE =  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const pad2 = (n) => String(n).padStart(2, "0");
const prettyDateTime = (iso) => {
    try {
        const d = new Date(iso);
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
            d.getHours()
        )}:${pad2(d.getMinutes())}`;
    } catch {
        return "—";
    }
};

const safeJson = async (res) => {
    try {
        return await res.json();
    } catch {
        return {};
    }
};

const Badge = ({ children, tone = "neutral" }) => {
    const toneClass =
        tone === "green"
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/20"
            : tone === "red"
                ? "bg-rose-500/15 text-rose-200 border-rose-400/20"
                : tone === "yellow"
                    ? "bg-amber-500/15 text-amber-200 border-amber-400/20"
                    : tone === "blue"
                        ? "bg-indigo-500/15 text-indigo-200 border-indigo-400/20"
                        : "bg-white/5 text-gray-200 border-white/10";

    return (
        <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${toneClass}`}>
            {children}
        </span>
    );
};

const ModalShell = ({ open, onClose, title, darkMode, children }) => {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-[80] bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                    >
                        <div
                            className={`w-full max-w-3xl rounded-2xl border shadow-xl ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                                }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-white/10" : "border-gray-200"}`}>
                                <div className="font-semibold">{title}</div>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-xl border ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4">{children}</div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default function AdminFeedback() {
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    const token = useMemo(() => localStorage.getItem("token") || "", []);
    const authHeaders = useMemo(() => {
        const h = { "Content-Type": "application/json" };
        if (token) h.Authorization = `Bearer ${token}`;
        return h;
    }, [token]);
    const pageBg = darkMode
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
        : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900";
    const card = darkMode
        ? "bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
        : "bg-white/85 border border-slate-200/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]";


    const subtle = darkMode ? "text-slate-300" : "text-slate-600";


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [rows, setRows] = useState([]);

    // filters/search
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | open | in_progress | resolved | closed
    const [categoryFilter, setCategoryFilter] = useState("all"); // all | bug | feature | billing | ui | other
    const [priorityFilter, setPriorityFilter] = useState("all"); // all | low | medium | high

    // view modal state
    const [viewOpen, setViewOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [active, setActive] = useState(null);

    // delete confirm
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteRow, setDeleteRow] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const loadList = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/feedback/admin`, {
                method: "GET",
                headers: authHeaders,
                cache: "no-store",
            });
            const data = await safeJson(res);
            if (!res.ok) throw new Error(data?.message || "Failed to load feedback.");

            // expect: { feedback: [...] } or { items: [...] }
            const list = Array.isArray(data?.feedback) ? data.feedback : Array.isArray(data?.items) ? data.items : [];
            setRows(list);
        } catch (e) {
            setError(e?.message || "Failed to load feedback.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [token, authHeaders]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    const normalized = useMemo(() => {
        return rows.map((r) => ({
            ...r,
            _id: String(r._id || ""),
            message: r.message || r.text || r.details || "",
            category: r.category || "other",
            priority: r.priority || "medium",
            status: r.status || "open",
            createdAt: r.createdAt || r.created_at,
            user:
                r.user ||
                r.createdBy ||
                r.sender ||
                (r.userId ? { _id: r.userId } : null),
        }));
    }, [rows]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();

        return normalized.filter((r) => {
            const matchQ =
                !s ||
                String(r.message || "").toLowerCase().includes(s) ||
                String(r.category || "").toLowerCase().includes(s) ||
                String(r.priority || "").toLowerCase().includes(s) ||
                String(r.status || "").toLowerCase().includes(s) ||
                String(r.user?.email || "").toLowerCase().includes(s) ||
                String(r.user?.fullName || r.user?.fullname || r.user?.name || "").toLowerCase().includes(s);

            const matchStatus = statusFilter === "all" ? true : String(r.status) === statusFilter;
            const matchCategory = categoryFilter === "all" ? true : String(r.category) === categoryFilter;
            const matchPriority = priorityFilter === "all" ? true : String(r.priority) === priorityFilter;

            return matchQ && matchStatus && matchCategory && matchPriority;
        });
    }, [normalized, q, statusFilter, categoryFilter, priorityFilter]);

    const statusTone = (s) => {
        if (s === "resolved") return "green";
        if (s === "closed") return "blue";
        if (s === "in_progress") return "yellow";
        return "red"; // open
    };

    const priorityTone = (p) => {
        if (p === "high") return "red";
        if (p === "medium") return "yellow";
        return "blue";
    };

    const categoryTone = (c) => {
        if (c === "bug") return "red";
        if (c === "feature") return "blue";
        if (c === "billing") return "yellow";
        if (c === "ui") return "blue";
        return "neutral";
    };

    const openView = useCallback(
        async (id) => {
            setViewOpen(true);
            setViewLoading(true);
            setError("");

            try {
                const res = await fetch(`${API_BASE}/api/feedback/admin/${id}`, {
                    method: "GET",
                    headers: authHeaders,
                    cache: "no-store",
                });
                const data = await safeJson(res);
                if (!res.ok) throw new Error(data?.message || "Failed to load feedback item.");

                const item = data?.feedback || data?.item || data;
                setActive({
                    ...item,
                    _id: String(item?._id || id),
                    message: item?.message || item?.text || item?.details || "",
                    status: item?.status || "open",
                    category: item?.category || "other",
                    priority: item?.priority || "medium",
                    adminNotes: item?.adminNotes || item?.notes || "",
                });
            } catch (e) {
                setError(e?.message || "Failed to load feedback item.");
                setActive(null);
            } finally {
                setViewLoading(false);
            }
        },
        [authHeaders]
    );

    const closeView = () => {
        setViewOpen(false);
        setActive(null);
    };

    const saveActive = useCallback(async () => {
        if (!active?._id) return;

        setViewLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/feedback/admin/${active._id}`, {
                method: "PUT",
                headers: authHeaders,
                body: JSON.stringify({
                    status: active.status,
                    priority: active.priority,
                    category: active.category,
                    adminNotes: active.adminNotes,
                }),
            });

            const data = await safeJson(res);
            if (!res.ok) throw new Error(data?.message || "Failed to update feedback.");

            // refresh list quickly without full refetch
            setRows((prev) =>
                prev.map((r) => (String(r._id) === String(active._id) ? { ...r, ...data?.feedback, ...active } : r))
            );
        } catch (e) {
            setError(e?.message || "Update failed.");
        } finally {
            setViewLoading(false);
        }
    }, [active, authHeaders]);

    const askDelete = (row) => {
        setDeleteRow(row);
        setDeleteOpen(true);
    };

    const doDelete = useCallback(async () => {
        if (!deleteRow?._id) return;

        setDeleteLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/api/feedback/admin/${deleteRow._id}`, {
                method: "DELETE",
                headers: authHeaders,
            });
            const data = await safeJson(res);
            if (!res.ok) throw new Error(data?.message || "Failed to delete feedback.");

            setRows((prev) => prev.filter((r) => String(r._id) !== String(deleteRow._id)));
            setDeleteOpen(false);
            setDeleteRow(null);
        } catch (e) {
            setError(e?.message || "Delete failed.");
        } finally {
            setDeleteLoading(false);
        }
    }, [deleteRow, authHeaders]);

    if (!token) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
                <div className={`rounded-2xl border p-6 ${card}`}>Please login as admin.</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen w-full ${pageBg}`}>
            <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
                {/* Header */}
                <div className={`rounded-2xl border p-4 md:p-5 ${card}`}>
                    <div className="flex items-start md:items-center gap-3 md:gap-4 flex-col md:flex-row">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-gray-100"}`}>
                                <ShieldAlert />
                            </div>
                            <div>
                                <div className="text-xl font-semibold">Feedback Reports</div>
                                <div className={`text-sm ${subtle}`}>View and manage user bug reports & suggestions.</div>
                            </div>
                        </div>

                        <div className="ml-0 md:ml-auto flex items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={loadList}
                                className={`px-3 py-2 rounded-xl border inline-flex items-center gap-2 ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Search + Filters */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-2 relative">
                            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search by message, email, status..."
                                className={`w-full pl-9 pr-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                                    }`}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                                }`}
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                                }`}
                        >
                            <option value="all">All Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-3 flex items-center gap-2">
                            <Filter size={16} className={subtle} />
                            <span className={`text-sm ${subtle}`}>Showing</span>
                            <span className="text-sm font-semibold">{filtered.length}</span>
                            <span className={`text-sm ${subtle}`}>items</span>
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                                }`}
                        >
                            <option value="all">All Category</option>
                            <option value="bug">Bug</option>
                            <option value="feature">Feature</option>
                            <option value="billing">Billing</option>
                            <option value="ui">UI/UX</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {error ? (
                        <div className={`mt-3 rounded-xl border p-3 text-sm ${darkMode ? "border-rose-400/25 bg-rose-400/10 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700"
                            }`}>
                            {error}
                        </div>
                    ) : null}
                </div>

                {/* Table */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className={`${darkMode ? "bg-white/5" : "bg-gray-50"}`}>
                                <tr className={`${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                                    <th className="text-left px-4 py-3">Message</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">Category</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">Priority</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
                                    <th className="text-left px-4 py-3 whitespace-nowrap">Created</th>
                                    <th className="text-right px-4 py-3 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td className={`px-4 py-6 ${subtle}`} colSpan={6}>
                                            Loading feedback...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td className={`px-4 py-6 ${subtle}`} colSpan={6}>
                                            No feedback found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r) => (
                                        <tr key={r._id} className={`${darkMode ? "border-t border-white/10" : "border-t border-gray-200"}`}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium line-clamp-2">{r.message || "—"}</div>
                                                <div className={`text-xs mt-1 ${subtle}`}>
                                                    {r.user?.email ? `By: ${r.user.email}` : "By: —"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge tone={categoryTone(r.category)}>{r.category}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge tone={priorityTone(r.priority)}>{r.priority}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2">
                                                    <CalendarDays size={14} className={subtle} />
                                                    <span>{prettyDateTime(r.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openView(r._id)}
                                                        className={`px-3 py-2 rounded-xl border inline-flex items-center gap-2 ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => askDelete(r)}
                                                        className={`px-3 py-2 rounded-xl border inline-flex items-center gap-2 ${darkMode
                                                            ? "border-rose-400/30 text-rose-200 hover:bg-rose-400/10"
                                                            : "border-rose-200 text-rose-700 hover:bg-rose-50"
                                                            }`}
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* VIEW / UPDATE MODAL */}
            <ModalShell
                open={viewOpen}
                onClose={closeView}
                title={viewLoading ? "Loading..." : `Feedback • ${active?._id || ""}`}
                darkMode={darkMode}
            >
                {viewLoading ? (
                    <div className={subtle}>Loading feedback details...</div>
                ) : !active ? (
                    <div className={subtle}>No data.</div>
                ) : (
                    <div className="space-y-4">
                        <div className={`rounded-xl border p-3 ${darkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                            <div className="text-sm font-semibold mb-1 flex items-center gap-2">
                                <Tag size={16} />
                                Message
                            </div>
                            <div className={`${darkMode ? "text-gray-200" : "text-gray-800"} whitespace-pre-wrap`}>
                                {active.message || "—"}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <label className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Status</label>
                                <select
                                    value={active.status}
                                    onChange={(e) => setActive((p) => ({ ...p, status: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                                        }`}
                                >
                                    <option value="open">open</option>
                                    <option value="in_progress">in_progress</option>
                                    <option value="resolved">resolved</option>
                                    <option value="closed">closed</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Category</label>
                                <select
                                    value={active.category}
                                    onChange={(e) => setActive((p) => ({ ...p, category: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                                        }`}
                                >
                                    <option value="bug">bug</option>
                                    <option value="feature">feature</option>
                                    <option value="billing">billing</option>
                                    <option value="ui">ui</option>
                                    <option value="other">other</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Priority</label>
                                <select
                                    value={active.priority}
                                    onChange={(e) => setActive((p) => ({ ...p, priority: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-xl border outline-none ${darkMode ? "bg-gray-900 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"
                                        }`}
                                >
                                    <option value="low">low</option>
                                    <option value="medium">medium</option>
                                    <option value="high">high</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Admin Notes</label>
                            <textarea
                                rows={5}
                                value={active.adminNotes || ""}
                                onChange={(e) => setActive((p) => ({ ...p, adminNotes: e.target.value }))}
                                className={`w-full resize-none px-3 py-2 rounded-xl border outline-none ${darkMode
                                    ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-500"
                                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                                    }`}
                                placeholder="Write what you did, how you solved it, next steps..."
                                style={{ minHeight: 120 }}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={closeView}
                                className={`px-3 py-2 rounded-xl border ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                Close
                            </button>

                            <button
                                onClick={saveActive}
                                disabled={viewLoading}
                                className={`px-3 py-2 rounded-xl inline-flex items-center gap-2 text-white ${viewLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </ModalShell>

            {/* DELETE CONFIRM MODAL */}
            <ModalShell
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Delete feedback?"
                darkMode={darkMode}
            >
                <div className="space-y-3">
                    <div className={subtle}>
                        This will permanently remove the feedback report. This action cannot be undone.
                    </div>

                    <div className={`rounded-xl border p-3 text-sm ${darkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                        <div className="font-semibold mb-1">Preview</div>
                        <div className="line-clamp-3">{deleteRow?.message || "—"}</div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => setDeleteOpen(false)}
                            className={`px-3 py-2 rounded-xl border ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={doDelete}
                            disabled={deleteLoading}
                            className={`px-3 py-2 rounded-xl inline-flex items-center gap-2 ${deleteLoading
                                ? darkMode
                                    ? "bg-rose-400/40 text-rose-100 cursor-not-allowed"
                                    : "bg-rose-200 text-rose-700 cursor-not-allowed"
                                : darkMode
                                    ? "bg-rose-500 text-white hover:bg-rose-600"
                                    : "bg-rose-600 text-white hover:bg-rose-700"
                                }`}
                        >
                            <Trash2 size={16} />
                            {deleteLoading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
}