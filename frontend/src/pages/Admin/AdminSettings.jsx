import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    ArrowLeft,
    ChevronRight,
    Settings,
    Building2,
    Shield,
    Dumbbell,
    CalendarClock,
    CreditCard,
    Bell,
    DatabaseBackup,
    FileDown,
    Upload,
    Eye,
    EyeOff,
    Check,
    X,
    LogOut,
    KeyRound,
    Mail,
    LockKeyhole,
    ServerCog,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * AdminSettings (responsive & simplified)
 * Sections: Organization, Trainers, Classes & Scheduling, Billing & Payments,
 *           Security, Notifications, Backups & Data, Danger Zone
 */

const AdminSettings = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme?.() ?? { darkMode: false };

    // --------- Global page state ----------
    const [logoutModal, setLogoutModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [expanded, setExpanded] = useState({
        org: true,
        trainers: false,
        classes: false,
        billing: false,
        security: false,
        notifications: false,
        backups: false,
    });

    // --------- Form states ----------
    const [org, setOrg] = useState({
        orgName: "FitTrack Gym",
        orgEmail: "admin@fittrack.com",
        orgPhone: "+61 400 000 000",
        timezone: "Australia/Sydney",
        maintenanceMode: false,
    });

    const [trainersSettings, setTrainersSettings] = useState({
        requireVerification: true,
        showTrainerRatings: true,
        maxClientsPerTrainer: 50,
    });

    const [classPolicy, setClassPolicy] = useState({
        defaultDurationMins: 60,
        cancelWindowHours: 12,
        autoWaitlist: true,
        maxCapacity: 20,
    });

    const [billing, setBilling] = useState({
        currency: "AUD",
        taxRatePercent: 10,
        gateway: "Stripe",
        stripePublic: "pk_live_xxxx",
        stripeSecret: "sk_live_xxxx",
        invoicesFrom: "billing@fittrack.com",
    });

    const [showSecrets, setShowSecrets] = useState({ stripeSecret: false });

    const [security, setSecurity] = useState({
        enforce2FA: false,
        passwordMinLength: 8,
        lockoutThreshold: 5,
        ipAllowlist: "",
    });

    const [notifications, setNotifications] = useState({
        emailFrom: "noreply@fittrack.com",
        provider: "SendGrid",
        transactionalOn: true,
        marketingOn: false,
        smsEnabled: false,
    });

    const [backups, setBackups] = useState({
        schedule: "Daily",
        retentionDays: 14,
        autoDownload: false,
    });

    // --------- UI helpers ----------
    const sectionCard = useMemo(
        () =>
            `rounded-xl shadow-sm overflow-hidden transition-colors duration-200 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`,
        [darkMode]
    );

    const inputBase =
        "w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition";
    const inputTheme = darkMode
        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500"
        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500";

    const labelTheme = darkMode ? "text-gray-300" : "text-gray-700";
    const divider = darkMode ? "border-gray-700" : "border-gray-200";

    // ---------- actions ----------
    const toggleSection = (key) => setExpanded((s) => ({ ...s, [key]: !s[key] }));
    const handleBack = () => navigate("/admin");

    const onSaveAll = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        }, 800);
    };

    const handleLogout = () => {
        setLogoutModal(false);
        navigate("/login");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { delayChildren: 0.2, staggerChildren: 0.06 },
        },
    };

    const itemVariants = {
        hidden: { y: 14, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 130, damping: 14 },
        },
    };

    return (
        <div
            className={`min-h-screen w-full overflow-x-hidden transition-colors duration-200 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                }`}
        >
            {/* Header */}
            <motion.div
                initial={{ y: -18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35 }}
                className={`transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-gray-100"
                    }`}
            >
                <div className="flex items-center p-4 sm:p-5 max-w-5xl mx-auto">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBack}
                        className={`p-2 rounded-full mr-3 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                            }`}
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold flex items-center gap-2">
                        <Settings size={20} />
                        Admin Settings
                    </h1>
                    <div className="ml-auto">
                        <button
                            onClick={() => setLogoutModal(true)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${darkMode
                                ? "bg-gray-800 hover:bg-gray-700 text-red-300"
                                : "bg-white hover:bg-gray-50 border border-gray-200 text-red-500"
                                }`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <LogOut size={16} />
                                Log Out
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Save Bar */}
            <div className="sticky top-0 z-30 px-4">
                <AnimatePresence>
                    {(saving || showSaved) && (
                        <motion.div
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            className={`mx-auto max-w-5xl mt-2 rounded-xl px-4 py-3 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                                } shadow`}
                        >
                            <div className="flex items-center gap-2">
                                {saving ? (
                                    <ServerCog className="animate-spin" size={18} />
                                ) : (
                                    <Check size={18} className="text-green-500" />
                                )}
                                <p className="text-sm">
                                    {saving ? "Saving changes..." : "All changes saved!"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Content */}
            <div className="w-full max-w-5xl mx-auto px-4 md:px-5 py-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {/* Organization */}
                    <Section
                        title="Organization"
                        icon={<Building2 size={18} />}
                        expanded={expanded.org}
                        onToggle={() => toggleSection("org")}
                        className={sectionCard}
                        itemVariants={itemVariants}
                        darkMode={darkMode}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Organization Name"
                                value={org.orgName}
                                onChange={(v) => setOrg((s) => ({ ...s, orgName: v }))}
                                placeholder="Your organization name"
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <Input
                                label="Email"
                                value={org.orgEmail}
                                onChange={(v) => setOrg((s) => ({ ...s, orgEmail: v }))}
                                placeholder="admin@example.com"
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                                leftIcon={<Mail size={16} />}
                            />
                            <Input
                                label="Phone"
                                value={org.orgPhone}
                                onChange={(v) => setOrg((s) => ({ ...s, orgPhone: v }))}
                                placeholder="+61 ..."
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <Input
                                label="Timezone"
                                value={org.timezone}
                                onChange={(v) => setOrg((s) => ({ ...s, timezone: v }))}
                                placeholder="Region/City"
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                        </div>
                        <ToggleRow
                            label="Maintenance Mode"
                            description="Temporarily disable member-facing features while performing updates."
                            enabled={org.maintenanceMode}
                            onChange={(v) => setOrg((s) => ({ ...s, maintenanceMode: v }))}
                            darkMode={darkMode}
                        />
                        <Actions
                            onSave={onSaveAll}
                            saving={saving}
                            darkMode={darkMode}
                            divider={divider}
                        />
                    </Section>

                    {/* Trainers */}
                    <Section
                        title="Trainers"
                        icon={<Shield size={18} />}
                        expanded={expanded.trainers}
                        onToggle={() => toggleSection("trainers")}
                        className={sectionCard}
                        itemVariants={itemVariants}
                        darkMode={darkMode}
                    >
                        <ToggleRow
                            label="Require Verification"
                            description="Trainers must be approved by an admin before appearing publicly."
                            enabled={trainersSettings.requireVerification}
                            onChange={(v) =>
                                setTrainersSettings((s) => ({ ...s, requireVerification: v }))
                            }
                            darkMode={darkMode}
                        />
                        <ToggleRow
                            label="Show Ratings"
                            description="Display average trainer ratings on their profiles."
                            enabled={trainersSettings.showTrainerRatings}
                            onChange={(v) =>
                                setTrainersSettings((s) => ({ ...s, showTrainerRatings: v }))
                            }
                            darkMode={darkMode}
                        />
                        <NumberRow
                            label="Max Clients per Trainer"
                            value={trainersSettings.maxClientsPerTrainer}
                            onChange={(v) =>
                                setTrainersSettings((s) => ({
                                    ...s,
                                    maxClientsPerTrainer: Number(v) || 0,
                                }))
                            }
                            inputBase={inputBase}
                            inputTheme={inputTheme}
                            labelTheme={labelTheme}
                        />
                        <Actions
                            onSave={onSaveAll}
                            saving={saving}
                            darkMode={darkMode}
                            divider={divider}
                        />
                    </Section>

                    {/* Classes & Scheduling */}
                    <Section
                        title="Classes & Scheduling"
                        icon={<CalendarClock size={18} />}
                        expanded={expanded.classes}
                        onToggle={() => toggleSection("classes")}
                        className={sectionCard}
                        itemVariants={itemVariants}
                        darkMode={darkMode}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <NumberRow
                                label="Default Class Duration (mins)"
                                value={classPolicy.defaultDurationMins}
                                onChange={(v) =>
                                    setClassPolicy((s) => ({
                                        ...s,
                                        defaultDurationMins: Number(v) || 0,
                                    }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <NumberRow
                                label="Cancellation Window (hours)"
                                value={classPolicy.cancelWindowHours}
                                onChange={(v) =>
                                    setClassPolicy((s) => ({
                                        ...s,
                                        cancelWindowHours: Number(v) || 0,
                                    }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <NumberRow
                                label="Max Class Capacity"
                                value={classPolicy.maxCapacity}
                                onChange={(v) =>
                                    setClassPolicy((s) => ({
                                        ...s,
                                        maxCapacity: Number(v) || 0,
                                    }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                        </div>
                        <ToggleRow
                            label="Auto Waitlist"
                            description="Automatically enroll members from waitlist when a spot opens."
                            enabled={classPolicy.autoWaitlist}
                            onChange={(v) =>
                                setClassPolicy((s) => ({ ...s, autoWaitlist: v }))
                            }
                            darkMode={darkMode}
                        />
                        <Actions
                            onSave={onSaveAll}
                            saving={saving}
                            darkMode={darkMode}
                            divider={divider}
                        />
                    </Section>

                    {/* Billing & Payments */}
                    <Section
                        title="Billing & Payments"
                        icon={<CreditCard size={18} />}
                        expanded={expanded.billing}
                        onToggle={() => toggleSection("billing")}
                        className={sectionCard}
                        itemVariants={itemVariants}
                        darkMode={darkMode}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Currency"
                                value={billing.currency}
                                onChange={(v) => setBilling((s) => ({ ...s, currency: v }))}
                                placeholder="AUD"
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <NumberRow
                                label="Tax Rate (%)"
                                value={billing.taxRatePercent}
                                onChange={(v) =>
                                    setBilling((s) => ({
                                        ...s,
                                        taxRatePercent: Number(v) || 0,
                                    }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <Select
                                label="Gateway"
                                value={billing.gateway}
                                onChange={(v) =>
                                    setBilling((s) => ({ ...s, gateway: v }))
                                }
                                options={[
                                    { value: "Stripe", label: "Stripe" },
                                    { value: "Braintree", label: "Braintree" },
                                    { value: "Square", label: "Square" },
                                ]}
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <Input
                                label="Invoices From"
                                value={billing.invoicesFrom}
                                onChange={(v) =>
                                    setBilling((s) => ({ ...s, invoicesFrom: v }))
                                }
                                placeholder="billing@example.com"
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                                leftIcon={<Mail size={16} />}
                            />
                            <Input
                                label="Stripe Publishable Key"
                                value={billing.stripePublic}
                                onChange={(v) =>
                                    setBilling((s) => ({ ...s, stripePublic: v }))
                                }
                                placeholder="pk_live_..."
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                                leftIcon={<KeyRound size={16} />}
                            />
                            <SecretInput
                                label="Stripe Secret Key"
                                value={billing.stripeSecret}
                                show={showSecrets.stripeSecret}
                                onToggleShow={() =>
                                    setShowSecrets((x) => ({
                                        ...x,
                                        stripeSecret: !x.stripeSecret,
                                    }))
                                }
                                onChange={(v) =>
                                    setBilling((s) => ({ ...s, stripeSecret: v }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                        </div>
                        <Actions
                            onSave={onSaveAll}
                            saving={saving}
                            darkMode={darkMode}
                            divider={divider}
                        />
                    </Section>

                    {/* Security */}
                    <Section
                        title="Security"
                        icon={<LockKeyhole size={18} />}
                        expanded={expanded.security}
                        onToggle={() => toggleSection("security")}
                        className={sectionCard}
                        itemVariants={itemVariants}
                        darkMode={darkMode}
                    >
                        <ToggleRow
                            label="Enforce 2FA"
                            description="Require two-factor authentication for admin accounts."
                            enabled={security.enforce2FA}
                            onChange={(v) => setSecurity((s) => ({ ...s, enforce2FA: v }))}
                            darkMode={darkMode}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <NumberRow
                                label="Password Min Length"
                                value={security.passwordMinLength}
                                onChange={(v) =>
                                    setSecurity((s) => ({
                                        ...s,
                                        passwordMinLength: Number(v) || 0,
                                    }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <NumberRow
                                label="Lockout Threshold (failed attempts)"
                                value={security.lockoutThreshold}
                                onChange={(v) =>
                                    setSecurity((s) => ({
                                        ...s,
                                        lockoutThreshold: Number(v) || 0,
                                    }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                        </div>
                        <TextArea
                            label="IP Allowlist (comma separated)"
                            value={security.ipAllowlist}
                            onChange={(v) =>
                                setSecurity((s) => ({ ...s, ipAllowlist: v }))
                            }
                            placeholder="203.0.113.10, 203.0.113.42"
                            inputBase={inputBase}
                            inputTheme={inputTheme}
                            labelTheme={labelTheme}
                        />
                        <Actions
                            onSave={onSaveAll}
                            saving={saving}
                            darkMode={darkMode}
                            divider={divider}
                        />
                    </Section>

                    {/* Notifications */}
                    <Section
                        title="Notifications"
                        icon={<Bell size={18} />}
                        expanded={expanded.notifications}
                        onToggle={() => toggleSection("notifications")}
                        className={sectionCard}
                        itemVariants={itemVariants}
                        darkMode={darkMode}
                    >
                        <Input
                            label="Email From"
                            value={notifications.emailFrom}
                            onChange={(v) =>
                                setNotifications((s) => ({ ...s, emailFrom: v }))
                            }
                            placeholder="noreply@example.com"
                            inputBase={inputBase}
                            inputTheme={inputTheme}
                            labelTheme={labelTheme}
                            leftIcon={<Mail size={16} />}
                        />
                        <Select
                            label="Provider"
                            value={notifications.provider}
                            onChange={(v) =>
                                setNotifications((s) => ({ ...s, provider: v }))
                            }
                            options={[
                                { value: "SendGrid", label: "SendGrid" },
                                { value: "Postmark", label: "Postmark" },
                                { value: "SES", label: "Amazon SES" },
                            ]}
                            inputBase={inputBase}
                            inputTheme={inputTheme}
                            labelTheme={labelTheme}
                        />
                        <ToggleRow
                            label="Transactional Emails"
                            description="Send booking confirmations, receipts, and critical alerts."
                            enabled={notifications.transactionalOn}
                            onChange={(v) =>
                                setNotifications((s) => ({ ...s, transactionalOn: v }))
                            }
                            darkMode={darkMode}
                        />
                        <ToggleRow
                            label="Marketing Emails"
                            description="Send newsletters and promotional campaigns."
                            enabled={notifications.marketingOn}
                            onChange={(v) =>
                                setNotifications((s) => ({ ...s, marketingOn: v }))
                            }
                            darkMode={darkMode}
                        />
                        <ToggleRow
                            label="SMS Alerts"
                            description="Enable SMS notifications for time-sensitive updates."
                            enabled={notifications.smsEnabled}
                            onChange={(v) =>
                                setNotifications((s) => ({ ...s, smsEnabled: v }))
                            }
                            darkMode={darkMode}
                        />
                        <Actions
                            onSave={onSaveAll}
                            saving={saving}
                            darkMode={darkMode}
                            divider={divider}
                        />
                    </Section>

                    {/* Backups & Data */}
                    <Section
                        title="Backups & Data"
                        icon={<DatabaseBackup size={18} />}
                        expanded={expanded.backups}
                        onToggle={() => toggleSection("backups")}
                        className={sectionCard}
                        itemVariants={itemVariants}
                        darkMode={darkMode}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                label="Backup Schedule"
                                value={backups.schedule}
                                onChange={(v) => setBackups((s) => ({ ...s, schedule: v }))}
                                options={[
                                    { value: "Hourly", label: "Hourly" },
                                    { value: "Daily", label: "Daily" },
                                    { value: "Weekly", label: "Weekly" },
                                ]}
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                            <NumberRow
                                label="Retention (days)"
                                value={backups.retentionDays}
                                onChange={(v) =>
                                    setBackups((s) => ({
                                        ...s,
                                        retentionDays: Number(v) || 0,
                                    }))
                                }
                                inputBase={inputBase}
                                inputTheme={inputTheme}
                                labelTheme={labelTheme}
                            />
                        </div>
                        <ToggleRow
                            label="Auto Download"
                            description="Automatically download backups to a secure storage."
                            enabled={backups.autoDownload}
                            onChange={(v) =>
                                setBackups((s) => ({ ...s, autoDownload: v }))
                            }
                            darkMode={darkMode}
                        />
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                            <button
                                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium inline-flex items-center justify-center gap-2"
                                onClick={() => onSaveAll()}
                            >
                                <FileDown size={16} />
                                Export Data
                            </button>
                            <button
                                className={`w-full sm:w-auto px-3 py-2 rounded-lg border text-sm font-medium inline-flex items-center justify-center gap-2 ${darkMode
                                    ? "border-gray-700 hover:bg-gray-700"
                                    : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                onClick={() => onSaveAll()}
                            >
                                <Upload size={16} />
                                Import Data
                            </button>
                        </div>
                        <Actions
                            onSave={onSaveAll}
                            saving={saving}
                            darkMode={darkMode}
                            divider={divider}
                        />
                    </Section>
                </motion.div>

                {/* Danger Zone */}
                <div className={`mt-8 ${sectionCard} p-4`}>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Shield size={18} /> Danger Zone
                    </h3>
                    <p className="text-sm opacity-80">
                        These actions are destructive. Proceed with caution.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <button
                            className="w-full px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
                            onClick={() => alert("All caches cleared")}
                        >
                            Clear Caches
                        </button>
                        <button
                            className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${darkMode
                                ? "border-gray-700 hover:bg-gray-800"
                                : "border-gray-200 hover:bg-gray-50"
                                }`}
                            onClick={() => alert("All sessions invalidated")}
                        >
                            Invalidate Sessions
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {logoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => setLogoutModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 18 }}
                            className={`rounded-xl p-6 w-full max-w-md mx-4 ${darkMode ? "bg-gray-800" : "bg-white"
                                }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Confirm Logout</h3>
                                <button onClick={() => setLogoutModal(false)} aria-label="Close dialog">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="mb-6 opacity-80">Are you sure you want to log out?</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setLogoutModal(false)}
                                    className={`flex-1 py-2.5 rounded-lg ${darkMode
                                        ? "bg-gray-700 hover:bg-gray-600"
                                        : "bg-gray-100 hover:bg-gray-200"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ---------------- Reusable UI bits ---------------- */

const Section = ({ title, icon, expanded, onToggle, className, children, itemVariants, darkMode }) => (
    <motion.div variants={itemVariants} className={className}>
        <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 sm:p-5 flex items-center justify-between"
            onClick={onToggle}
            aria-expanded={expanded}
        >
            <div className="flex items-center gap-3">
                <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{icon}</span>
                <span className="font-medium">{title}</span>
            </div>
            <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400"
            >
                <ChevronRight size={20} />
            </motion.div>
        </motion.button>

        <AnimatePresence initial={false}>
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                >
                    <div className="px-4 sm:px-5 pb-5">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const Input = ({ label, value, onChange, placeholder, inputBase, inputTheme, labelTheme, leftIcon }) => (
    <div>
        <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
        <div className="relative">
            {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">{leftIcon}</span>}
            <input
                className={`${inputBase} ${inputTheme} ${leftIcon ? "pl-9" : ""}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    </div>
);

