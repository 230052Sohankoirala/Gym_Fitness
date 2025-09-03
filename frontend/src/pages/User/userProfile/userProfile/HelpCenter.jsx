import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { ArrowLeft, Settings, User, Bell, HelpCircle, Mail, MessageCircle, Shield, FileText } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const HelpCenter = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const [openSection, setOpenSection] = useState({});
    const [openItem, setOpenItem] = useState({});

    const toggleSection = (title) =>
        setOpenSection((s) => ({ ...s, [title]: !s[title] }));

    const toggleItem = (sectionTitle, itemName) => {
        const key = `${sectionTitle}::${itemName}`;
        setOpenItem((s) => ({ ...s, [key]: !s[key] }));
    };

    // Replaces routes with nested inline content
    const Links = useMemo(
        () => [
            {
                title: "Billings",
                icon: <Settings size={18} />,
                items: [
                    {
                        name: "Plans & Pricing",
                        icon: <User size={16} />,
                        content: (
                            <div className="space-y-2 text-sm md:text-base">
                                <p><strong>Free:</strong> Basic tracking, limited history.</p>
                                <p><strong>Pro:</strong> Advanced analytics, unlimited history, workout videos.</p>
                                <p><strong>Coach:</strong> Everything in Pro + coach insights.</p>
                                <p>Billing is monthly; cancel anytime from Settings → Billing.</p>
                            </div>
                        ),
                    },
                    {
                        name: "Payment Methods",
                        icon: <Bell size={16} />,
                        content: (
                            <div className="space-y-2 text-sm md:text-base">
                                <p>We currently accept major credit/debit cards and digital wallets.</p>
                                <p>To update: Settings → Billing → Payment Method → <em>Update</em>.</p>
                                <p>Failed charges retry automatically within 72 hours.</p>
                            </div>
                        ),
                    },
                    {
                        name: "Refund Policy",
                        icon: <Bell size={16} />,
                        content: (
                            <div className="space-y-2 text-sm md:text-base">
                                <p>We offer refunds for accidental duplicate charges or billing errors.</p>
                                <p>Contact Support within 14 days with your invoice ID.</p>
                                <p>Pro-rated refunds aren’t offered mid-cycle.</p>
                            </div>
                        ),
                    },
                ],
            },
            {
                title: "FAQs",
                icon: <HelpCircle size={18} />,
                items: [
                    {
                        name: "General Questions",
                        icon: <User size={16} />,
                        items: [
                            {
                                name: "Do I need internet?",
                                content: (
                                    <p className="text-sm md:text-base">
                                        Most features work offline. Videos and cloud sync require internet.
                                    </p>
                                ),
                            },
                            {
                                name: "How are calories estimated?",
                                content: (
                                    <p className="text-sm md:text-base">
                                        Estimates use standard MET values adjusted for weight/height. For accuracy, pair with a wearable.
                                    </p>
                                ),
                            },
                            {
                                name: "Can I export my data?",
                                content: (
                                    <p className="text-sm md:text-base">
                                        Yes. Settings → Privacy → Export Data (JSON/CSV).
                                    </p>
                                ),
                            },
                        ],
                    },
                    {
                        name: "Workouts & Tracking",
                        icon: <Bell size={16} />,
                        items: [
                            {
                                name: "Log a workout",
                                content: (
                                    <div className="text-sm md:text-base space-y-1">
                                        <p>Home → Workouts → <em>New</em> → Fill details → Save.</p>
                                        <p>Tip: Create templates for frequently repeated sessions.</p>
                                    </div>
                                ),
                            },
                            {
                                name: "Video won’t play",
                                content: (
                                    <div className="text-sm md:text-base space-y-1">
                                        <p>Check connection → Try another video → Reopen app.</p>
                                        <p>If persists, clear cache and try again.</p>
                                    </div>
                                ),
                            },
                        ],
                    },
                    {
                        name: "Nutrition",
                        icon: <Bell size={16} />,
                        items: [
                            {
                                name: "Add meals",
                                content: (
                                    <p className="text-sm md:text-base">
                                        Nutrition → <em>Log Meal</em> → search or add custom foods → Save.
                                    </p>
                                ),
                            },
                            {
                                name: "Change units (g/oz)",
                                content: (
                                    <p className="text-sm md:text-base">
                                        Settings → Units → switch between metric/imperial for foods and weights.
                                    </p>
                                ),
                            },
                        ],
                    },
                ],
            },
            {
                title: "Support",
                icon: <Settings size={18} />,
                items: [
                    {
                        name: "Troubleshooting",
                        icon: <User size={16} />,
                        content: (
                            <ul className="list-disc pl-5 text-sm md:text-base space-y-1">
                                <li>Force close and reopen the app.</li>
                                <li>Check for updates in the app store.</li>
                                <li>Toggle network (Wi-Fi ↔ mobile data).</li>
                                <li>Clear app cache from device settings.</li>
                            </ul>
                        ),
                    },
                    {
                        name: "Report a Problem",
                        icon: <Bell size={16} />,
                        content: (
                            <div className="text-sm md:text-base space-y-2">
                                <p>Include steps to reproduce, screenshots, and app version.</p>
                                <p>Send via in-app form (Settings → Support) or email support.</p>
                            </div>
                        ),
                    },
                    {
                        name: "App Guide",
                        icon: <Bell size={16} />,
                        content: (
                            <div className="text-sm md:text-base space-y-2">
                                <p>Start with Dashboard → explore Workouts/Nutrition/Progress.</p>
                                <p>Enable notifications for streaks and reminders.</p>
                            </div>
                        ),
                    },
                ],
            },
            {
                title: "Terms",
                icon: <FileText size={18} />,
                items: [
                    {
                        name: "Terms of Service",
                        icon: <FileText size={16} />,
                        content: (
                            <p className="text-sm md:text-base">
                                Use of the app implies acceptance of our terms regarding fair use, content, and limitations of liability.
                            </p>
                        ),
                    },
                    {
                        name: "User Responsibilities",
                        icon: <User size={16} />,
                        content: (
                            <p className="text-sm md:text-base">
                                Maintain accurate health info, exercise safely, and follow medical advice where applicable.
                            </p>
                        ),
                    },
                ],
            },
            {
                title: "Privacy",
                icon: <Shield size={18} />,
                items: [
                    {
                        name: "Privacy Policy",
                        icon: <Shield size={16} />,
                        content: (
                            <p className="text-sm md:text-base">
                                We minimize data collection and never sell personal info. See policy summary here.
                            </p>
                        ),
                    },
                    {
                        name: "Data Usage",
                        icon: <Shield size={16} />,
                        content: (
                            <p className="text-sm md:text-base">
                                Data is used to provide features (analytics, sync) and improve product quality.
                            </p>
                        ),
                    },
                ],
            },
            {
                title: "Contact",
                icon: <Settings size={18} />,
                items: [
                    {
                        name: "Email Support",
                        icon: <Mail size={16} />,
                        content: (
                            <p className="text-sm md:text-base">
                                Reach us at <span className="font-medium">support@fittrack.app</span> (24–48h response).

                                <Link
                                    to="/contact"
                                    className="inline-flex items-center rounded-lg px-3 ml-3 py-1.5 text-sm font-medium border border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    aria-label="Open contact form"
                                >
                                    Contact form
                                </Link>
                            </p>
                        ),
                    },
                    {
                        name: "Live Chat",
                        icon: <MessageCircle size={16} />,
                        content: (
                            <p className="text-sm md:text-base flex items-center gap-2 flex-wrap">
                                <span>Chat with us on</span> <span className="font-medium">FitTrack Support</span>
                            </p>
                        ),
                    },
                    {
                        name: "Feedback",
                        icon: <Bell size={16} />,
                        content: (

                            <>
                                <p className="text-sm md:text-base">
                                    Suggest features or report bugs

                                </p>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="feedback"
                                        className="block text-sm md:text-base font-medium text-gray-900 dark:text-white"
                                    >
                                        Suggest features or report bugs
                                    </label>

                                    <textarea
                                        id="feedback"
                                        name="feedback"
                                        rows={5}
                                        minLength={10}
                                        maxLength={500}
                                        required
                                        placeholder="Describe the feature or bug…"
                                        className="w-full rounded-lg px-3 py-2 text-sm md:text-base
                                        bg-white dark:bg-gray-900
                                        text-gray-900 dark:text-white
                                        placeholder:text-gray-500 dark:placeholder:text-gray-400
                                        border border-gray-300 dark:border-gray-700
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        aria-describedby="feedback-help"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg px-3 py-2 text-sm md:text-base font-medium
                                        bg-indigo-500 hover:bg-indigo-600
                                        text-white
                                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Submit
                                    </button>

                                    <p
                                        id="feedback-help"
                                        className="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        Minimum 10 characters • Max 500
                                    </p>
                                </div>

                            </>
                        ),
                    },
                ],
            },
        ],
        [/* no deps */]
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.15, staggerChildren: 0.06 } },
    };

    const cardVariants = {
        hidden: { y: 16, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 16 } },
    };

    const SectionHeader = ({ title, icon, expanded, onClick }) => (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full p-4 flex items-center justify-between"
            aria-expanded={expanded}
        >
            <div className="flex items-center">
                <span className={`${darkMode ? "text-gray-300" : "text-gray-600"} mr-3`}>{icon}</span>
                <span className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{title}</span>
            </div>
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ArrowLeft size={18} className={`${darkMode ? "text-gray-400" : "text-gray-500"} rotate-180`} />
            </motion.div>
        </motion.button>
    );

    const ItemRow = ({ sectionTitle, item }) => {
        const hasChildren = Array.isArray(item.items) && item.items.length > 0;
        const key = `${sectionTitle}::${item.name}`;
        const expanded = !!openItem[key];

        return (
            <div className={`border-b ${darkMode ? "border-gray-700" : "border-gray-100"} last:border-b-0`}>
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => (hasChildren || item.content ? toggleItem(sectionTitle, item.name) : null)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            hasChildren || item.content ? toggleItem(sectionTitle, item.name) : null;
                        }
                    }}
                    className={`flex items-center justify-between p-3 cursor-pointer rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        }`}
                >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>{item.icon}</span>
                        <span className={`font-medium truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{item.name}</span>
                    </div>
                    {(hasChildren || item.content) && (
                        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ArrowLeft size={16} className={`${darkMode ? "text-gray-400" : "text-gray-400"} rotate-180`} />
                        </motion.div>
                    )}
                </div>

                <AnimatePresence>
                    {(hasChildren || item.content) && expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="pl-6 pr-3 pb-3 space-y-2">
                                {hasChildren
                                    ? item.items.map((sub) => (
                                        <div
                                            key={sub.name}
                                            className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                {sub.icon ? <span className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>{sub.icon}</span> : null}
                                                <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
                                                    {sub.name}
                                                </span>
                                            </div>
                                            <div className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{sub.content}</div>
                                        </div>
                                    ))
                                    : <div className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>{item.content}</div>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const handleBack = () => navigate("/profile");

    return (
        <div className={`min-h-screen w-full transition-colors duration-200 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`w-full ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}
            >
                <div className="flex p-4 w-full max-w-2xl mx-auto items-center">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBack}
                        className={`p-2 rounded-full mr-2 ${darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-200 text-gray-800"}`}
                        aria-label="Go back"
                    >
                        <ArrowLeft size={22} />
                    </motion.button>
                    <h1 className={`text-xl md:text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Help Center</h1>
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {Links.map((section) => {
                        const expanded = !!openSection[section.title];
                        return (
                            <motion.div
                                key={section.title}
                                variants={cardVariants}
                                className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
                            >
                                <SectionHeader
                                    title={section.title}
                                    icon={section.icon}
                                    expanded={expanded}
                                    onClick={() => toggleSection(section.title)}
                                />
                                <AnimatePresence>
                                    {expanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4">
                                                {section.items.map((item) => (
                                                    <ItemRow key={item.name} sectionTitle={section.title} item={item} />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default HelpCenter;
