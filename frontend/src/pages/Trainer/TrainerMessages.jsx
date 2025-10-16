import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { Send, Search, X, Phone, Video, Paperclip, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

/**
 * TrainerMessages.jsx — Clean & Spacious Chat UI
 * ------------------------------------------------------
 * ✅ Smooth transitions (duration-200)
 * ✅ Spacious, minimal chat bubbles
 * ✅ Responsive sidebar & layout
 * ✅ Dark mode ready
 * ✅ Non-congested with breathing room
 */

const timeFmt = (d = new Date()) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* -------------------- Message Bubble -------------------- */
const MessageBubble = ({ message, isOwn }) => (
    <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-end gap-4 ${isOwn ? "justify-end flex-row-reverse" : "justify-start"
            }`}
    >
        {/* Avatar */}
        <div
            className={`h-10 w-10 flex items-center justify-center rounded-full shadow-sm ${isOwn
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                } transition-colors duration-200`}
        >
            <User size={18} />
        </div>

        {/* Bubble */}
        <div
            className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm shadow-sm transition-colors duration-200 ${isOwn
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                }`}
        >
            <p className="leading-relaxed break-words">{message.text}</p>
            <div
                className={`mt-2 text-[11px] ${isOwn ? "text-white/80 text-right" : "text-gray-400 dark:text-gray-400"
                    }`}
            >
                {timeFmt(message.time)}
            </div>
        </div>
    </motion.div>
);

