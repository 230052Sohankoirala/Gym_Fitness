// src/pages/user/settings/HelpCenter.jsx
import React, { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";// eslint-disable-line no-unused-vars
import {
  ArrowLeft,
  Settings,
  User,
  Bell,
  HelpCircle,
  Mail,
  MessageCircle,
  Shield,
  FileText,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";


/* ---------------- Small helper: preserve scroll to stop jumps ---------------- */
const preserveScroll = (fn) => {
  const y = window.scrollY;
  fn();
  requestAnimationFrame(() => window.scrollTo({ top: y }));
};

/* ---------------- Feedback Form Component (stable, no re-render explosions) ---------------- */
function FeedbackForm({ darkMode }) {
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("other");
  const [feedbackPriority, setFeedbackPriority] = useState("medium");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState({ type: "", message: "" });

  const submitFeedbackToApi = useCallback(async () => {
    const clean = String(feedbackText || "").trim();

    if (!token) {
      setFeedbackAlert({ type: "error", message: "Please login first to submit feedback." });
      return;
    }
    if (clean.length < 10) {
      setFeedbackAlert({ type: "error", message: "Please write at least 10 characters." });
      return;
    }
    if (clean.length > 500) {
      setFeedbackAlert({ type: "error", message: "Maximum 500 characters allowed." });
      return;
    }

    setFeedbackSending(true);
    setFeedbackAlert({ type: "info", message: "Submitting your feedback..." });

    try {
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: clean,
          category: feedbackCategory,
          priority: feedbackPriority,
          platform: "web",
          appVersion: "1.0.0",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to submit feedback.");

      setFeedbackText("");
      setFeedbackCategory("other");
      setFeedbackPriority("medium");

      setFeedbackAlert({
        type: "success",
        message: "✅ Thanks! Your feedback has been sent to the admin team.",
      });

      setTimeout(() => setFeedbackAlert({ type: "", message: "" }), 2000);
    } catch (e) {
      setFeedbackAlert({ type: "error", message: e?.message || "Submit failed. Please try again." });
    } finally {
      setFeedbackSending(false);
    }
  }, [feedbackText, feedbackCategory, feedbackPriority, token]);

  const alertClass =
    feedbackAlert.type === "success"
      ? darkMode
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : feedbackAlert.type === "error"
      ? darkMode
        ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
        : "border-rose-200 bg-rose-50 text-rose-700"
      : darkMode
      ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-200"
      : "border-indigo-200 bg-indigo-50 text-indigo-700";

  return (
    <div className="space-y-3">
      <p className="text-sm md:text-base">Suggest features or report bugs.</p>

      {feedbackAlert?.message ? (
        <div className={`rounded-lg border px-3 py-2 text-sm ${alertClass}`}>{feedbackAlert.message}</div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">Category</label>
          <select
            value={feedbackCategory}
            onChange={(e) => setFeedbackCategory(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm
              bg-white dark:bg-gray-900 text-gray-900 dark:text-white
              border border-gray-300 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="billing">Billing</option>
            <option value="ui">UI/UX</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">Priority</label>
          <select
            value={feedbackPriority}
            onChange={(e) => setFeedbackPriority(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm
              bg-white dark:bg-gray-900 text-gray-900 dark:text-white
              border border-gray-300 dark:border-gray-700
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="feedback" className="block text-sm md:text-base font-medium text-gray-900 dark:text-white">
          Your message
        </label>

        <textarea
          id="feedback"
          name="feedback"
          rows={5}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Describe the feature or bug…"
          className="w-full resize-none rounded-lg px-3 py-2 text-sm md:text-base
            bg-white dark:bg-gray-900 text-gray-900 dark:text-white
            placeholder:text-gray-500 dark:placeholder:text-gray-400
            border border-gray-300 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
          style={{ minHeight: 130 }}
          disabled={feedbackSending}
        />

        <button
          type="button"
          onClick={submitFeedbackToApi}
          disabled={feedbackSending || feedbackText.trim().length < 10}
          className={`w-full rounded-lg px-3 py-2 text-sm md:text-base font-medium text-white
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${feedbackSending || feedbackText.trim().length < 10 ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"}`}
        >
          {feedbackSending ? "Submitting..." : "Submit"}
        </button>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <p>Minimum 10 characters • Max 500</p>
          <p>{feedbackText.length}/500</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [openSection, setOpenSection] = useState({});
  const [openItem, setOpenItem] = useState({});

  const toggleSection = (title) =>
    preserveScroll(() => setOpenSection((s) => ({ ...s, [title]: !s[title] })));

  const toggleItem = (sectionTitle, itemName) => {
    const key = `${sectionTitle}::${itemName}`;
    preserveScroll(() => setOpenItem((s) => ({ ...s, [key]: !s[key] })));
  };

  /* ✅ Make Links STATIC (no feedbackText deps) */
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
              { name: "Do I need internet?", content: <p className="text-sm md:text-base">Most features work offline. Videos and cloud sync require internet.</p> },
              { name: "How are calories estimated?", content: <p className="text-sm md:text-base">Estimates use standard MET values adjusted for weight/height. Pair with a wearable for better accuracy.</p> },
              { name: "Can I export my data?", content: <p className="text-sm md:text-base">Yes. Settings → Privacy → Export Data (JSON/CSV).</p> },
            ],
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
                Reach us at <span className="font-medium">fittrack001@gmail.com</span> (24–48h response).
            
              </p>
            ),
          },
          {
            name: "Live Chat",
            icon: <MessageCircle size={16} />,
            content: <p className="text-sm md:text-base">Chat with us on <span className="font-medium">FitTrack Support</span></p>,
          },
          {
            name: "Feedback",
            icon: <Bell size={16} />,
            content: <FeedbackForm darkMode={darkMode} />,
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
            content: <p className="text-sm md:text-base">We minimize data collection and never sell personal info.</p>,
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
            content: <p className="text-sm md:text-base">Using the app implies acceptance of our terms regarding fair use, content, and limitations of liability.</p>,
          },
        ],
      },
    ],
    [darkMode]
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
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} className="w-full p-4 flex items-center justify-between">
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
            const tag = e.target?.tagName?.toLowerCase();
            if (tag === "textarea" || tag === "input" || tag === "select") return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              hasChildren || item.content ? toggleItem(sectionTitle, item.name) : null;
            }
          }}
          className={`flex items-center justify-between p-3 cursor-pointer rounded-lg ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
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
                      <div key={sub.name} className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
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

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="flex p-4 w-full max-w-2xl mx-auto items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className={`p-2 rounded-full mr-2 ${darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-200 text-gray-800"}`}
          >
            <ArrowLeft size={22} />
          </motion.button>
          <h1 className={`text-xl md:text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>Help Center</h1>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {Links.map((section) => {
            const expanded = !!openSection[section.title];
            return (
              <motion.div key={section.title} variants={cardVariants} className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <SectionHeader title={section.title} icon={section.icon} expanded={expanded} onClick={() => toggleSection(section.title)} />
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
}