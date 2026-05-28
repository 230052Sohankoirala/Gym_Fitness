/* eslint-disable no-unused-vars */
// src/pages/trainer/TrainerMessages.jsx

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

import {
  Send,
  Search,
  RefreshCw,
  ArrowLeft,
  Wifi,
  WifiOff,
  Sparkles,
  MessagesSquare,
  Paperclip,
  ImageIcon,
  Video,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

const API_ROOT =  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";
const API_BASE = `${API_ROOT}/api`;
const SOCKET_BASE = API_ROOT;

/* ---------------- Helpers ---------------- */

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

const normalizeUrl = (u) => {
  if (!u) return "";

  const s = String(u).trim();

  if (!s) return "";

  if (s.startsWith("http://") || s.startsWith("https://")) {
    return s;
  }

  if (s.startsWith("/")) {
    return `${SOCKET_BASE}${s}`;
  }

  return `${SOCKET_BASE}/${s}`;
};

const normalizeChatUploadPath = (u) => {
  const normalizedUrl = normalizeUrl(u);

  return normalizedUrl.replace("/upload/chat/", "/uploads/chat/");
};

const getMessageMemberId = (msg) => {
  return String(msg?.member?._id || msg?.member || msg?.memberId || "");
};

const initials = (name = "") =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

const toDate = (v) => {
  try {
    if (!v) return null;

    const d = new Date(v);

    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const msToCountdown = (ms) => {
  if (!Number.isFinite(ms) || ms <= 0) return "Expired";

  const totalSec = Math.floor(ms / 1000);

  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);

  if (days > 0) return `${days}d ${hrs}h`;
  if (hrs > 0) return `${hrs}h ${mins}m`;

  return `${mins}m`;
};

const isSameDay = (a, b) => {
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

const dayLabel = (iso) => {
  try {
    const d = new Date(iso);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diff = Math.round((dd.getTime() - today.getTime()) / 86400000);

    if (diff === 0) return "Today";
    if (diff === -1) return "Yesterday";

    return d.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const cacheBust = (url, updatedAt) => {
  if (!url) return "";

  const safeUrl = String(url).trim();

  if (!safeUrl) return "";

  const stamp = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const join = safeUrl.includes("?") ? "&" : "?";

  return `${safeUrl}${join}v=${stamp}`;
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

/* ---------------- Avatar ---------------- */

function Avatar({
  name,
  src,
  updatedAt,
  darkMode,
  size = 40,
  ring = false,
  className = "",
}) {
  const [broken, setBroken] = useState(false);

  const finalSrc = useMemo(() => {
    return cacheBust(src, updatedAt);
  }, [src, updatedAt]);

  useEffect(() => {
    setBroken(false);
  }, [finalSrc]);

  const baseFallback = darkMode
    ? "bg-white/10 text-white"
    : "bg-indigo-100 text-indigo-900";

  const ringCls = ring
    ? darkMode
      ? "ring-2 ring-indigo-400/40"
      : "ring-2 ring-indigo-500/25"
    : "";

  if (!finalSrc || broken) {
    return (
      <div
        className={`rounded-2xl flex items-center justify-center font-semibold shadow-sm ${baseFallback} ${ringCls} ${className}`}
        style={{
          width: size,
          height: size,
        }}
        aria-label="avatar-fallback"
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={name || "avatar"}
      onError={() => setBroken(true)}
      className={`rounded-2xl object-cover shadow-sm ${ringCls} ${className}`}
      style={{
        width: size,
        height: size,
      }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

export default function TrainerMessages() {
  const theme = useTheme?.() ?? {
    darkMode: false,
  };

  const darkMode = theme?.darkMode ?? false;

  const token = useMemo(() => {
    return (
      localStorage.getItem("trainerToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("trainerToken") ||
      sessionStorage.getItem("token") ||
      ""
    );
  }, []);

  const socketRef = useRef(null);
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);

  const [trainerId, setTrainerId] = useState(null);

  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");

  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [unreadMap, setUnreadMap] = useState({});
  const [lastSeenMap, setLastSeenMap] = useState({});

  const [mobileView, setMobileView] = useState("list");
  const [nowTick, setNowTick] = useState(Date.now());

  const [isPageVisible, setIsPageVisible] = useState(true);
  const [socketState, setSocketState] = useState("connecting");

  const activeThreadRef = useRef(activeThread);
  const pageVisibleRef = useRef(isPageVisible);
  const trainerIdRef = useRef(trainerId);

  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  useEffect(() => {
    pageVisibleRef.current = isPageVisible;
  }, [isPageVisible]);

  useEffect(() => {
    trainerIdRef.current = trainerId;
  }, [trainerId]);

  const scrollBottom = useCallback(() => {
    const el = scrollerRef.current;

    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  const autoGrow = useCallback(() => {
    const el = inputRef.current;

    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, []);

  useEffect(() => {
    autoGrow();
  }, [input, autoGrow]);

  useEffect(() => {
    const onVis = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    onVis();

    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setNowTick(Date.now());
    }, 30000);

    return () => {
      clearInterval(t);
    };
  }, []);

  const pickFiles = useCallback((e) => {
    const selected = Array.from(e.target.files || []);

    if (!selected.length) return;

    const filtered = selected.filter((f) => {
      return isImageMime(f.type) || isVideoMime(f.type);
    });

    setFiles((prev) => {
      return [...prev, ...filtered].slice(0, 5);
    });

    e.target.value = "";
  }, []);

  const removeFile = useCallback((idx) => {
    setFiles((prev) => {
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  useEffect(() => {
    const loadTrainerProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/trainers/me`, {
          method: "GET",
          headers: authHeaders(token),
          credentials: "include",
        });

        const data = await safeJson(res);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load trainer profile");
        }

        const id = data?._id || data?.id;

        if (!id) {
          throw new Error("Trainer _id missing from /trainers/me");
        }

        setTrainerId(id);
      } catch (e) {
        setError(e?.message || "Failed to load trainer profile");
      }
    };

    loadTrainerProfile();
  }, [token]);

  const normalizeThread = useCallback((t) => {
    const expires =
      t?.chatExpiresAt || t?.expiresAt || t?.accessExpiresAt || null;

    return {
      memberId: t?.memberId || t?.member?._id || t?.member || t?.userId,
      name: t?.name || t?.memberName || t?.fullname || "Member",
      email: t?.email || t?.memberEmail || "",
      lastText: t?.lastText || "",
      lastAt: t?.lastAt || t?.lastMessageAt || null,
      chatExpiresAt: expires,
      avatarUrl: t?.avatarUrl || "",
      avatarUpdatedAt: t?.avatarUpdatedAt || null,
    };
  }, []);

  const loadThreads = useCallback(async () => {
    if (!token) return;

    setLoadingThreads(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/messages/threads`, {
        method: "GET",
        headers: authHeaders(token, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load threads");
      }

      const list = Array.isArray(data)
        ? data.map(normalizeThread).filter((x) => x?.memberId)
        : [];

      setUnreadMap((prev) => {
        const next = {
          ...prev,
        };

        const ids = new Set(
          list.map((x) => {
            return String(x.memberId);
          })
        );

        Object.keys(next).forEach((k) => {
          if (!ids.has(String(k))) {
            delete next[k];
          }
        });

        return next;
      });

      setThreads(list);

      setActiveThread((cur) => {
        if (
          cur?.memberId &&
          list.some((x) => String(x.memberId) === String(cur.memberId))
        ) {
          return cur;
        }

        return list[0] || null;
      });
    } catch (e) {
      setError(e?.message || "Failed to load threads");
    } finally {
      setLoadingThreads(false);
    }
  }, [token, normalizeThread]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!token) return;

    setSocketState("connecting");

    const socket = io(SOCKET_BASE, {
      transports: ["websocket", "polling"],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 600,
      timeout: 12000,
      withCredentials: true,
    });

    socketRef.current = socket;

    const joinActiveRoom = () => {
      const currentTrainerId = trainerIdRef.current;
      const currentThread = activeThreadRef.current;

      if (!currentTrainerId || !currentThread?.memberId) {
        return;
      }

      socket.emit("chat:join", {
        trainerId: currentTrainerId,
        memberId: currentThread.memberId,
      });

      console.log(
        "✅ TRAINER FRONTEND JOIN ROOM:",
        `chat:${currentTrainerId}:${currentThread.memberId}`
      );
    };

    const onConnect = () => {
      setSocketState("online");
      joinActiveRoom();
    };

    const onDisconnect = () => {
      setSocketState("offline");
    };

    const onConnectError = (err) => {
      setSocketState("offline");
      setError(err?.message || "Socket connection failed");

      console.log("socket connect_error:", err?.message, err);
    };

    const onChatJoined = (payload) => {
      console.log("✅ TRAINER SOCKET JOINED:", payload?.room);
    };

    const onChatError = (payload) => {
      setError(payload?.message || "Chat error");
      console.log("❌ TRAINER CHAT ERROR:", payload);
    };

    const onChatNew = (msg) => {
      console.log("📩 TRAINER RECEIVED chat:new:", msg);

      const memberId = getMessageMemberId(msg);

      if (!memberId) {
        console.log("❌ Incoming message missing member id:", msg);
        return;
      }

      const lastAt = msg?.createdAt || new Date().toISOString();

      const lastText =
        msg?.text ||
        (Array.isArray(msg?.attachments) && msg.attachments.length > 0
          ? "📎 Attachment"
          : "");

      setThreads((prev) => {
        const next = [...prev];

        const idx = next.findIndex((t) => {
          return String(t.memberId) === String(memberId);
        });

        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastAt,
            lastText,
          };

          const [moved] = next.splice(idx, 1);

          next.unshift(moved);

          return next;
        }

        next.unshift({
          memberId,
          name:
            msg?.sender?.fullName ||
            msg?.sender?.fullname ||
            msg?.sender?.name ||
            "Member",
          email: msg?.sender?.email || "",
          lastText,
          lastAt,
          chatExpiresAt: null,
          avatarUrl: msg?.senderAvatarUrl || "",
          avatarUpdatedAt: msg?.senderAvatarUpdatedAt || null,
        });

        return next;
      });

      const active = activeThreadRef.current;
      const isActive = String(active?.memberId) === String(memberId);

      if (isActive) {
        setMessages((prev) => {
          const id = msg?._id;

          if (
            id &&
            prev.some((p) => {
              return String(p?._id) === String(id);
            })
          ) {
            return prev;
          }

          return [...prev, msg];
        });

        if (pageVisibleRef.current) {
          setUnreadMap((prev) => {
            return {
              ...prev,
              [memberId]: 0,
            };
          });

          setLastSeenMap((prev) => {
            return {
              ...prev,
              [memberId]: new Date().toISOString(),
            };
          });
        } else {
          setUnreadMap((prev) => {
            return {
              ...prev,
              [memberId]: (prev?.[memberId] || 0) + 1,
            };
          });
        }

        scrollBottom();

        return;
      }

      setUnreadMap((prev) => {
        return {
          ...prev,
          [memberId]: (prev?.[memberId] || 0) + 1,
        };
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("chat:joined", onChatJoined);
    socket.on("chat:error", onChatError);
    socket.on("chat:new", onChatNew);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("chat:joined", onChatJoined);
      socket.off("chat:error", onChatError);
      socket.off("chat:new", onChatNew);

      socket.disconnect();

      socketRef.current = null;
    };
  }, [token, scrollBottom]);

  const loadMessages = useCallback(
    async (memberId) => {
      if (!trainerId || !memberId) return;

      setLoadingMsgs(true);
      setError("");

      try {
        const res = await fetch(
          `${API_BASE}/messages/${trainerId}?memberId=${memberId}`,
          {
            method: "GET",
            headers: authHeaders(token, {
              "Content-Type": "application/json",
            }),
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await safeJson(res);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load messages");
        }

        setMessages(Array.isArray(data) ? data : []);
        scrollBottom();
      } catch (e) {
        setError(e?.message || "Failed to load messages");
      } finally {
        setLoadingMsgs(false);
      }
    },
    [token, trainerId, scrollBottom]
  );

  const openThread = useCallback((t) => {
    if (!t?.memberId) return;

    setActiveThread(t);
    setMobileView("chat");

    const mid = String(t.memberId);

    setUnreadMap((prev) => {
      return {
        ...prev,
        [mid]: 0,
      };
    });

    setLastSeenMap((prev) => {
      return {
        ...prev,
        [mid]: new Date().toISOString(),
      };
    });
  }, []);

  useEffect(() => {
    if (!trainerId || !activeThread?.memberId) return;

    if (socketRef.current?.connected) {
      socketRef.current.emit("chat:join", {
        trainerId,
        memberId: activeThread.memberId,
      });

      console.log(
        "✅ TRAINER THREAD SWITCH JOIN:",
        `chat:${trainerId}:${activeThread.memberId}`
      );
    }

    loadMessages(activeThread.memberId);

    const mid = String(activeThread.memberId);

    setUnreadMap((prev) => {
      return {
        ...prev,
        [mid]: 0,
      };
    });

    setLastSeenMap((prev) => {
      return {
        ...prev,
        [mid]: new Date().toISOString(),
      };
    });
  }, [trainerId, activeThread?.memberId, loadMessages]);

  const activeExpiresAt = useMemo(() => {
    return toDate(activeThread?.chatExpiresAt);
  }, [activeThread?.chatExpiresAt]);

  const chatExpired = useMemo(() => {
    if (!activeExpiresAt) return false;

    return Date.now() > activeExpiresAt.getTime();
  }, [activeExpiresAt, nowTick]);

  const timeLeftText = useMemo(() => {
    if (!activeExpiresAt) return null;

    return msToCountdown(activeExpiresAt.getTime() - Date.now());
  }, [activeExpiresAt, nowTick]);

  const sendText = useCallback(async () => {
    const clean = input.trim();

    if (!clean || !trainerId || !activeThread?.memberId) return;

    if (chatExpired) {
      setError("Chat expired. Member must book again to unlock for 30 days.");
      return;
    }

    setSending(true);
    setError("");

    try {
      socketRef.current?.emit("chat:send", {
        trainerId,
        memberId: activeThread.memberId,
        text: clean,
      });

      setInput("");
      scrollBottom();
    } catch {
      setError("Send failed");
    } finally {
      setSending(false);
    }
  }, [input, trainerId, activeThread?.memberId, chatExpired, scrollBottom]);

  const sendMedia = useCallback(async () => {
    const clean = input.trim();

    if (!trainerId || !activeThread?.memberId) return;
    if (!clean && files.length === 0) return;

    if (chatExpired) {
      setError("Chat expired. Member must book again to unlock for 30 days.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const fd = new FormData();

      fd.append("memberId", activeThread.memberId);
      fd.append("text", clean);

      files.forEach((f) => {
        fd.append("files", f);
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

      setMessages((prev) => {
        const id = data?._id;

        if (
          id &&
          prev.some((p) => {
            return String(p?._id) === String(id);
          })
        ) {
          return prev;
        }

        return [...prev, data];
      });

      setThreads((prev) => {
        const next = [...prev];

        const idx = next.findIndex((t) => {
          return String(t.memberId) === String(activeThread.memberId);
        });

        const lastAt = data?.createdAt || new Date().toISOString();

        const lastText =
          data?.text ||
          (Array.isArray(data?.attachments) && data.attachments.length
            ? "📎 Attachment"
            : "");

        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastAt,
            lastText,
          };

          const [moved] = next.splice(idx, 1);

          next.unshift(moved);

          return next;
        }

        return next;
      });

      setInput("");
      clearFiles();
      scrollBottom();
    } catch (e) {
      setError(e?.message || "Media upload failed");
    } finally {
      setSending(false);
    }
  }, [
    input,
    files,
    token,
    trainerId,
    activeThread?.memberId,
    chatExpired,
    clearFiles,
    scrollBottom,
  ]);

  const handleSend = useCallback(async () => {
    if (files.length > 0) {
      return sendMedia();
    }

    return sendText();
  }, [files.length, sendMedia, sendText]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return threads;

    return threads.filter((t) => {
      return (t?.name || "").toLowerCase().includes(q);
    });
  }, [threads, search]);

  const messagesWithSeparators = useMemo(() => {
    if (!Array.isArray(messages)) return [];

    const out = [];

    for (let i = 0; i < messages.length; i++) {
      const cur = messages[i];
      const prev = messages[i - 1];

      const curAt = cur?.createdAt;
      const prevAt = prev?.createdAt;

      const shouldSep = curAt && (!prevAt || !isSameDay(prevAt, curAt));

      if (shouldSep) {
        out.push({
          _type: "sep",
          id: `sep-${curAt}-${i}`,
          label: dayLabel(curAt),
        });
      }

      out.push({
        _type: "msg",
        ...cur,
      });
    }

    return out;
  }, [messages]);

  const pageBg = darkMode
    ? "bg-gradient-to-br from-[#08111f] via-[#0f172a] to-[#111827]"
    : "bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-50/60";

  const shellCard = darkMode
    ? "bg-white/[0.04] border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    : "bg-white/80 border-slate-200/70 shadow-[0_12px_40px_rgba(15,23,42,0.08)]";

  const panelCard = darkMode
    ? "bg-white/[0.03] border-white/10"
    : "bg-white/75 border-slate-200/70";

  const subtleBorder = darkMode ? "border-white/10" : "border-slate-200/70";
  const hover = darkMode ? "hover:bg-white/[0.06]" : "hover:bg-slate-50";

  const textMain = darkMode ? "text-white" : "text-slate-900";
  const textSoft = darkMode ? "text-slate-300" : "text-slate-600";
  const textFaint = darkMode ? "text-slate-400" : "text-slate-500";

  const inputCls = darkMode
    ? "bg-black/25 border-white/10 text-white placeholder:text-white/35"
    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400";

  const statusPill =
    socketState === "online"
      ? darkMode
        ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/25"
        : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : socketState === "connecting"
        ? darkMode
          ? "bg-indigo-400/15 text-indigo-200 border-indigo-400/25"
          : "bg-indigo-500/10 text-indigo-700 border-indigo-500/20"
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

  const canType = !!activeThread?.memberId && !chatExpired;

  const activeMemberAvatar = activeThread?.avatarUrl || "";
  const activeMemberAvatarUpdatedAt = activeThread?.avatarUpdatedAt || null;

  return (
    <div className={`h-[100dvh] w-full ${pageBg} transition-colors duration-200`}>
      <div className="h-full w-full p-3 md:p-4">
        <div
          className={`h-full w-full overflow-hidden rounded-[2rem] border ${shellCard} transition-colors duration-200 backdrop-blur-2xl`}
        >
          <div className="h-full w-full flex">
            {/* Sidebar */}
            <aside
              className={`
                w-full md:w-[360px] shrink-0 border-r ${subtleBorder}
                ${panelCard}
                ${mobileView === "chat" ? "hidden md:flex" : "flex"}
                flex-col backdrop-blur-xl transition-colors duration-200
              `}
            >
              <div
                className={`p-5 border-b ${subtleBorder} sticky top-0 z-10 backdrop-blur-xl ${darkMode ? "bg-black/10" : "bg-white/60"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`font-semibold flex items-center gap-2 ${textMain}`}>
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${darkMode
                            ? "bg-indigo-500/15 text-indigo-200"
                            : "bg-indigo-50 text-indigo-700"
                          }`}
                      >
                        <MessagesSquare size={18} />
                      </div>

                      <div>
                        <div className="text-base">Messages</div>
                        <div className={`text-xs font-normal ${textFaint}`}>
                          Member inbox
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1.5 rounded-full border text-xs flex items-center gap-2 ${statusPill}`}
                    >
                      {statusIcon}
                      {socketState === "online"
                        ? "Online"
                        : socketState === "connecting"
                          ? "Connecting"
                          : "Offline"}
                    </div>

                    <button
                      onClick={loadThreads}
                      className={`p-2.5 rounded-2xl border ${subtleBorder} ${hover} transition-colors duration-200`}
                      title="Refresh"
                    >
                      <RefreshCw size={16} className={textMain} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 relative">
                  <Search
                    size={16}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-white/40" : "text-slate-400"
                      }`}
                  />

                  <input
                    className={`w-full pl-10 pr-3 py-3 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors duration-200 ${inputCls}`}
                    placeholder="Search members"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {error && (
                  <div
                    className={`mt-3 text-xs rounded-2xl px-3 py-2 border ${darkMode
                        ? "text-rose-200 bg-rose-400/10 border-rose-400/20"
                        : "text-rose-700 bg-rose-50 border-rose-200"
                      }`}
                  >
                    {error}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingThreads ? (
                  <div
                    className={`rounded-3xl border ${subtleBorder} p-4 text-sm ${textSoft}`}
                  >
                    Loading threads...
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div
                    className={`rounded-3xl border ${subtleBorder} p-4 text-sm ${textSoft}`}
                  >
                    No members available
                  </div>
                ) : (
                  filteredThreads.map((t) => {
                    const active =
                      String(activeThread?.memberId) === String(t.memberId);

                    const unread = unreadMap?.[String(t.memberId)] || 0;

                    const tExpires = toDate(t?.chatExpiresAt);

                    const expired = tExpires
                      ? Date.now() > tExpires.getTime()
                      : false;

                    return (
                      <motion.button
                        layout
                        key={String(t.memberId)}
                        onClick={() => openThread(t)}
                        whileTap={{
                          scale: 0.99,
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3.5 rounded-[1.4rem] transition-colors duration-200 border ${active
                            ? darkMode
                              ? "bg-indigo-500/12 border-indigo-400/20 shadow-[0_0_0_1px_rgba(99,102,241,.18)]"
                              : "bg-indigo-50 border-indigo-200"
                            : `border-transparent ${hover}`
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            name={t?.name}
                            src={t?.avatarUrl}
                            updatedAt={t?.avatarUpdatedAt}
                            darkMode={darkMode}
                            size={46}
                            ring={active}
                          />

                          <div className="text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-semibold text-sm truncate max-w-[170px] ${textMain}`}
                              >
                                {t?.name}
                              </p>

                              {expired && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full border ${darkMode
                                      ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
                                      : "border-rose-200 bg-rose-50 text-rose-700"
                                    }`}
                                >
                                  Expired
                                </span>
                              )}
                            </div>

                            <p className={`text-xs truncate ${textFaint}`}>
                              {t?.lastText || "No messages yet"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 pl-2">
                          <div className={`text-[11px] ${textFaint}`}>
                            {t?.lastAt ? prettyTime(t.lastAt) : ""}
                          </div>

                          {unread > 0 && (
                            <div className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow">
                              {unread > 99 ? "99+" : unread}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Chat Panel */}
            <section
              className={`flex-1 flex flex-col h-full min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"
                }`}
            >
              <div
                className={`px-4 md:px-6 py-4 border-b ${subtleBorder} sticky top-0 z-10 backdrop-blur-xl ${darkMode ? "bg-black/10" : "bg-white/60"
                  }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    className={`md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-2xl border ${subtleBorder} ${hover} transition-colors duration-200 ${textMain}`}
                    onClick={() => setMobileView("list")}
                  >
                    <ArrowLeft size={16} />
                    Threads
                  </button>

                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={activeThread?.name || "Member"}
                      src={activeMemberAvatar}
                      updatedAt={activeMemberAvatarUpdatedAt}
                      darkMode={darkMode}
                      size={46}
                      ring
                    />

                    <div className="min-w-0">
                      <div className={`font-semibold truncate ${textMain}`}>
                        {activeThread?.name || "Select a member"}
                      </div>

                      <div className={`text-xs truncate ${textFaint}`}>
                        {activeThread?.email ||
                          (activeThread?.memberId ? "Member" : "—")}
                      </div>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    {activeThread?.memberId ? (
                      <>
                        {activeExpiresAt ? (
                          <div className={`text-xs ${textSoft}`}>
                            <span>Chat expires in </span>

                            <span
                              className={`font-semibold ${chatExpired
                                  ? "text-rose-400"
                                  : darkMode
                                    ? "text-emerald-300"
                                    : "text-emerald-600"
                                }`}
                            >
                              {timeLeftText}
                            </span>
                          </div>
                        ) : (
                          <div className={`text-xs ${textSoft}`}>Live chat</div>
                        )}

                        <div
                          className={`text-[11px] mt-0.5 flex items-center justify-end gap-2 ${textFaint}`}
                        >
                          <Sparkles
                            size={12}
                            className={
                              darkMode ? "text-indigo-200" : "text-indigo-700"
                            }
                          />
                          Live • Saved
                        </div>
                      </>
                    ) : (
                      <div className={`text-xs ${textSoft}`}>
                        Pick a member to view messages
                      </div>
                    )}
                  </div>
                </div>

                {activeThread?.memberId && chatExpired && (
                  <div
                    className={`mt-3 text-sm px-4 py-3 rounded-2xl border ${darkMode
                        ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                  >
                    Chat expired. Member must book again to unlock chat for 30
                    days.
                  </div>
                )}
              </div>

              <div
                ref={scrollerRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-6"
              >
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                  {!activeThread?.memberId ? (
                    <div className="py-20 text-center">
                      <div
                        className={`mx-auto mb-4 h-16 w-16 rounded-3xl flex items-center justify-center ${darkMode
                            ? "bg-white/5 text-white/70"
                            : "bg-white text-slate-500 shadow-sm"
                          }`}
                      >
                        <MessagesSquare size={28} />
                      </div>

                      <p className={`text-base font-medium ${textMain}`}>
                        No conversation selected
                      </p>

                      <p className={`mt-2 text-sm ${textFaint}`}>
                        Choose a member from the left to start chatting.
                      </p>
                    </div>
                  ) : loadingMsgs ? (
                    <div className={`text-sm ${textSoft}`}>
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-16 text-center">
                      <div
                        className={`mx-auto mb-4 h-16 w-16 rounded-3xl flex items-center justify-center ${darkMode
                            ? "bg-white/5 text-white/70"
                            : "bg-white text-slate-500 shadow-sm"
                          }`}
                      >
                        <Sparkles size={26} />
                      </div>

                      <p className={`text-base font-medium ${textMain}`}>
                        No messages yet
                      </p>

                      <p className={`mt-2 text-sm ${textFaint}`}>
                        Send the first message to begin the conversation.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messagesWithSeparators.map((item, idx) => {
                        if (item._type === "sep") {
                          return (
                            <motion.div
                              key={item.id}
                              initial={{
                                opacity: 0,
                                y: 6,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              className="flex justify-center"
                            >
                              <div
                                className={`text-[11px] px-3 py-1 rounded-full border ${subtleBorder} ${darkMode
                                    ? "bg-white/5 text-white/70"
                                    : "bg-white text-slate-600"
                                  }`}
                              >
                                {item.label}
                              </div>
                            </motion.div>
                          );
                        }

                        const m = item;

                        const senderRole =
                          m?.sender?.role ||
                          (m?.senderModel === "Trainer" ? "trainer" : "member");

                        const isOwn = senderRole === "trainer";

                        const label = isOwn
                          ? "You"
                          : activeThread?.name || "Member";

                        const ownBubble =
                          "bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.25)]";

                        const otherBubble = darkMode
                          ? "bg-white/[0.05] border border-white/10 text-white"
                          : "bg-white border border-slate-200 text-slate-900 shadow-sm";

                        const atts = Array.isArray(m?.attachments)
                          ? m.attachments
                          : [];

                        return (
                          <motion.div
                            key={m._id || `m-${idx}`}
                            initial={{
                              opacity: 0,
                              y: 10,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            className={`w-full flex gap-2 ${isOwn ? "justify-end" : "justify-start"
                              }`}
                          >
                            {!isOwn && (
                              <Avatar
                                name={activeThread?.name || "Member"}
                                src={m?.senderAvatarUrl || activeMemberAvatar}
                                updatedAt={
                                  m?.senderAvatarUpdatedAt ||
                                  activeMemberAvatarUpdatedAt
                                }
                                darkMode={darkMode}
                                size={34}
                                className="shrink-0 mt-[18px]"
                              />
                            )}

                            <div className="max-w-[80%]">
                              <div
                                className={`text-[11px] mb-1 ${isOwn ? "text-right" : "text-left"
                                  } ${textFaint}`}
                              >
                                <span className="font-medium">{label}</span>
                                <span> • {prettyTime(m.createdAt)}</span>
                              </div>

                              <div
                                className={`px-4 py-3 rounded-[1.6rem] ${isOwn
                                    ? `${ownBubble} rounded-br-md`
                                    : `${otherBubble} rounded-bl-md`
                                  }`}
                              >
                                {m?.text ? (
                                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                    {m.text}
                                  </p>
                                ) : null}

                                {atts.length > 0 && (
                                  <div className={`${m?.text ? "mt-3" : ""} space-y-2.5`}>
                                    {atts.map((a, i) => {
                                      const key = a?.url || `${m?._id || idx}-att-${i}`;
                                      const url = normalizeChatUploadPath(a?.url);

                                      if (a?.type === "image") {
                                        return (
                                          <img
                                            key={key}
                                            src={url}
                                            alt={a?.filename || "image"}
                                            className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] object-cover rounded-2xl border border-white/10"
                                            loading="lazy"
                                            onError={(ev) => {
                                              console.log("IMG LOAD FAILED:", url);
                                              ev.currentTarget.style.display = "none";
                                            }}
                                          />
                                        );
                                      }

                                      if (a?.type === "video") {
                                        return (
                                          <video
                                            key={key}
                                            src={url}
                                            controls
                                            className="w-[240px] h-[170px] sm:w-[280px] sm:h-[190px] object-cover rounded-2xl border border-white/10"
                                            onError={() =>
                                              console.log("VIDEO LOAD FAILED:", url)
                                            }
                                          />
                                        );
                                      }

                                      return (
                                        <a
                                          key={key}
                                          href={url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs underline"
                                        >
                                          {a?.filename || "Download file"}
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
                </div>
              </div>

              <div
                className={`border-t ${subtleBorder} px-4 md:px-6 py-4 backdrop-blur-xl ${darkMode ? "bg-black/10" : "bg-white/60"
                  }`}
              >
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                  <input
                    id="trainer-chat-media"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={pickFiles}
                  />

                  <div className="flex items-end gap-3">
                    <label
                      htmlFor="trainer-chat-media"
                      className={`inline-flex items-center justify-center rounded-2xl h-12 w-12 border cursor-pointer transition-colors duration-200 ${darkMode
                          ? "bg-white/5 hover:bg-white/10 text-white border-white/10"
                          : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200"
                        }`}
                      title="Attach image/video"
                    >
                      <Paperclip size={18} />
                    </label>

                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                          !activeThread?.memberId
                            ? "Select a member first..."
                            : chatExpired
                              ? "Chat expired..."
                              : "Type a message…"
                        }
                        className={`w-full resize-none rounded-[1.6rem] px-4 py-3.5 pr-4 text-sm outline-none border focus:ring-2 focus:ring-indigo-500/30 transition-colors duration-200 ${inputCls} ${!canType ? "opacity-70" : ""
                          }`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        disabled={!activeThread?.memberId || chatExpired}
                      />
                    </div>

                    <button
                      onClick={handleSend}
                      disabled={
                        sending ||
                        (!input.trim() && files.length === 0) ||
                        !activeThread?.memberId ||
                        chatExpired
                      }
                      className={`rounded-[1.3rem] px-5 h-12 text-white shadow-md transition-colors duration-200 font-semibold flex items-center gap-2 ${sending ||
                          (!input.trim() && files.length === 0) ||
                          !activeThread?.memberId ||
                          chatExpired
                          ? darkMode
                            ? "bg-white/10 text-white/50 cursor-not-allowed"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 hover:from-indigo-500 hover:via-violet-500 hover:to-blue-500"
                        }`}
                      title={
                        !activeThread?.memberId
                          ? "Select a member first"
                          : chatExpired
                            ? "Chat expired"
                            : "Send"
                      }
                    >
                      <Send size={16} />
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>

                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {files.map((f, idx) => (
                        <div
                          key={`${f.name}-${idx}`}
                          className={`text-xs px-3 py-2 rounded-2xl border ${subtleBorder} ${darkMode
                              ? "bg-white/5 text-white"
                              : "bg-white text-slate-700"
                            } flex items-center gap-2`}
                          title={f.type}
                        >
                          {isImageMime(f.type) ? (
                            <ImageIcon size={14} />
                          ) : (
                            <Video size={14} />
                          )}

                          <span className="max-w-[220px] truncate">
                            {f.name}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="opacity-70 hover:opacity-100"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={clearFiles}
                        className={`text-xs underline ${textFaint} hover:opacity-100 opacity-80`}
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  <div className={`text-[11px] flex items-center justify-between ${textFaint}`}>
                    <span>Enter = send • Shift + Enter = new line</span>

                    <span>
                      {socketState === "online"
                        ? "Secure session"
                        : "Trying to reconnect..."}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}