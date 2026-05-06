/* eslint-disable no-unused-vars */
// src/pages/admin/AdminMessages.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  Shield,
  Users,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../../utils/socket";

const API_BASE = "http://localhost:4000";

const prettyTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const initials = (name = "") =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "T";

function Avatar({ name, darkMode, size = 40 }) {
  return (
    <div
      className={`rounded-2xl flex items-center justify-center font-semibold shadow-sm ${
        darkMode ? "bg-white/10 text-white" : "bg-indigo-100 text-indigo-900"
      }`}
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </div>
  );
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };
  const params = useParams();

  // Route supports optional chatId: /admin/messages OR /admin/messages/:chatId
  const routeChatId = params?.chatId || "";

  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const authHeaders = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const scrollerRef = useRef(null);

  const [socketState, setSocketState] = useState("connecting"); // connecting | online | offline
  const [error, setError] = useState("");

  const [trainers, setTrainers] = useState([]);
  const [trainerSearch, setTrainerSearch] = useState("");

  const [activeTrainer, setActiveTrainer] = useState(null);
  const [chatId, setChatId] = useState(routeChatId || null);

  const [messages, setMessages] = useState([]);
  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ responsive view controller:
  // - "list": show trainer list (mobile)
  // - "chat": show chat (mobile)
  // - on md+: both are visible anyway
  const [mobileView, setMobileView] = useState("list");

  const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
  const card = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const subtle = darkMode ? "text-gray-300" : "text-gray-600";
  const hover = darkMode ? "hover:bg-white/5" : "hover:bg-slate-900/5";

  const scrollBottom = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  // ---------- Load trainers ----------
  const loadTrainers = useCallback(async () => {
    if (!token) return;
    setLoadingLeft(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin-messages/trainers`, {
        method: "GET",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load trainers");
      setTrainers(Array.isArray(data?.trainers) ? data.trainers : []);
    } catch (e) {
      setError(e?.message || "Failed to load trainers");
      setTrainers([]);
    } finally {
      setLoadingLeft(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    loadTrainers();
  }, [loadTrainers]);

  const filteredTrainers = useMemo(() => {
    const s = trainerSearch.trim().toLowerCase();
    if (!s) return trainers;
    return trainers.filter((t) => {
      const name = String(t.fullName || t.fullname || t.name || "").toLowerCase();
      const email = String(t.email || "").toLowerCase();
      return name.includes(s) || email.includes(s);
    });
  }, [trainers, trainerSearch]);

  // ---------- Open chat ----------
  const openChat = useCallback(
    async (trainer) => {
      if (!trainer?._id) return;
      setActiveTrainer(trainer);
      setLoadingChat(true);
      setError("");

      // ✅ on mobile, immediately show chat view (more responsive feel)
      setMobileView("chat");

      try {
        const res = await fetch(`${API_BASE}/api/admin-messages/chats/open`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ trainerId: trainer._id }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to open chat");

        const cid = data?.chat?._id;
        if (!cid) throw new Error("Chat id missing from backend response");
        setChatId(cid);

        // load existing messages
        const mRes = await fetch(`${API_BASE}/api/admin-messages/chats/${cid}/messages`, {
          method: "GET",
          headers: authHeaders,
          cache: "no-store",
        });
        const mData = await mRes.json().catch(() => ({}));
        if (!mRes.ok) throw new Error(mData?.message || "Failed to load messages");
        setMessages(Array.isArray(mData?.messages) ? mData.messages : []);

        setTimeout(scrollBottom, 30);

        // update URL (optional but nice)
        window.history.replaceState({}, "", `/admin/messages/${cid}`);
      } catch (e) {
        setError(e?.message || "Failed to open chat");
      } finally {
        setLoadingChat(false);
      }
    },
    [authHeaders, scrollBottom]
  );

  // If coming from a direct URL /admin/messages/:chatId, just load messages.
  useEffect(() => {
    (async () => {
      if (!token) return;
      if (!routeChatId) return;

      // ✅ if direct chat url on mobile, show chat view
      setMobileView("chat");

      setChatId(routeChatId);
      setLoadingChat(true);
      setError("");
      try {
        const mRes = await fetch(`${API_BASE}/api/admin-messages/chats/${routeChatId}/messages`, {
          method: "GET",
          headers: authHeaders,
          cache: "no-store",
        });
        const mData = await mRes.json().catch(() => ({}));
        if (!mRes.ok) throw new Error(mData?.message || "Failed to load messages");
        setMessages(Array.isArray(mData?.messages) ? mData.messages : []);
        setTimeout(scrollBottom, 30);
      } catch (e) {
        setError(e?.message || "Failed to load chat");
      } finally {
        setLoadingChat(false);
      }
    })();
  }, [token, routeChatId, authHeaders, scrollBottom]);

  // ---------- SOCKET ----------
  useEffect(() => {
    if (!token) return;
    if (!chatId) return;

    setSocketState("connecting");

    const s = connectSocket(token);
    if (!s) {
      setSocketState("offline");
      return;
    }

    const onConnect = () => setSocketState("online");
    const onDisconnect = () => setSocketState("offline");
    const onConnectError = (err) => {
      setSocketState("offline");
      setError(err?.message || "Socket connection failed");
    };

    // join room
    s.emit("adminTrainer:join", { chatId });

    const onNew = (msg) => {
      if (!msg?._id) return;
      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(msg._id));
        if (exists) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollBottom, 20);
    };

    const onErr = (p) => setError(p?.message || "Chat error");

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);
    s.on("adminTrainer:new", onNew);
    s.on("adminTrainer:error", onErr);

    if (s.connected) setSocketState("online");

    return () => {
      try {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.off("connect_error", onConnectError);
        s.off("adminTrainer:new", onNew);
        s.off("adminTrainer:error", onErr);
      } catch {
        // ignore
      }
      disconnectSocket();
    };
  }, [token, chatId, scrollBottom]);

  // ---------- SEND ----------
  const handleSend = useCallback(async () => {
    const clean = input.trim();
    if (!clean || !chatId) return;

    setSending(true);
    setError("");
    try {
      const s = connectSocket(token);
      if (!s) throw new Error("Socket not connected");
      s.emit("adminTrainer:send", { chatId, text: clean });
      setInput("");
      setTimeout(scrollBottom, 20);
    } catch (e) {
      setError(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  }, [input, chatId, token, scrollBottom]);

  const onMobileBackToList = useCallback(() => {
    setMobileView("list");
  }, []);

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <div className={`rounded-2xl border p-6 ${card}`}>Please login as admin.</div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full ${pageBg}`}>
      <div className="h-full w-full flex min-w-0">
        {/* LEFT: trainers */}
        <aside
          className={`
            ${card} border-r w-full md:w-96 flex flex-col min-w-0
            ${mobileView === "chat" ? "hidden md:flex" : "flex"}
          `}
        >
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl border ${
                darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
              }`}
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="font-semibold">Message Trainers</div>

            <div
              className="ml-auto text-xs px-3 py-1.5 rounded-full border flex items-center gap-2"
              style={{ opacity: 0.9 }}
            >
              {socketState === "online" ? <Wifi size={14} /> : <WifiOff size={14} />}
              {socketState === "online" ? "Online" : socketState === "connecting" ? "Connecting…" : "Offline"}
            </div>

            <button
              onClick={loadTrainers}
              className={`p-2 rounded-xl border ${
                darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
              }`}
              title="Reload"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              />
              <input
                value={trainerSearch}
                onChange={(e) => setTrainerSearch(e.target.value)}
                placeholder="Search trainers..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl border outline-none ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                }`}
              />
            </div>

            {error && (
              <div
                className={`mt-3 rounded-xl border p-3 ${
                  darkMode
                    ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {error}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
            {loadingLeft ? (
              <div className={`px-3 py-2 text-sm ${subtle}`}>Loading trainers...</div>
            ) : filteredTrainers.length === 0 ? (
              <div className={`px-3 py-2 text-sm ${subtle}`}>No trainers found.</div>
            ) : (
              filteredTrainers.map((t) => {
                const id = t._id;
                const name = t.fullName || t.fullname || t.name || "Trainer";
                const active = String(activeTrainer?._id) === String(id);

                return (
                  <button
                    key={id}
                    onClick={() => openChat(t)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition ${
                      active
                        ? darkMode
                          ? "bg-indigo-500/15 border-indigo-400/25"
                          : "bg-indigo-50 border-indigo-200"
                        : `border-transparent ${hover}`
                    }`}
                  >
                    <Avatar name={name} darkMode={darkMode} />
                    <div className="min-w-0 text-left flex-1">
                      <div className="font-semibold text-sm truncate">{name}</div>
                      <div className={`text-xs truncate ${subtle}`}>{t.email || "—"}</div>
                    </div>

                    {/* ✅ nice on mobile: hint icon */}
                    <div className={`md:hidden ${subtle}`}>
                      <Users size={16} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT: chat */}
        <section
          className={`
            flex-1 flex flex-col min-w-0
            ${mobileView === "list" ? "hidden md:flex" : "flex"}
          `}
        >
          <div className={`p-4 border-b ${darkMode ? "border-gray-800" : "border-gray-200"} flex items-center gap-3`}>
            {/* ✅ Mobile back to list button */}
            <button
              onClick={onMobileBackToList}
              className={`md:hidden p-2 rounded-xl border ${
                darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
              }`}
              title="Back to trainers"
            >
              <ArrowLeft size={16} />
            </button>

            <div className={`p-2 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
              <Shield size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">
                {activeTrainer ? activeTrainer.fullName || activeTrainer.fullname || activeTrainer.name : "Select a trainer"}
              </div>
              <div className={`text-sm truncate ${subtle}`}>
                {activeTrainer?.email || (chatId ? "Chat loaded" : "—")}
              </div>
            </div>
          </div>

          {/* ✅ Ensure chat area sizes well on small devices */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto p-3 sm:p-4">
            {loadingChat ? (
              <div className={`text-sm ${subtle}`}>Loading chat...</div>
            ) : !chatId ? (
              <div className={`text-sm ${subtle} text-center py-16`}>Pick a trainer from the left to start chatting.</div>
            ) : messages.length === 0 ? (
              <div className={`text-sm ${subtle} text-center py-16`}>No messages yet — say hi 👋</div>
            ) : (
              <div className="space-y-3 max-w-4xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((m) => {
                    const isOwn = m?.senderRole === "admin" || m?.senderModel === "Admin";
                    return (
                      <motion.div
                        key={m._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[92%] sm:max-w-[78%]">
                          <div className={`text-[11px] mb-1 opacity-70 ${isOwn ? "text-right" : "text-left"}`}>
                            <span className="font-medium">{isOwn ? "You" : "Trainer"}</span>
                            <span className="opacity-60"> • {prettyTime(m.createdAt)}</span>
                          </div>

                          <div
                            className={`px-4 py-2.5 rounded-3xl shadow ${
                              isOwn
                                ? "bg-indigo-600 text-white rounded-br-xl"
                                : darkMode
                                ? "bg-white/5 border border-white/10 text-white rounded-bl-xl"
                                : "bg-white border border-gray-200 text-gray-900 rounded-bl-xl"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ✅ Sticky-ish input area sized for mobile */}
          <div className={`p-3 sm:p-4 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
            <div className="max-w-4xl mx-auto flex items-end gap-3">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={!chatId ? "Open a trainer chat first..." : "Type message… (Enter to send)"}
                className={`flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-indigo-500/35 ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
                } ${!chatId ? "opacity-70" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!chatId}
              />

              <button
                onClick={handleSend}
                disabled={sending || !input.trim() || !chatId}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold inline-flex items-center gap-2 transition ${
                  sending || !input.trim() || !chatId
                    ? darkMode
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                <Send size={16} />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}