/* -------------------- Message Input -------------------- */
const MessageInput = ({ value, setValue, onSend, darkMode }) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) onSend();
        }
    };

    return (
        <div
            className={`w-full border-t px-4 sm:px-6 py-4 backdrop-blur transition-colors duration-200 ${darkMode
                    ? "bg-gray-900/70 border-gray-800"
                    : "bg-white/90 border-gray-200"
                }`}
        >
            <div className="max-w-5xl mx-auto flex items-center gap-4">
                <button
                    className={`p-3 rounded-xl transition-colors duration-200 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                        }`}
                >
                    <Paperclip
                        size={20}
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                    />
                </button>

                <textarea
                    rows={1}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className={`flex-1 resize-none rounded-2xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-indigo-400 border transition-colors duration-200 ${darkMode
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                />

                <button
                    onClick={onSend}
                    disabled={!value.trim()}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200 p-3 text-white shadow-md"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

/* -------------------- Main Layout -------------------- */
const TrainerMessages = () => {
    const { darkMode } = useTheme?.() ?? { darkMode: false };
    const scrollerRef = useRef(null);
    const [input, setInput] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);

    const [clients] = useState([
        { id: "c1", name: "Samrat Bam", emoji: "🧔", last: "Can we move to 7am?", unread: 2 },
        { id: "c2", name: "Satya Shrestha", emoji: "👩", last: "Meal plan looks great!", unread: 0 },
        { id: "c3", name: "Ritwiz Acharya", emoji: "👨‍💻", last: "Please review my form video.", unread: 1 },
    ]);

    const threads = {
        c1: [
            { id: "m1", role: "member", text: "Coach, can we switch to 7am?", time: new Date(Date.now() - 1000 * 60 * 60) },
            { id: "m2", role: "trainer", text: "7am works. See you then!", time: new Date() },
        ],
        c2: [
            { id: "m3", role: "member", text: "Meal plan looks great!", time: new Date(Date.now() - 1000 * 60 * 75) },
            { id: "m4", role: "trainer", text: "Awesome — keep me posted.", time: new Date(Date.now() - 1000 * 60 * 70) },
        ],
        c3: [{ id: "m5", role: "member", text: "Please review my form video.", time: new Date(Date.now() - 1000 * 60 * 25) }],
    };

    const [activeId, setActiveId] = useState("c1");
    const [messages, setMessages] = useState(threads["c1"]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setMessages(threads[activeId] || []);
    }, [activeId]);

    useEffect(() => {
        const el = scrollerRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages((m) => [
            ...m,
            { id: Math.random().toString(36).slice(2), role: "trainer", text: input, time: new Date() },
        ]);
        setInput("");
    };

    const baseBg = darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900";
    const cardBg = darkMode ? "bg-gray-800" : "bg-white";
    const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
    const hoverBg = darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100";

    return (
        <div className={`h-screen w-full flex ${baseBg} transition-colors duration-200`}>
            {/* Sidebar */}
            <aside
                className={`${mobileOpen ? "fixed inset-0 z-40 flex" : "hidden md:flex"}
        flex-col w-full md:w-80 border-r ${borderColor} ${cardBg} p-5 transition-all duration-200`}
            >
                {/* Search */}
                <div className="mb-4">
                    <div className="relative">
                        <Search
                            className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"
                                } transition-colors duration-200`}
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search clients"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-colors duration-200 ${darkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                        />
                    </div>
                </div>

                {/* Client List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    {clients
                        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                        .map((c) => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setActiveId(c.id);
                                    setMobileOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ${activeId === c.id
                                        ? "bg-indigo-100 dark:bg-indigo-600/30"
                                        : hoverBg
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-9 w-9 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-indigo-50"
                                            } text-xl transition-colors duration-200`}
                                    >
                                        {c.emoji}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-sm">{c.name}</p>
                                        <p
                                            className={`text-xs truncate ${darkMode ? "text-gray-400" : "text-gray-500"
                                                } transition-colors duration-200`}
                                        >
                                            {c.last}
                                        </p>
                                    </div>
                                </div>
                                {c.unread > 0 && (
                                    <span className="rounded-full bg-indigo-600 text-white text-[11px] px-2 py-0.5 min-w-[20px] text-center">
                                        {c.unread}
                                    </span>
                                )}
                            </button>
                        ))}
                </div>

                {/* Close on mobile */}
                {mobileOpen && (
                    <button
                        onClick={() => setMobileOpen(false)}
                        className={`absolute top-4 right-4 p-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"
                            } transition-colors duration-200`}
                    >
                        <X size={18} className={darkMode ? "text-gray-300" : "text-gray-600"} />
                    </button>
                )}
            </aside>

            {/* Chat Section */}
            <section className="flex-1 flex flex-col h-full min-w-0">
                {/* Header */}
                <div
                    className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${borderColor} transition-colors duration-200 ${darkMode ? "bg-gray-900/70" : "bg-white/80"
                        } backdrop-blur-md`}
                >
                    <div>
                        <h3 className="text-sm font-semibold transition-colors duration-200">
                            {clients.find((x) => x.id === activeId)?.name}
                        </h3>
                        <p className="text-xs text-green-500">Active now</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {[Paperclip, Phone, Video].map((Icon, i) => (
                            <button
                                key={i}
                                className={`p-2 rounded-lg transition-colors duration-200 ${hoverBg}`}
                            >
                                <Icon
                                    size={18}
                                    className={darkMode ? "text-gray-300" : "text-gray-600"}
                                />
                            </button>
                        ))}

                        {/* Mobile sidebar toggle */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Search
                                size={18}
                                className={darkMode ? "text-gray-300" : "text-gray-600"}
                            />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={scrollerRef}
                    className={`flex-1 overflow-y-auto px-4 sm:px-6 py-6 transition-colors duration-200 ${darkMode
                            ? "bg-gradient-to-b from-gray-900 to-gray-950"
                            : "bg-gradient-to-b from-gray-50 to-white"
                        }`}
                >
                    <div className="max-w-4xl mx-auto flex flex-col gap-6">
                        {messages.map((m) => (
                            <MessageBubble
                                key={m.id}
                                message={m}
                                isOwn={m.role === "trainer"}
                            />
                        ))}
                    </div>
                </div>

                {/* Input */}
                <MessageInput
                    value={input}
                    setValue={setInput}
                    onSend={handleSend}
                    darkMode={darkMode}
                />
            </section>
        </div>
    );
};

export default TrainerMessages;
