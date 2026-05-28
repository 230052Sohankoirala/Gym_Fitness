/* eslint-disable no-unused-vars */
// src/pages/trainer/TrainerAdminMessages.jsx

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Wifi, WifiOff, Shield, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

// ✅ USE YOUR SOCKET HELPER
import { connectSocket, disconnectSocket } from "../../utils/socket";

const API_BASE =  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const prettyTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

export default function TrainerAdminMessages() {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  // ✅ token
  const token = useMemo(
    () => localStorage.getItem("trainerToken") || localStorage.getItem("token") || "",
    []
  );

  const authHeaders = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  const [socketState, setSocketState] = useState("connecting"); // connecting | online | offline
  const [admin, setAdmin] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [input, setInput] = useState("");

  const scrollBottom = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const pageBg = darkMode
        ? "bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#0f172a]"
        : "bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60";
  const card = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const subtle = darkMode ? "text-gray-300" : "text-gray-600";

  // ---------------- 1) Load pinned admin + open chat + load saved messages ----------------
  const initChat = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      // pinned admin
      const aRes = await fetch(`${API_BASE}/api/trainer/admin-contact`, {
        method: "GET",
        headers: authHeaders,
      });
      const aData = await aRes.json().catch(() => ({}));
      if (!aRes.ok) throw new Error(aData?.message || "Failed to load admin contact");
      setAdmin(aData?.admin || null);

      // ensure chat exists
      const cRes = await fetch(`${API_BASE}/api/trainer/admin-chat/open`, {
        method: "POST",
        headers: authHeaders,
      });
      const cData = await cRes.json().catch(() => ({}));
      if (!cRes.ok) throw new Error(cData?.message || "Failed to open admin chat");
      const cid = cData?.chat?._id;
      if (!cid) throw new Error("Chat id missing from /api/trainer/admin-chat/open");
      setChatId(cid);

      // load saved messages
      const mRes = await fetch(`${API_BASE}/api/trainer/admin-chat/${cid}/messages`, {
        method: "GET",
        headers: authHeaders,
        cache: "no-store",
      });
      const mData = await mRes.json().catch(() => ({}));
      if (!mRes.ok) throw new Error(mData?.message || "Failed to load messages");
      setMessages(Array.isArray(mData?.messages) ? mData.messages : []);

      setTimeout(scrollBottom, 30);
    } catch (e) {
      setError(e?.message || "Failed to initialize admin chat");
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders, scrollBottom]);

  useEffect(() => {
    initChat();
  }, [initChat]);

  // ---------------- 2) SOCKET: connect + join + receive ----------------
  useEffect(() => {
    if (!token) return;
    if (!chatId) return;

    setSocketState("connecting");

    // ✅ CONNECT USING YOUR socket.js
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
      // prevent duplicates (if backend also sends last list)
      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(msg._id));
        if (exists) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollBottom, 20);
    };

    const onError = (p) => setError(p?.message || "Chat error");

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);
    s.on("adminTrainer:new", onNew);
    s.on("adminTrainer:error", onError);

    // set correct state if already connected
    if (s.connected) setSocketState("online");

    return () => {
      try {
        s.off("connect", onConnect);
        s.off("disconnect", onDisconnect);
        s.off("connect_error", onConnectError);
        s.off("adminTrainer:new", onNew);
        s.off("adminTrainer:error", onError);
      } catch (e) {
        console.error("Disconnect socket error:", e);
      }
      // ✅ IMPORTANT: disconnect on page unmount to avoid duplicate sockets
      disconnectSocket();
    };
  }, [token, chatId, scrollBottom]);

  // ---------------- 3) SEND ----------------
  const handleSend = useCallback(async () => {
    const clean = input.trim();
    if (!clean || !chatId) return;

    setSending(true);
    setError("");

    try {
      // ✅ send via socket (server saves to DB)
      const s = connectSocket(token); // returns existing live instance (or re-connects)
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

  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <div className={`rounded-2xl border p-6 ${card}`}>Please login as trainer.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
        <div className={`rounded-2xl border p-6 ${card}`}>Loading admin chat…</div>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full ${pageBg}`}>
      <div className="h-full max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col">
        {/* Header */}
        <div className={`rounded-2xl border p-4 ${card} flex items-center gap-3`}>
          <button
            onClick={() => navigate(-1)}
            className={`px-3 py-2 rounded-xl text-sm border ${
              darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
            }`}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>

          <div className={`p-2 rounded-xl ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            <Shield size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate">
              {admin?.fullName || admin?.fullname || admin?.name || "Admin"}
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full border ${
                  darkMode
                    ? "border-indigo-400/25 text-indigo-200 bg-indigo-400/10"
                    : "border-indigo-200 text-indigo-700 bg-indigo-50"
                }`}
              >
                Pinned
              </span>
            </div>
            <div className={`text-sm truncate ${subtle}`}>{admin?.email || "—"}</div>
          </div>

          <div
            className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-2 ${
              socketState === "online"
                ? darkMode
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
                : socketState === "connecting"
                ? darkMode
                  ? "border-indigo-400/25 bg-indigo-400/10 text-indigo-200"
                  : "border-indigo-200 bg-indigo-50 text-indigo-700"
                : darkMode
                ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {socketState === "online" ? <Wifi size={14} /> : <WifiOff size={14} />}
            {socketState === "online"
              ? "Online"
              : socketState === "connecting"
              ? "Connecting…"
              : "Offline"}
          </div>

          <button
            onClick={initChat}
            className={`p-2 rounded-xl border ${
              darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
            }`}
            title="Reload"
          >
            <RefreshCw size={16} />
          </button>
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

        {/* Messages */}
        <div ref={scrollerRef} className={`mt-4 flex-1 overflow-y-auto rounded-2xl border p-4 ${card}`}>
          {messages.length === 0 ? (
            <div className={`text-sm ${subtle} text-center py-10`}>No messages yet — say hi 👋</div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((m) => {
                  const isOwn = m?.senderRole === "trainer";
                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[78%]">
                        <div className={`text-[11px] mb-1 opacity-70 ${isOwn ? "text-right" : "text-left"}`}>
                          <span className="font-medium">{isOwn ? "You" : "Admin"}</span>
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

        {/* Input */}
        <div className={`mt-4 rounded-2xl border p-3 ${card}`}>
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message to Admin… (Enter to send, Shift+Enter new line)"
              className={`flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-indigo-500/35 ${
                darkMode
                  ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                  : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
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

          <div className={`mt-2 text-[11px] ${subtle} flex items-center justify-between`}>
            <span>Enter = send • Shift+Enter = new line</span>
            <span>{socketState === "online" ? "Live + Saved" : "Reconnecting…"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
