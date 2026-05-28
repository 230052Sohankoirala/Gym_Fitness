/* eslint-disable no-unused-vars */
// src/pages/member/MessagePortal.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Wifi,
  WifiOff,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

/* ---------------- Environment base URL ---------------- */
/**
 * Vercel Environment Variables:
 *
 * VITE_API_URL=https://gym-fitness-hgq7.onrender.com
 * VITE_SOCKET_URL=https://gym-fitness-hgq7.onrender.com
 *
 * SOCKET_BASE = backend root
 * API_BASE    = backend API root
 */
const RAW_BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SOCKET_URL ||
  "https://gym-fitness-hgq7.onrender.com";

const SOCKET_BASE = RAW_BACKEND_URL.replace(/\/+$/, "");
const API_BASE = `${SOCKET_BASE}/api`;

/* ---------------- helpers ---------------- */
const prettyTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const prettyDay = (iso) => {
  try {
    return new Date(iso).toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const sameDay = (a, b) => {
  try {
    const da = new Date(a);
    const db = new Date(b);

    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  } catch {
    return false;
  }
};

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const authHeaders = (token, extra = {}) => {
  const h = { ...extra };

  if (token) {
    h.Authorization = `Bearer ${token}`;
  }

  return h;
};

const isImageMime = (mime = "") => String(mime).startsWith("image/");
const isVideoMime = (mime = "") => String(mime).startsWith("video/");

const normalizeUrl = (u) => {
  if (!u) return "";

  const s = String(u).trim();

  if (!s) return "";

  if (s.startsWith("http://localhost:4000")) {
    return s.replace("http://localhost:4000", SOCKET_BASE);
  }

  if (s.startsWith("http://127.0.0.1:4000")) {
    return s.replace("http://127.0.0.1:4000", SOCKET_BASE);
  }

  if (s.startsWith("https://localhost:4000")) {
    return s.replace("https://localhost:4000", SOCKET_BASE);
  }

  if (s.startsWith("https://") || s.startsWith("http://")) {
    return s;
  }

  if (s.startsWith("/")) {
    return `${SOCKET_BASE}${s}`;
  }

  return `${SOCKET_BASE}/${s}`;
};

const normalizeChatUploadPath = (u) => {
  const n = normalizeUrl(u);

  return n
    .replace("/upload/chat/", "/uploads/chat/")
    .replace("/uploads//chat/", "/uploads/chat/");
};

const getInitial = (name = "T") => {
  return String(name).trim().charAt(0).toUpperCase() || "T";
};

const buildLocalPreview = (file) => {
  try {
    return URL.createObjectURL(file);
  } catch {
    return "";
  }
};

export default function MessagePortal() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const token = useMemo(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  }, []);

  const [trainerInfo, setTrainerInfo] = useState({
    name: "Trainer",
    email: "",
  });

  const [loadingTrainer, setLoadingTrainer] = useState(false);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [socketState, setSocketState] = useState("connecting");
  const [typing, setTyping] = useState(false);

  const chatRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);

  const scrollBottom = useCallback((smooth = false) => {
    const el = chatRef.current;

    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const autoGrow = useCallback(() => {
    const el = inputRef.current;

    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  useEffect(() => {
    autoGrow();
  }, [text, autoGrow]);

  /* ---------------- media selection ---------------- */
  const pickFiles = useCallback((e) => {
    const selected = Array.from(e.target.files || []);

    if (!selected.length) return;

    const filtered = selected
      .filter((f) => isImageMime(f.type) || isVideoMime(f.type))
      .map((f) => ({
        file: f,
        name: f.name,
        type: f.type,
        preview: buildLocalPreview(f),
      }));

    setFiles((prev) => [...prev, ...filtered].slice(0, 5));

    e.target.value = "";
  }, []);

  const removeFile = useCallback((idx) => {
    setFiles((prev) => {
      const target = prev[idx];

      if (target?.preview) {
        try {
          URL.revokeObjectURL(target.preview);
        } catch {
          // ignore
        }
      }

      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((item) => {
        if (item?.preview) {
          try {
            URL.revokeObjectURL(item.preview);
          } catch {
            // ignore
          }
        }
      });

      return [];
    });
  }, []);

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item?.preview) {
          try {
            URL.revokeObjectURL(item.preview);
          } catch {
            // ignore
          }
        }
      });
    };
  }, [files]);

  /* ---------------- trainer header fetch ---------------- */
  const fetchTrainerInfo = useCallback(async () => {
    if (!trainerId || !token) return;

    setLoadingTrainer(true);

    try {
      const candidates = [
        `${API_BASE}/trainers/${trainerId}`,
        `${API_BASE}/trainers/profile/${trainerId}`,
        `${API_BASE}/trainers/public`,
      ];

      let data = null;

      for (const url of candidates) {
        const res = await fetch(url, {
          method: "GET",
          headers: authHeaders(token),
          credentials: "include",
        });

        if (res.ok) {
          const responseData = await safeJson(res);

          if (Array.isArray(responseData)) {
            data = responseData.find((trainer) => {
              return String(trainer?._id || trainer?.id) === String(trainerId);
            });
          } else {
            data = responseData;
          }

          if (data) break;
        }
      }

      if (!data) {
        throw new Error("Trainer route not found");
      }

      const name =
        data?.name ||
        data?.fullName ||
        data?.fullname ||
        data?.trainerName ||
        "Trainer";

      setTrainerInfo({
        name,
        email: data?.email || "",
      });
    } catch {
      setTrainerInfo({
        name: "Trainer",
        email: "",
      });
    } finally {
      setLoadingTrainer(false);
    }
  }, [trainerId, token]);

  useEffect(() => {
    fetchTrainerInfo();
  }, [fetchTrainerInfo]);

  /* ---------------- load messages ---------------- */
  const fetchMessages = useCallback(async () => {
    if (!trainerId || !token) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/messages/${trainerId}`, {
        method: "GET",
        headers: authHeaders(token, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Could not load messages.");
      }

      const list = Array.isArray(data) ? data : [];

      const fixedList = list.map((msg) => ({
        ...msg,
        attachments: Array.isArray(msg?.attachments)
          ? msg.attachments.map((a) => ({
              ...a,
              url: normalizeChatUploadPath(a?.url),
            }))
          : [],
      }));

      setMessages(fixedList);
    } catch (err) {
      setError(err?.message || "Could not load messages.");
    } finally {
      setLoading(false);

      setTimeout(() => {
        scrollBottom(false);
      }, 40);
    }
  }, [trainerId, token, scrollBottom]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  /* ---------------- socket connect ---------------- */
  useEffect(() => {
    if (!token || !trainerId) return;

    setSocketState("connecting");
    setError("");

    const socket = io(SOCKET_BASE, {
      transports: ["websocket", "polling"],
      auth: {
        token,
      },
      withCredentials: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 800,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketState("online");

      socket.emit("chat:join", {
        trainerId,
      });
    });

    socket.on("disconnect", () => {
      setSocketState("offline");
    });

    socket.on("connect_error", (err) => {
      setSocketState("offline");
      setError(err?.message || "Socket connection failed.");
    });

    socket.on("chat:new", (msg) => {
      const fixedMsg = {
        ...msg,
        attachments: Array.isArray(msg?.attachments)
          ? msg.attachments.map((a) => ({
              ...a,
              url: normalizeChatUploadPath(a?.url),
            }))
          : [],
      };

      setMessages((prev) => {
        const id = fixedMsg?._id;

        if (id && prev.some((p) => String(p?._id) === String(id))) {
          return prev;
        }

        return [...prev, fixedMsg];
      });

      setTimeout(() => {
        scrollBottom(true);
      }, 50);
    });

    socket.on("chat:error", (payload) => {
      setError(payload?.message || "Chat error");
    });

    socket.on("chat:typing", () => {
      setTyping(true);

      setTimeout(() => {
        setTyping(false);
      }, 900);
    });

    return () => {
      try {
        socket.disconnect();
      } catch {
        // ignore
      }

      socketRef.current = null;
    };
  }, [token, trainerId, scrollBottom]);

  useEffect(() => {
    scrollBottom(false);
  }, [messages, scrollBottom]);

  /* ---------------- send text ---------------- */
  const sendText = useCallback(async () => {
    const clean = text.trim();

    if (!clean || !trainerId || !token) return;

    setSending(true);
    setError("");

    try {
      socketRef.current?.emit("chat:send", {
        trainerId,
        text: clean,
      });

      setText("");

      setTimeout(() => {
        scrollBottom(true);
      }, 20);
    } catch {
      setError("Failed to send.");
    } finally {
      setSending(false);
    }
  }, [text, trainerId, token, scrollBottom]);

  /* ---------------- send media ---------------- */
  const sendMedia = useCallback(async () => {
    const clean = text.trim();

    if (!trainerId || !token) return;
    if (!clean && files.length === 0) return;

    setSending(true);
    setError("");

    try {
      const fd = new FormData();

      fd.append("text", clean);

      files.forEach((item) => {
        fd.append("files", item.file);
      });

      const res = await fetch(`${API_BASE}/messages/${trainerId}/media`, {
        method: "POST",
        headers: authHeaders(token),
        body: fd,
        credentials: "include",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Media upload failed");
      }

      const fixedData = {
        ...data,
        attachments: Array.isArray(data?.attachments)
          ? data.attachments.map((a) => ({
              ...a,
              url: normalizeChatUploadPath(a?.url),
            }))
          : [],
      };

      setMessages((prev) => {
        const id = fixedData?._id;

        if (id && prev.some((p) => String(p?._id) === String(id))) {
          return prev;
        }

        return [...prev, fixedData];
      });

      setText("");
      clearFiles();

      setTimeout(() => {
        scrollBottom(true);
      }, 30);
    } catch (e) {
      setError(e?.message || "Media upload failed");
    } finally {
      setSending(false);
    }
  }, [text, files, trainerId, token, clearFiles, scrollBottom]);

  const handleSend = useCallback(async () => {
    if (files.length > 0) {
      return sendMedia();
    }

    return sendText();
  }, [files.length, sendMedia, sendText]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------------- grouped messages ---------------- */
  const renderedItems = useMemo(() => {
    const items = [];

    messages.forEach((m, idx) => {
      const prev = messages[idx - 1];

      if (!prev || !sameDay(prev?.createdAt, m?.createdAt)) {
        items.push({
          type: "day",
          key: `day-${m?._id || idx}`,
          label: prettyDay(m?.createdAt),
        });
      }

      items.push({
        type: "message",
        key: m?._id || `msg-${idx}`,
        value: m,
        prev,
      });
    });

    return items;
  }, [messages]);

  /* ---------------- UI styles ---------------- */
  const pageBg = darkMode
    ? "bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,.16),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,.10),transparent_55%),linear-gradient(to_br,rgba(2,6,23,1),rgba(0,0,0,1))] text-white"
    : "bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,.08),transparent_55%),linear-gradient(to_br,rgba(248,250,252,1),rgba(241,245,249,1))] text-gray-900";

  const card = darkMode
    ? "bg-white/5 border-white/10"
    : "bg-white/75 border-slate-200/80";

  const subtleBorder = darkMode ? "border-white/10" : "border-slate-200/80";

  const inputBg = darkMode
    ? "bg-black/40 border-white/10 text-white placeholder:text-white/35"
    : "bg-white border-slate-200 text-gray-900 placeholder:text-slate-400";

  const softText = darkMode ? "text-white/70" : "text-slate-600";

  const statusPill =
    socketState === "online"
      ? darkMode
        ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/25"
        : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : socketState === "connecting"
      ? darkMode
        ? "bg-blue-400/15 text-blue-200 border-blue-400/25"
        : "bg-blue-500/10 text-blue-700 border-blue-500/20"
      : darkMode
      ? "bg-rose-400/15 text-rose-200 border-rose-400/25"
      : "bg-rose-500/10 text-rose-700 border-rose-500/20";

  const statusIcon =
    socketState === "online" ? (
      <Wifi size={14} />
    ) : socketState === "connecting" ? (
      <Wifi size={14} className="animate-pulse" />
    ) : (
      <WifiOff size={14} />
    );

  const statusLabel =
    socketState === "online"
      ? "Online"
      : socketState === "connecting"
      ? "Connecting..."
      : "Offline";

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${pageBg} px-4 py-4 sm:px-6 sm:py-6`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{
            y: -10,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-2xl border transition-colors duration-200 ${
                darkMode
                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
              }`}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 bg-white/5 text-xs">
              <ShieldCheck size={14} />
              Secure thread
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium w-fit ${statusPill}`}
          >
            {statusIcon}
            {statusLabel}
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`overflow-hidden rounded-[28px] border backdrop-blur-xl shadow-2xl transition-colors duration-200 ${card}`}
        >
          {/* Chat Header */}
          <div
            className={`px-4 sm:px-6 py-4 border-b transition-colors duration-200 ${subtleBorder} ${
              darkMode ? "bg-black/20" : "bg-white/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                {getInitial(trainerInfo?.name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-semibold truncate">
                    {loadingTrainer
                      ? "Loading..."
                      : trainerInfo?.name || "Trainer"}
                  </h1>

                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full ${
                      darkMode
                        ? "bg-blue-400/15 text-blue-200"
                        : "bg-blue-500/10 text-blue-700"
                    }`}
                  >
                    Live chat
                  </span>
                </div>

                <p className={`text-sm truncate ${softText}`}>
                  {trainerInfo?.email ||
                    "Messages are saved and synced with your trainer"}
                </p>
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs opacity-75">
                <Sparkles size={14} />
                {messages.length > 0
                  ? `${messages.length} messages`
                  : "New conversation"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="h-[58vh] sm:h-[62vh] overflow-y-auto px-3 sm:px-5 py-4 space-y-3"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={28} className="animate-spin opacity-70" />
                  <p className={`text-sm ${softText}`}>Loading messages...</p>
                </div>
              </div>
            ) : renderedItems.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-sm text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-4 ${
                      darkMode ? "bg-white/10" : "bg-slate-900/5"
                    }`}
                  >
                    <MessageCircle
                      size={28}
                      className={darkMode ? "text-white/70" : "text-slate-700"}
                    />
                  </div>

                  <h3 className="text-lg font-semibold mb-1">
                    Start the conversation
                  </h3>

                  <p className={`text-sm ${softText}`}>
                    Say hello to your trainer. Your messages will stay here and
                    load every time you return.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {renderedItems.map((item, idx) => {
                  if (item.type === "day") {
                    return (
                      <motion.div
                        key={item.key}
                        initial={{
                          opacity: 0,
                          y: 6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="flex items-center justify-center py-1"
                      >
                        <div
                          className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${
                            darkMode
                              ? "bg-white/5 border-white/10 text-white/70"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          {item.label}
                        </div>
                      </motion.div>
                    );
                  }

                  const m = item.value;

                  const isTrainer =
                    (m?.sender?.role || m?.senderModel) === "Trainer" ||
                    m?.sender?.role === "trainer";

                  const isOwn = !isTrainer;
                  const prev = item.prev;

                  const prevIsTrainer =
                    prev &&
                    ((prev?.sender?.role || prev?.senderModel) === "Trainer" ||
                      prev?.sender?.role === "trainer");

                  const showMeta =
                    !prev ||
                    prevIsTrainer !== isTrainer ||
                    !sameDay(prev?.createdAt, m?.createdAt);

                  const atts = Array.isArray(m?.attachments)
                    ? m.attachments
                    : [];

                  return (
                    <motion.div
                      key={item.key}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className={`flex w-full ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[78%] ${
                          isOwn ? "items-end" : "items-start"
                        } flex flex-col`}
                      >
                        {showMeta && (
                          <div
                            className={`mb-1.5 text-[11px] ${softText} ${
                              isOwn ? "text-right" : "text-left"
                            }`}
                          >
                            {isTrainer
                              ? trainerInfo?.name || "Trainer"
                              : "You"}{" "}
                            • {prettyTime(m?.createdAt)}
                          </div>
                        )}

                        <div
                          className={`rounded-[24px] px-4 py-3 shadow-sm border transition-colors duration-200 ${
                            isOwn
                              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white border-blue-500/50 rounded-br-md"
                              : darkMode
                              ? "bg-white/8 text-white border-white/10 rounded-bl-md"
                              : "bg-white text-slate-900 border-slate-200 rounded-bl-md"
                          }`}
                        >
                          {m?.text ? (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {m.text}
                            </p>
                          ) : null}

                          {atts.length > 0 && (
                            <div
                              className={`${
                                m?.text ? "mt-3" : ""
                              } space-y-2`}
                            >
                              {atts.map((a, i) => {
                                const key =
                                  a?.url || `${m._id || idx}-att-${i}`;

                                const finalUrl = normalizeChatUploadPath(
                                  a?.url
                                );

                                if (a?.type === "image") {
                                  return (
                                    <img
                                      key={key}
                                      src={finalUrl}
                                      alt={a.filename || "image"}
                                      className="w-[220px] h-[220px] object-cover rounded-2xl border border-white/10"
                                      loading="lazy"
                                    />
                                  );
                                }

                                if (a?.type === "video") {
                                  return (
                                    <video
                                      key={key}
                                      src={finalUrl}
                                      controls
                                      className="w-[260px] h-[180px] object-cover rounded-2xl border border-white/10"
                                    />
                                  );
                                }

                                return (
                                  <a
                                    key={key}
                                    href={finalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs underline"
                                  >
                                    {a.filename || "Download file"}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {typing && socketState === "online" && (
              <div className="flex justify-start">
                <div
                  className={`px-3 py-2 rounded-2xl border transition-colors duration-200 ${
                    darkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className={`px-4 sm:px-6 py-2 text-xs border-t ${
                darkMode
                  ? "text-rose-200 border-white/10 bg-rose-500/10"
                  : "text-rose-700 border-slate-200 bg-rose-50/70"
              }`}
            >
              {error}
            </div>
          )}

          {/* Selected file previews */}
          {files.length > 0 && (
            <div
              className={`px-4 sm:px-6 py-3 border-t transition-colors duration-200 ${
                darkMode
                  ? "border-white/10 bg-black/10"
                  : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-medium ${softText}`}>
                  Attachments ready to send
                </p>

                <button
                  type="button"
                  onClick={clearFiles}
                  className={`text-xs underline ${softText}`}
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {files.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className={`relative w-24 sm:w-28 rounded-2xl overflow-hidden border ${
                      darkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {isImageMime(item.type) ? (
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="h-20 w-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-full flex items-center justify-center">
                        <Video size={22} className={softText} />
                      </div>
                    )}

                    <div className="px-2 py-1.5">
                      <p className="text-[10px] truncate">{item.name}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div
            className={`px-3 sm:px-5 py-4 border-t transition-colors duration-200 ${subtleBorder}`}
          >
            <input
              id="member-chat-media"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={pickFiles}
            />

            <div className="flex items-end gap-2 sm:gap-3">
              <label
                htmlFor="member-chat-media"
                className={`shrink-0 inline-flex items-center justify-center rounded-2xl w-11 h-11 border cursor-pointer transition-colors duration-200 ${
                  darkMode
                    ? "bg-white/5 hover:bg-white/10 text-white border-white/10"
                    : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
                }`}
                title="Attach image or video"
              >
                <Paperclip size={18} />
              </label>

              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={`Message ${trainerInfo?.name || "trainer"}...`}
                  className={`w-full resize-none rounded-[22px] px-4 py-3 text-sm border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/60 ${inputBg}`}
                />

                <div
                  className={`mt-2 text-[11px] flex items-center justify-between ${softText}`}
                >
                  <span>Press Enter to send</span>

                  <span className="inline-flex items-center gap-1">
                    {files.length > 0 ? (
                      <>
                        <ImageIcon size={11} />
                        {files.length} file{files.length > 1 ? "s" : ""}{" "}
                        selected
                      </>
                    ) : socketState === "online" ? (
                      <>
                        <CheckCircle2 size={11} />
                        Secure session
                      </>
                    ) : (
                      "Trying to reconnect..."
                    )}
                  </span>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{
                  scale:
                    sending ||
                    (!text.trim() && files.length === 0) ||
                    socketState !== "online"
                      ? 1
                      : 1.04,
                }}
                whileTap={{
                  scale:
                    sending ||
                    (!text.trim() && files.length === 0) ||
                    socketState !== "online"
                      ? 1
                      : 0.97,
                }}
                disabled={
                  sending ||
                  (!text.trim() && files.length === 0) ||
                  socketState !== "online"
                }
                onClick={handleSend}
                className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl px-4 sm:px-5 h-11 text-sm font-semibold transition-colors duration-200 ${
                  sending ||
                  (!text.trim() && files.length === 0) ||
                  socketState !== "online"
                    ? darkMode
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                }`}
                title={socketState !== "online" ? "Not connected" : "Send"}
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}

                <span className="hidden sm:inline">
                  {sending ? "Sending..." : "Send"}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}