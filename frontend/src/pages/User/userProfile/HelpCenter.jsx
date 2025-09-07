import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CreditCard,
  LifeBuoy,
} from "lucide-react";
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

  const Links = useMemo(
    () => [
      {
        title: "Billings",
        icon: <CreditCard size={18} />,
        items: [
          {
            name: "Plans & Pricing",
            icon: <CreditCard size={16} />,
            content: (
              <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                <li><strong>Free:</strong> Basic tracking, limited history.</li>
                <li><strong>Pro:</strong> Advanced analytics, unlimited history, workout videos.</li>
                <li><strong>Coach:</strong> Everything in Pro + coach insights.</li>
                <li>Billing is monthly; cancel anytime from Settings → Billing.</li>
              </ul>
            ),
          },
          {
            name: "Payment Methods",
            icon: <CreditCard size={16} />,
            content: (
              <p className="text-sm md:text-base">
                We accept major credit/debit cards and wallets. Update: Settings → Billing → Payment Method.
              </p>
            ),
          },
          {
            name: "Refund Policy",
            icon: <CreditCard size={16} />,
            content: (
              <p className="text-sm md:text-base">
                Refunds apply for duplicate charges or billing errors. Contact support within 14 days.
              </p>
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
            icon: <HelpCircle size={16} />,
            items: [
              {
                name: "Do I need internet?",
                content: (
                  <p className="text-sm md:text-base">
                    Most features work offline. Videos and cloud sync need internet.
                  </p>
                ),
              },
              {
                name: "How are calories estimated?",
                content: (
                  <p className="text-sm md:text-base">
                    Using MET values adjusted for weight/height. Pair with a wearable for accuracy.
                  </p>
                ),
              },
              {
                name: "Can I export my data?",
                content: (
                  <p className="text-sm md:text-base">
                    Yes. Settings → Privacy → Export Data (CSV/JSON).
                  </p>
                ),
              },
            ],
          },
          {
            name: "Workouts & Tracking",
            icon: <User size={16} />,
            items: [
              {
                name: "Log a workout",
                content: (
                  <p className="text-sm md:text-base">
                    Home → Workouts → New → Fill details → Save. Create templates for repeats.
                  </p>
                ),
              },
              {
                name: "Video won’t play",
                content: (
                  <p className="text-sm md:text-base">
                    Check connection → try another video → reopen app. If issue persists, clear cache.
                  </p>
                ),
              },
            ],
          },
        ],
      },
      {
        title: "Support",
        icon: <LifeBuoy size={18} />,
        items: [
          {
            name: "Troubleshooting",
            icon: <LifeBuoy size={16} />,
            content: (
              <ul className="list-disc pl-5 text-sm md:text-base space-y-1">
                <li>Force close and reopen the app.</li>
                <li>Check for updates in the store.</li>
                <li>Switch Wi-Fi ↔ mobile data.</li>
                <li>Clear app cache in device settings.</li>
              </ul>
            ),
          },
          {
            name: "Report a Problem",
            icon: <LifeBuoy size={16} />,
            content: (
              <p className="text-sm md:text-base">
                Include steps, screenshots, and app version. Report via Settings → Support or email us.
              </p>
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
                Using FitTrack means accepting terms regarding fair use, content, and liability.
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
                We minimize data collection and never sell personal info. See full policy online.
              </p>
            ),
          },
        ],
      },
      {
        title: "Contact",
        icon: <Mail size={18} />,
        items: [
          {
            name: "Email Support",
            icon: <Mail size={16} />,
            content: (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-indigo-500 dark:bg-gray-900"
                />
                <textarea
                  placeholder="Write your message"
                  className="border border-gray-300 dark:border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-indigo-500 dark:bg-gray-900"
                  rows={4}
                />
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                  Send
                </button>
              </div>
            ),
          },
          {
            name: "Live Chat",
            icon: <MessageCircle size={16} />,
            content: (
              <p className="text-sm md:text-base">
                Chat with us on <span className="font-medium">FitTrack Support</span>.
              </p>
            ),
          },
        ],
      },
    ],
    []
  );

  const SectionHeader = ({ title, icon, expanded, onClick }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
      aria-expanded={expanded}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>{icon}</span>
        <span className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>{title}</span>
      </div>
      <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
        <ArrowLeft size={18} className="rotate-180 text-gray-400" />
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
          onClick={() =>
            hasChildren || item.content ? toggleItem(sectionTitle, item.name) : null
          }
          className={`flex items-center justify-between p-3 cursor-pointer rounded-lg ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center space-x-3 flex-1">
            <span className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>{item.icon}</span>
            <span className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
              {item.name}
            </span>
          </div>
          {(hasChildren || item.content) && (
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ArrowLeft size={16} className="rotate-180 text-gray-400" />
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
                        className={`p-2 rounded-lg ${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium mb-1 ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {sub.name}
                        </p>
                        <div className={darkMode ? "text-gray-300" : "text-gray-700"}>
                          {sub.content}
                        </div>
                      </div>
                    ))
                  : item.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}
      >
        <div className="flex p-4 max-w-2xl mx-auto items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className={`p-2 rounded-full mr-2 ${
              darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-200 text-gray-800"
            }`}
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </motion.button>
          <h1 className="text-xl md:text-2xl font-semibold">Help Center</h1>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="space-y-4"
        >
          {Links.map((section) => {
            const expanded = !!openSection[section.title];
            return (
              <motion.div
                key={section.title}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                className={`rounded-xl shadow overflow-hidden ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
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