const SecretInput = ({ label, value, onChange, show, onToggleShow, inputBase, inputTheme, labelTheme }) => (
    <div>
        <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                className={`${inputBase} ${inputTheme} pr-10`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <button
                type="button"
                onClick={onToggleShow}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
                aria-label={show ? "Hide secret" : "Show secret"}
            >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    </div>
);

const TextArea = ({ label, value, onChange, placeholder, inputBase, inputTheme, labelTheme }) => (
    <div>
        <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
        <textarea
            rows={3}
            className={`${inputBase} ${inputTheme}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

const Select = ({ label, value, onChange, options, inputBase, inputTheme, labelTheme }) => (
    <div>
        <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
        <select
            className={`${inputBase} ${inputTheme}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
);

const ToggleRow = ({
    label,
    description,
    enabled,
    onChange,
    darkMode,
    disabled = false,
}) => {
    const ring = darkMode ? "focus:ring-indigo-400" : "focus:ring-indigo-500";
    const trackOff = darkMode ? "bg-gray-700" : "bg-gray-300";

    return (
        <div className="flex items-start justify-between gap-3 sm:gap-4 py-3">
            {/* Text side (wraps nicely on small screens) */}
            <div className="min-w-0">
                <p className="font-medium break-words">{label}</p>
                {description && (
                    <p className="text-sm opacity-80 mt-0.5 break-words">{description}</p>
                )}
            </div>

            {/* Switch (never shrinks; easy to tap on mobile) */}
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={label}
                aria-disabled={disabled}
                onClick={() => !disabled && onChange(!enabled)}
                onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(!enabled);
                    }
                }}
                className={[
                    "relative inline-flex items-center rounded-full transition",
                    "h-7 w-14 sm:h-6 sm:w-12", // slightly larger on very small screens
                    enabled ? "bg-indigo-600" : trackOff,
                    disabled
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 " + ring,
                    "shrink-0 select-none touch-manipulation", // keep size, improve touch
                ].join(" ")}
            >
                <span
                    className={[
                        "inline-block rounded-full bg-white transform transition",
                        "h-5 w-5 sm:h-4 sm:w-4", // knob scales with track
                        enabled ? "translate-x-7 sm:translate-x-6" : "translate-x-1",
                        "shadow",
                    ].join(" ")}
                />
            </button>
        </div>
    );
};


const NumberRow = ({ label, value, onChange, inputBase, inputTheme, labelTheme }) => (
    <div className="max-w-xs">
        <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
        <input
            type="number"
            className={`${inputBase} ${inputTheme}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const Actions = ({ onSave, saving, darkMode, divider }) => (
    <div className={`pt-4 mt-4 border-t ${divider} flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between`}>
        <div className="text-xs opacity-70 inline-flex items-center gap-2">
            <Dumbbell size={14} />
            <span>Tip: Press Save to persist changes.</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
                className={`w-full sm:w-auto px-3 py-2 rounded-lg border text-sm font-medium ${darkMode ? "border-gray-700 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"
                    }`}
                onClick={() => window.location.reload()}
            >
                Discard
            </button>
            <button
                onClick={onSave}
                disabled={saving}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white text-sm font-medium ${saving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
            >
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
    </div>
);

export default AdminSettings;
