// src/pages/admin/AdminSettings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Save, AlertCircle, LogOut } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:4000";

const AdminSettings = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ✅ IMPORTANT: Keep the same structure as your backend
    const [settings, setSettings] = useState({
        organization: {
            name: "FitTrack Gym",
            email: "admin@fittrack.com",
            phone: "",
            timezone: "Australia/Sydney",
            maintenanceMode: false,
        },
        billing: {
            currency: "AUD",
            taxRatePercent: 10,
            gateway: "Stripe",
            invoicesFrom: "billing@fittrack.com",
        },
        notifications: {
            emailFrom: "noreply@fittrack.com",
            provider: "SendGrid",
            transactionalOn: true,
            marketingOn: false,
            smsEnabled: false,
        },
    });

    const page = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
    const card = useMemo(
        () =>
            `rounded-2xl border p-5 shadow-sm transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`,
        [darkMode]
    );
    const muted = darkMode ? "text-gray-300" : "text-gray-600";

    const input =
        `w-full px-3 py-2 rounded-xl border outline-none transition focus:ring-2 focus:ring-indigo-500 ` +
        (darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900");

    const authHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const apiFetch = async (path, { method = "GET", body } = {}) => {
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: body ? JSON.stringify(body) : undefined,
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
            throw new Error(data?.message || `Request failed: ${res.status}`);
        }
        return data;
    };

    const load = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const data = await apiFetch("/api/settings");

            // ✅ Safe merge (backend returns big doc but we only keep needed parts)
            setSettings((prev) => ({
                organization: { ...prev.organization, ...(data?.organization || {}) },
                billing: { ...prev.billing, ...(data?.billing || {}) },
                notifications: { ...prev.notifications, ...(data?.notifications || {}) },
            }));
        } catch (e) {
            setError(e.message || "Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            // ✅ Send same structure as backend expects
            await apiFetch("/api/settings", { method: "PUT", body: settings });

            setSuccess("Settings saved ✅");
            setTimeout(() => setSuccess(""), 1500);
        } catch (e) {
            setError(e.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        // Clear authentication tokens
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login page
        navigate("/");
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setOrg = (key, value) =>
        setSettings((s) => ({ ...s, organization: { ...s.organization, [key]: value } }));

    const setBilling = (key, value) =>
        setSettings((s) => ({ ...s, billing: { ...s.billing, [key]: value } }));

    const setNotif = (key, value) =>
        setSettings((s) => ({ ...s, notifications: { ...s.notifications, [key]: value } }));

    return (
        <div className={`min-h-screen p-6 ${page}`}>
            {/* Header */}
            <div className="max-w-4xl mx-auto flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate("/admin")}
                    className={`p-2 rounded-xl transition ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
                    title="Back to Dashboard"
                >
                    <ArrowLeft size={18} />
                </button>

                <div className="min-w-0">
                    <h1 className="text-2xl font-bold">Admin Settings</h1>
                    <p className={`text-sm ${muted}`}>Simple settings page (backend connected)</p>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={load}
                        disabled={loading || saving}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${darkMode ? "border-gray-700 bg-gray-800 hover:bg-gray-700" : "border-gray-200 bg-white hover:bg-gray-100"
                            }`}
                    >
                        <RefreshCw size={16} />
                        Reload
                    </button>

                    <button
                        onClick={save}
                        disabled={loading || saving}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition ${saving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                    >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${darkMode
                            ? "border-red-700 bg-red-900/30 hover:bg-red-800 text-red-200"
                            : "border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                            }`}
                        title="Logout"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Alerts */}
            <div className="max-w-4xl mx-auto mb-4 space-y-2">
                {error && (
                    <div
                        className={`rounded-xl border p-3 flex items-center gap-2 ${darkMode ? "bg-red-900/30 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-700"
                            }`}
                    >
                        <AlertCircle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                {success && (
                    <div
                        className={`rounded-xl border p-3 ${darkMode
                            ? "bg-emerald-900/30 border-emerald-800 text-emerald-200"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                            }`}
                    >
                        <span className="text-sm">{success}</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="max-w-4xl mx-auto">Loading...</div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Organization */}
                    <div className={card}>
                        <h2 className="text-lg font-semibold">Organization</h2>
                        <p className={`text-sm ${muted} mb-4`}>Basic gym information.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={`text-sm ${muted}`}>Name</label>
                                <input className={input} value={settings.organization.name} onChange={(e) => setOrg("name", e.target.value)} />
                            </div>
                            <div>
                                <label className={`text-sm ${muted}`}>Email</label>
                                <input className={input} value={settings.organization.email} onChange={(e) => setOrg("email", e.target.value)} />
                            </div>
                            <div>
                                <label className={`text-sm ${muted}`}>Phone</label>
                                <input className={input} value={settings.organization.phone} onChange={(e) => setOrg("phone", e.target.value)} />
                            </div>
                            <div>
                                <label className={`text-sm ${muted}`}>Timezone</label>
                                <input className={input} value={settings.organization.timezone} onChange={(e) => setOrg("timezone", e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div>
                                <p className="font-medium">Maintenance Mode</p>
                                <p className={`text-sm ${muted}`}>Disable member actions temporarily.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOrg("maintenanceMode", !settings.organization.maintenanceMode)}
                                className={`relative inline-flex items-center h-6 w-12 rounded-full transition ${settings.organization.maintenanceMode ? "bg-indigo-600" : darkMode ? "bg-gray-700" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 bg-white rounded-full transform transition ${settings.organization.maintenanceMode ? "translate-x-7" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Billing */}
                    <div className={card}>
                        <h2 className="text-lg font-semibold">Billing</h2>
                        <p className={`text-sm ${muted} mb-4`}>Main payment configuration.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={`text-sm ${muted}`}>Currency</label>
                                <input className={input} value={settings.billing.currency} onChange={(e) => setBilling("currency", e.target.value)} />
                            </div>

                            <div>
                                <label className={`text-sm ${muted}`}>Tax Rate (%)</label>
                                <input
                                    type="number"
                                    className={input}
                                    value={settings.billing.taxRatePercent}
                                    onChange={(e) => setBilling("taxRatePercent", Number(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className={`text-sm ${muted}`}>Gateway</label>
                                <select className={input} value={settings.billing.gateway} onChange={(e) => setBilling("gateway", e.target.value)}>
                                    <option value="Stripe">Stripe</option>
                                    <option value="Square">Square</option>
                                    <option value="Braintree">Braintree</option>
                                </select>
                            </div>

                            <div>
                                <label className={`text-sm ${muted}`}>Invoices From</label>
                                <input className={input} value={settings.billing.invoicesFrom} onChange={(e) => setBilling("invoicesFrom", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className={card}>
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        <p className={`text-sm ${muted} mb-4`}>Email notification controls.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={`text-sm ${muted}`}>Email From</label>
                                <input className={input} value={settings.notifications.emailFrom} onChange={(e) => setNotif("emailFrom", e.target.value)} />
                            </div>

                            <div>
                                <label className={`text-sm ${muted}`}>Provider</label>
                                <input className={input} value={settings.notifications.provider} onChange={(e) => setNotif("provider", e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <ToggleRow
                                darkMode={darkMode}
                                label="Transactional Emails"
                                desc="Receipts, booking confirmation, important updates"
                                enabled={!!settings.notifications.transactionalOn}
                                onChange={() => setNotif("transactionalOn", !settings.notifications.transactionalOn)}
                            />

                            <ToggleRow
                                darkMode={darkMode}
                                label="Marketing Emails"
                                desc="Offers, promotions, newsletters"
                                enabled={!!settings.notifications.marketingOn}
                                onChange={() => setNotif("marketingOn", !settings.notifications.marketingOn)}
                            />

                            <ToggleRow
                                darkMode={darkMode}
                                label="SMS Enabled"
                                desc="Allow SMS notifications"
                                enabled={!!settings.notifications.smsEnabled}
                                onChange={() => setNotif("smsEnabled", !settings.notifications.smsEnabled)}
                            />
                        </div>
                    </div>

                    {/* Logout Card (Optional - Alternative placement) */}
                    <div className={card}>
                        <h2 className="text-lg font-semibold">Session</h2>
                        <p className={`text-sm ${muted} mb-4`}>Manage your admin session.</p>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">End Session</p>
                                <p className={`text-sm ${muted}`}>Logout from admin panel</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${darkMode
                                    ? "bg-red-700 hover:bg-red-600 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                    }`}
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ToggleRow = ({ label, desc, enabled, onChange, darkMode }) => (
    <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
            <p className="font-medium">{label}</p>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{desc}</p>
        </div>

        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex items-center h-6 w-12 rounded-full transition ${enabled ? "bg-indigo-600" : darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 bg-white rounded-full transform transition ${enabled ? "translate-x-7" : "translate-x-1"
                    }`}
            />
        </button>
    </div>
);

export default AdminSettings;