/* eslint-disable no-unused-vars */
// src/pages/member/UserClasses.jsx

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  MessageCircle,
  Star,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  ChevronDown,
  Wallet,
  XCircle,
  ShieldAlert,
  History,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StripePayModal from "../../components/StripePayModal";

const PAID_SESSIONS_KEY = "paid_sessions_map_v1";

/**
 * Deployment-safe API URL.
 *
 * VITE_API_URL in Vercel should be:
 * https://gym-fitness-backend-d13i.onrender.com
 *
 * This file automatically converts it into:
 * https://gym-fitness-backend-d13i.onrender.com/api
 */
const RAW_API_URL =
  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const API_BASE = `${RAW_API_URL.replace(/\/+$/, "")}/api`;

const UserClasses = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [trainers, setTrainers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [userId, setUserId] = useState(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [error, setError] = useState("");

  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    text: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const [paidMap, setPaidMap] = useState(() => {
    try {
      const raw = localStorage.getItem(PAID_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const token = useMemo(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }, []);

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    });
  }, [token]);

  const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";

  const cardBg = darkMode
    ? "bg-gray-900 border border-gray-800"
    : "bg-white border border-gray-200";

  const inputBg = darkMode
    ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-400"
    : "bg-white border border-gray-200 text-gray-900 placeholder-gray-500";

  const softText = darkMode ? "text-gray-300" : "text-gray-600";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";

  const showToast = useCallback((type, text) => {
    setToast({ show: true, type, text });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const persistPaidMap = useCallback((next) => {
    setPaidMap(next);

    try {
      localStorage.setItem(PAID_SESSIONS_KEY, JSON.stringify(next));
    } catch {
      // ignore localStorage error
    }
  }, []);

  const markPaid = useCallback(
    (sessionId) => {
      if (!sessionId) return;

      persistPaidMap({
        ...(paidMap || {}),
        [sessionId]: true,
      });
    },
    [paidMap, persistPaidMap]
  );

  const unmarkPaid = useCallback(
    (sessionId) => {
      if (!sessionId) return;

      const next = { ...(paidMap || {}) };
      delete next[sessionId];

      persistPaidMap(next);
    },
    [paidMap, persistPaidMap]
  );

  const isPaidForSession = useCallback(
    (sessionId) => {
      if (!sessionId) return false;

      if (paidMap?.[sessionId]) return true;

      if (
        activeSubscription?.session?._id === sessionId &&
        activeSubscription?.active &&
        activeSubscription?.status === "active"
      ) {
        return true;
      }

      const matchInHistory = (subscriptionHistory || []).some((item) => {
        return (
          item?.session?._id === sessionId &&
          item?.active === true &&
          item?.status === "active"
        );
      });

      return Boolean(matchInHistory);
    },
    [paidMap, activeSubscription, subscriptionHistory]
  );

  const isEnrolled = useCallback(
    (session) => {
      if (!userId) return false;

      const list = session?.clientsEnrolled || [];

      return list.some((u) => {
        const id = typeof u === "string" ? u : u?._id || u?.id;
        return id?.toString() === userId?.toString();
      });
    },
    [userId]
  );

  const trainerIdOf = (s) => {
    return typeof s?.trainer === "string"
      ? s.trainer
      : s?.trainer?._id || s?.trainer?.id;
  };

  const formatPrice = (cents = 0) => {
    if (!cents || cents <= 0) return "Free";
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDisplayDate = (rawDate) => {
    if (!rawDate) return "TBA";

    const d = new Date(rawDate);

    if (Number.isNaN(d.getTime())) return rawDate;

    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDisplayTime = (rawTime) => {
    if (!rawTime) return "TBA";

    if (/^\d{1,2}:\d{2}/.test(rawTime)) {
      const [hour, minute] = rawTime.split(":");
      const date = new Date();

      date.setHours(Number(hour), Number(minute), 0, 0);

      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return rawTime;
  };

  const formatDateTime = (raw) => {
    if (!raw) return "N/A";

    const d = new Date(raw);

    if (Number.isNaN(d.getTime())) return raw;

    return d.toLocaleString();
  };

  const capacityInfo = (session) => {
    const enrolledCount = session?.clientsEnrolled?.length || 0;
    const capacity = session?.maxClients || 0;
    const full = capacity > 0 && enrolledCount >= capacity;

    const percentage =
      capacity > 0 ? Math.min((enrolledCount / capacity) * 100, 100) : 0;

    return {
      enrolledCount,
      capacity,
      full,
      percentage,
    };
  };

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const { data } = await api.get("/users/me");
      setUserId(data?.id || data?._id || null);
    } catch (err) {
      console.error("User fetch failed", err);
    } finally {
      setLoadingUser(false);
    }
  }, [api, token]);

  const fetchSubscriptions = useCallback(async () => {
    if (!token) {
      setLoadingSubscription(false);

      return {
        active: null,
        history: [],
      };
    }

    try {
      setLoadingSubscription(true);

      const [activeRes, historyRes] = await Promise.all([
        api.get("/subscriptions/active"),
        api.get("/subscriptions/history"),
      ]);

      const nextActive = activeRes.data || null;
      const nextHistory = Array.isArray(historyRes.data) ? historyRes.data : [];

      setActiveSubscription(nextActive);
      setSubscriptionHistory(nextHistory);

      return {
        active: nextActive,
        history: nextHistory,
      };
    } catch (err) {
      console.error("Subscription fetch failed", err);

      return {
        active: null,
        history: [],
      };
    } finally {
      setLoadingSubscription(false);
    }
  }, [api, token]);

  const loadPageData = useCallback(async () => {
    if (!token) {
      setError("You are not logged in.");
      setLoadingPage(false);
      return;
    }

    try {
      setLoadingPage(true);
      setError("");

      const [trainersRes, sessionsRes] = await Promise.all([
        api.get("/trainers/public"),
        api.get("/sessions/public"),
      ]);

      setTrainers(Array.isArray(trainersRes.data) ? trainersRes.data : []);
      setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
    } catch (err) {
      console.error("Page load failed", err);

      setError(
        err?.response?.data?.message ||
        "Failed to load trainers and classes. Please try again."
      );
    } finally {
      setLoadingPage(false);
    }
  }, [api, token]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSubscriptions(), loadPageData()]);
  }, [fetchSubscriptions, loadPageData]);

  const syncAfterPayment = useCallback(
    async (sessionId) => {
      let matched = false;

      for (let i = 0; i < 6; i += 1) {
        const subResult = await fetchSubscriptions();
        await loadPageData();

        const activeMatch =
          subResult?.active?.session?._id === sessionId &&
          subResult?.active?.active === true &&
          subResult?.active?.status === "active";

        const historyMatch = (subResult?.history || []).some((item) => {
          return (
            item?.session?._id === sessionId &&
            item?.active === true &&
            item?.status === "active"
          );
        });

        if (activeMatch || historyMatch) {
          matched = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      if (!matched && sessionId) {
        markPaid(sessionId);
      }

      return matched;
    },
    [fetchSubscriptions, loadPageData, markPaid]
  );

  useEffect(() => {
    fetchUser();
    fetchSubscriptions();
    loadPageData();
  }, [fetchUser, fetchSubscriptions, loadPageData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const sessionId = params.get("sessionId");

    const run = async () => {
      if (paid === "1" && sessionId) {
        markPaid(sessionId);
        showToast("success", "Payment successful. Syncing your subscription...");
        window.history.replaceState({}, document.title, window.location.pathname);
        await syncAfterPayment(sessionId);
      }
    };

    run();
  }, [markPaid, showToast, syncAfterPayment]);

  const openPayModal = (session) => {
    setSelectedSession(session);
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayModalOpen(false);
    setSelectedSession(null);
  };

  const bookNow = async (session) => {
    try {
      await api.post(`/sessions/${session._id}/join`);
      showToast("success", "Booked successfully. Chat is now available.");
      await refreshAll();
    } catch (err) {
      console.error("BookNow error", err);

      if (isPaidForSession(session?._id)) {
        showToast("success", "Payment confirmed. Chat is unlocked.");
      } else {
        showToast(
          "error",
          err?.response?.data?.message || "Booking failed. Please try again."
        );
      }
    }
  };

  const handleSessionAccess = async (session) => {
    const cents = Number(session?.priceInCents || 0);

    if (cents <= 0) {
      await bookNow(session);
      return;
    }

    openPayModal(session);
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription?._id) return;

    try {
      setCancelling(true);

      const { data } = await api.post(
        `/subscriptions/${activeSubscription._id}/cancel`,
        {
          reason: cancelReason,
        }
      );

      showToast(
        "success",
        data?.message || "Subscription cancelled and refund processed."
      );

      if (activeSubscription?.session?._id) {
        unmarkPaid(activeSubscription.session._id);
      }

      setCancelModalOpen(false);
      setCancelReason("");

      await refreshAll();
    } catch (err) {
      console.error("Cancel subscription error", err);

      showToast(
        "error",
        err?.response?.data?.message || "Failed to cancel subscription."
      );
    } finally {
      setCancelling(false);
    }
  };

  const specialities = useMemo(() => {
    const set = new Set();

    trainers.forEach((t) => {
      if (t?.speciality) set.add(t.speciality);
    });

    return ["all", ...Array.from(set)];
  }, [trainers]);

  const sessionsByTrainer = useMemo(() => {
    const grouped = {};

    sessions.forEach((session) => {
      const tid = trainerIdOf(session);

      if (!grouped[tid]) grouped[tid] = [];

      grouped[tid].push(session);
    });

    return grouped;
  }, [sessions]);

  const filteredTrainers = useMemo(() => {
    let list = [...trainers];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      list = list.filter((trainer) => {
        const name = trainer?.name?.toLowerCase() || "";
        const bio = trainer?.bio?.toLowerCase() || "";
        const speciality = trainer?.speciality?.toLowerCase() || "";

        return name.includes(q) || bio.includes(q) || speciality.includes(q);
      });
    }

    if (selectedSpeciality !== "all") {
      list = list.filter((trainer) => trainer?.speciality === selectedSpeciality);
    }

    if (availableOnly) {
      list = list.filter((trainer) => {
        const tSessions = sessionsByTrainer[trainer._id] || [];
        return tSessions.some((session) => !capacityInfo(session).full);
      });
    }

    list.sort((a, b) => {
      if (sortBy === "rating") return (b?.rating || 0) - (a?.rating || 0);

      if (sortBy === "experience") {
        const expA = parseInt(a?.experience, 10) || 0;
        const expB = parseInt(b?.experience, 10) || 0;

        return expB - expA;
      }

      if (sortBy === "sessions") {
        const countA = (sessionsByTrainer[a._id] || []).length;
        const countB = (sessionsByTrainer[b._id] || []).length;

        return countB - countA;
      }

      if (sortBy === "name") {
        return (a?.name || "").localeCompare(b?.name || "");
      }

      return 0;
    });

    return list;
  }, [
    trainers,
    searchTerm,
    selectedSpeciality,
    availableOnly,
    sortBy,
    sessionsByTrainer,
  ]);

  const stats = useMemo(() => {
    const totalTrainers = trainers.length;
    const totalSessions = sessions.length;
    const availableSessions = sessions.filter((s) => !capacityInfo(s).full).length;
    const bookedSessions = sessions.filter((s) => isEnrolled(s)).length;

    return {
      totalTrainers,
      totalSessions,
      availableSessions,
      bookedSessions,
    };
  }, [trainers, sessions, isEnrolled]);

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 lg:px-8 py-6 transition-colors duration-200 ${pageBg}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Trainers & Classes
              </h1>
              <p className={`mt-2 text-sm sm:text-base ${softText}`}>
                Explore trainers, unlock paid sessions, reserve your spot, and
                chat after booking.
              </p>
            </div>

            <button
              onClick={refreshAll}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${darkMode
                  ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div
            className={`rounded-2xl p-5 transition-colors duration-200 ${cardBg}`}
          >
            <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-2xl ${darkMode
                      ? "bg-gray-800 text-blue-300"
                      : "bg-blue-50 text-blue-700"
                    }`}
                >
                  <Wallet size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Your Active Subscription
                  </h2>
                  <p className={`text-sm mt-1 ${softText}`}>
                    Cancel before the session starts to receive a 65% refund.
                  </p>

                  {loadingSubscription ? (
                    <p className={`text-sm mt-3 ${softText}`}>
                      Loading subscription...
                    </p>
                  ) : activeSubscription ? (
                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        <span className={mutedText}>Trainer:</span>{" "}
                        <span className="font-medium">
                          {activeSubscription?.trainer?.name || "N/A"}
                        </span>
                      </p>

                      <p>
                        <span className={mutedText}>Session:</span>{" "}
                        <span className="font-medium">
                          {activeSubscription?.session?.type || "N/A"}
                        </span>
                      </p>

                      <p>
                        <span className={mutedText}>Date:</span>{" "}
                        <span className="font-medium">
                          {formatDisplayDate(activeSubscription?.session?.date)} •{" "}
                          {formatDisplayTime(activeSubscription?.session?.time)}
                        </span>
                      </p>

                      <p>
                        <span className={mutedText}>Amount Paid:</span>{" "}
                        <span className="font-medium">
                          {formatPrice(activeSubscription?.amountPaid)}
                        </span>
                      </p>

                      <p>
                        <span className={mutedText}>Expires At:</span>{" "}
                        <span className="font-medium">
                          {formatDateTime(activeSubscription?.expiresAt)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className={`text-sm mt-3 ${softText}`}>
                      No active subscription found.
                    </p>
                  )}
                </div>
              </div>

              {activeSubscription && (
                <div className="w-full lg:w-auto">
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors duration-200"
                  >
                    <XCircle size={16} />
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            darkMode={darkMode}
            title="Active Trainers"
            value={stats.totalTrainers}
            icon={<Users size={18} />}
          />
          <StatCard
            darkMode={darkMode}
            title="Total Classes"
            value={stats.totalSessions}
            icon={<Calendar size={18} />}
          />
          <StatCard
            darkMode={darkMode}
            title="Available Spots"
            value={stats.availableSessions}
            icon={<CheckCircle2 size={18} />}
          />
          <StatCard
            darkMode={darkMode}
            title="Your Bookings"
            value={stats.bookedSessions}
            icon={<Dumbbell size={18} />}
          />
        </div>

        <div
          className={`rounded-2xl p-4 sm:p-5 mb-8 transition-colors duration-200 ${cardBg}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} />
            <h2 className="text-lg font-semibold">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className={`text-sm font-medium mb-2 block ${softText}`}>
                Search trainer
              </label>

              <div className="relative">
                <Search
                  size={16}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, bio, speciality..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-colors duration-200 ${inputBg}`}
                />
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium mb-2 block ${softText}`}>
                Speciality
              </label>

              <div className="relative">
                <select
                  value={selectedSpeciality}
                  onChange={(e) => setSelectedSpeciality(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl appearance-none outline-none transition-colors duration-200 ${inputBg}`}
                >
                  {specialities.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? "All Specialities" : item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${mutedText}`}
                />
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium mb-2 block ${softText}`}>
                Sort by
              </label>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl appearance-none outline-none transition-colors duration-200 ${inputBg}`}
                >
                  <option value="rating">Highest Rating</option>
                  <option value="experience">Most Experience</option>
                  <option value="sessions">Most Classes</option>
                  <option value="name">Name A-Z</option>
                </select>

                <ChevronDown
                  size={16}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${mutedText}`}
                />
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium mb-2 block ${softText}`}>
                Availability
              </label>

              <button
                type="button"
                onClick={() => setAvailableOnly((prev) => !prev)}
                className={`w-full px-4 py-3 rounded-xl text-left transition-colors duration-200 ${availableOnly
                    ? "bg-blue-600 text-white"
                    : darkMode
                      ? "bg-gray-900 border border-gray-700 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
              >
                {availableOnly ? "Showing Available Only" : "Show Available Only"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className={`rounded-2xl p-5 transition-colors duration-200 ${cardBg}`}>
            <div className="flex items-center gap-2 mb-4">
              <History size={18} />
              <h2 className="text-lg font-semibold">Subscription History</h2>
            </div>

            {loadingSubscription ? (
              <p className={softText}>Loading history...</p>
            ) : subscriptionHistory.length === 0 ? (
              <p className={softText}>No subscription history yet.</p>
            ) : (
              <div className="space-y-3">
                {subscriptionHistory.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-xl p-4 ${darkMode
                        ? "bg-gray-900 border border-gray-800"
                        : "bg-gray-50 border border-gray-200"
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {item?.trainer?.name || "Trainer"} •{" "}
                          {item?.session?.type || "Session"}
                        </p>

                        <p className={`text-sm ${softText}`}>
                          {formatDisplayDate(item?.session?.date)} •{" "}
                          {formatDisplayTime(item?.session?.time)}
                        </p>
                      </div>

                      <div className="text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item?.status === "active"
                              ? darkMode
                                ? "bg-green-900/40 text-green-300"
                                : "bg-green-50 text-green-700"
                              : item?.status === "refunded"
                                ? darkMode
                                  ? "bg-red-900/40 text-red-300"
                                  : "bg-red-50 text-red-700"
                                : darkMode
                                  ? "bg-gray-800 text-gray-300"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {item?.status || "unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loadingPage || loadingUser ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonTrainerCard key={i} darkMode={darkMode} />
            ))}
          </div>
        ) : error ? (
          <div
            className={`rounded-2xl p-8 text-center transition-colors duration-200 ${cardBg}`}
          >
            <AlertCircle size={36} className="mx-auto mb-3 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">Could not load classes</h3>
            <p className={`${softText} mb-5`}>{error}</p>
            <button
              onClick={loadPageData}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div
            className={`rounded-2xl p-10 text-center transition-colors duration-200 ${cardBg}`}
          >
            <Search size={36} className={`mx-auto mb-3 ${mutedText}`} />
            <h3 className="text-xl font-semibold mb-2">No trainers found</h3>
            <p className={softText}>
              Try changing your search, speciality, or availability filters.
            </p>
          </div>
        ) : (
          <motion.section
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredTrainers.map((trainer) => {
              const trainerSessions = sessionsByTrainer[trainer._id] || [];

              return (
                <TrainerCard
                  key={trainer._id}
                  trainer={trainer}
                  trainerSessions={trainerSessions}
                  darkMode={darkMode}
                  navigate={navigate}
                  isEnrolled={isEnrolled}
                  isPaidForSession={isPaidForSession}
                  openPayModal={openPayModal}
                  bookNow={bookNow}
                  handleSessionAccess={handleSessionAccess}
                  formatPrice={formatPrice}
                  formatDisplayDate={formatDisplayDate}
                  formatDisplayTime={formatDisplayTime}
                  capacityInfo={capacityInfo}
                />
              );
            })}
          </motion.section>
        )}
      </div>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className={`fixed bottom-5 right-5 z-50 max-w-sm w-[92%] sm:w-auto px-4 py-3 rounded-2xl shadow-xl border transition-colors duration-200 ${toast.type === "success"
                ? "bg-green-600 text-white border-green-500"
                : "bg-red-600 text-white border-red-500"
              }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === "success" ? (
                <CheckCircle2 size={18} className="mt-0.5" />
              ) : (
                <AlertCircle size={18} className="mt-0.5" />
              )}
              <p className="text-sm font-medium">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancelModalOpen && activeSubscription && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              className={`w-full max-w-lg rounded-3xl p-6 ${cardBg}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`p-3 rounded-2xl ${darkMode
                      ? "bg-red-900/30 text-red-300"
                      : "bg-red-50 text-red-700"
                    }`}
                >
                  <ShieldAlert size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">Cancel Subscription?</h3>
                  <p className={`text-sm mt-1 ${softText}`}>
                    You will receive only a 65% refund if the session has not
                    started yet.
                  </p>
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 mb-4 ${darkMode
                    ? "bg-gray-900 border border-gray-800"
                    : "bg-gray-50 border border-gray-200"
                  }`}
              >
                <p className="text-sm">
                  <span className={mutedText}>Trainer:</span>{" "}
                  <span className="font-medium">
                    {activeSubscription?.trainer?.name || "N/A"}
                  </span>
                </p>

                <p className="text-sm mt-1">
                  <span className={mutedText}>Session:</span>{" "}
                  <span className="font-medium">
                    {activeSubscription?.session?.type || "N/A"}
                  </span>
                </p>

                <p className="text-sm mt-1">
                  <span className={mutedText}>Paid:</span>{" "}
                  <span className="font-medium">
                    {formatPrice(activeSubscription?.amountPaid)}
                  </span>
                </p>

                <p className="text-sm mt-1">
                  <span className={mutedText}>Refund:</span>{" "}
                  <span className="font-medium text-green-500">
                    {formatPrice(
                      Math.floor((activeSubscription?.amountPaid || 0) * 0.65)
                    )}
                  </span>
                </p>
              </div>

              <div className="mb-5">
                <label className={`text-sm font-medium mb-2 block ${softText}`}>
                  Cancellation reason
                </label>

                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  placeholder="Optional reason..."
                  className={`w-full px-4 py-3 rounded-2xl outline-none resize-none transition-colors duration-200 ${inputBg}`}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setCancelModalOpen(false);
                    setCancelReason("");
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors duration-200 ${darkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  disabled={cancelling}
                >
                  Keep Subscription
                </button>

                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors duration-200 ${cancelling
                      ? "bg-red-400 text-white cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {payModalOpen && selectedSession && (
        <StripePayModal
          open={payModalOpen}
          sessionId={selectedSession._id}
          token={token}
          darkMode={darkMode}
          onClose={closePayModal}
          onPaid={async () => {
            markPaid(selectedSession._id);
            showToast("success", "Payment successful. Syncing your subscription...");
            closePayModal();
            await syncAfterPayment(selectedSession._id);
          }}
        />
      )}
    </div>
  );
};

const StatCard = ({ darkMode, title, value, icon }) => {
  return (
    <div
      className={`rounded-2xl p-4 transition-colors duration-200 ${darkMode
          ? "bg-gray-900 border border-gray-800"
          : "bg-white border border-gray-200"
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={darkMode ? "text-gray-300" : "text-gray-600"}>
          {title}
        </span>

        <div
          className={`p-2 rounded-xl ${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
            }`}
        >
          {icon}
        </div>
      </div>

      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
};

const TrainerCard = ({
  trainer,
  trainerSessions,
  darkMode,
  navigate,
  isEnrolled,
  isPaidForSession,
  openPayModal,
  bookNow,
  handleSessionAccess,
  formatPrice,
  formatDisplayDate,
  formatDisplayTime,
  capacityInfo,
}) => {
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${darkMode
          ? "bg-gray-900 border border-gray-800"
          : "bg-white border border-gray-200"
        }`}
    >
      <div className="p-5 sm:p-6 border-b border-gray-200/10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
              {trainer?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-semibold truncate">
                {trainer.name || "Trainer"}
              </h3>
              <p
                className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                {trainer.speciality || "Fitness Specialist"}
              </p>
            </div>
          </div>

          <div
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${darkMode
                ? "bg-gray-800 text-yellow-300"
                : "bg-yellow-50 text-yellow-700"
              }`}
          >
            {typeof trainer.rating === "number"
              ? `${trainer.rating.toFixed(1)} ★`
              : "N/A"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge darkMode={darkMode} text={trainer.experience || "N/A"} />
          <Badge darkMode={darkMode} text={`${trainerSessions.length} classes`} />
        </div>

        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={
                i < Math.floor(trainer.rating || 0)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
        </div>

        <p
          className={`text-sm leading-6 line-clamp-3 ${darkMode ? "text-gray-300" : "text-gray-600"
            }`}
        >
          {trainer.bio || "No trainer bio available."}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-base">Available Sessions</h4>
          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {trainerSessions.length} total
          </span>
        </div>

        {trainerSessions.length === 0 ? (
          <div
            className={`rounded-2xl px-4 py-6 text-center ${darkMode ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-500"
              }`}
          >
            No sessions available right now
          </div>
        ) : (
          <div className="space-y-4">
            {trainerSessions.map((session) => {
              const enrolled = isEnrolled(session);
              const paid = isPaidForSession(session?._id);
              const { enrolledCount, capacity, full, percentage } =
                capacityInfo(session);
              const cents = session?.priceInCents ?? 0;

              return (
                <SessionCard
                  key={session._id}
                  session={session}
                  darkMode={darkMode}
                  enrolled={enrolled}
                  paid={paid}
                  full={full}
                  enrolledCount={enrolledCount}
                  capacity={capacity}
                  percentage={percentage}
                  navigate={navigate}
                  trainer={trainer}
                  openPayModal={openPayModal}
                  bookNow={bookNow}
                  handleSessionAccess={handleSessionAccess}
                  formatPrice={formatPrice}
                  formatDisplayDate={formatDisplayDate}
                  formatDisplayTime={formatDisplayTime}
                  cents={cents}
                />
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SessionCard = ({
  session,
  darkMode,
  enrolled,
  paid,
  full,
  enrolledCount,
  capacity,
  percentage,
  navigate,
  trainer,
  bookNow,
  handleSessionAccess,
  formatPrice,
  formatDisplayDate,
  formatDisplayTime,
  cents,
}) => {
  return (
    <div
      className={`rounded-2xl p-4 transition-colors duration-200 ${darkMode
          ? "bg-gray-900 border border-gray-800"
          : "bg-gray-50 border border-gray-200"
        }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <InfoChip
            darkMode={darkMode}
            icon={<Calendar size={13} />}
            text={formatDisplayDate(session.date)}
          />
          <InfoChip
            darkMode={darkMode}
            icon={<Clock size={13} />}
            text={formatDisplayTime(session.time)}
          />
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${cents > 0
              ? darkMode
                ? "bg-purple-900/40 text-purple-300"
                : "bg-purple-50 text-purple-700"
              : darkMode
                ? "bg-green-900/40 text-green-300"
                : "bg-green-50 text-green-700"
            }`}
        >
          {formatPrice(cents)}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span
            className={`flex items-center gap-1 ${darkMode ? "text-gray-300" : "text-gray-600"
              }`}
          >
            <Users size={13} />
            {enrolledCount}/{capacity || "∞"} enrolled
          </span>

          <div className="flex gap-2 flex-wrap justify-end">
            {enrolled && (
              <StatusBadge darkMode={darkMode} type="booked" text="Booked" />
            )}
            {!enrolled && paid && (
              <StatusBadge darkMode={darkMode} type="paid" text="Paid" />
            )}
            {full && <StatusBadge darkMode={darkMode} type="full" text="Full" />}
          </div>
        </div>

        {capacity > 0 && (
          <div
            className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-200"
              }`}
          >
            <div
              className={`h-full rounded-full ${full ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {enrolled || paid ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/chat/${trainer._id}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors duration-200"
          >
            <MessageCircle size={16} />
            Open Chat
          </motion.button>
        ) : (
          <button
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-600"
              }`}
            disabled
            title="Pay first to unlock chat"
          >
            Chat Locked
          </button>
        )}

        {enrolled ? (
          <button
            disabled
            className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-blue-600 text-white opacity-90"
          >
            Already Booked
          </button>
        ) : paid ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={full}
            onClick={() => bookNow(session)}
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${full
                ? "bg-gray-500 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {full ? "Class Full" : "Book Now"}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={full}
            onClick={() => handleSessionAccess(session)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${full
                ? "bg-gray-500 cursor-not-allowed text-white"
                : cents > 0
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
          >
            <CreditCard size={15} />
            {full ? "Class Full" : cents > 0 ? "Pay First" : "Free Access"}
          </motion.button>
        )}
      </div>
    </div>
  );
};

const Badge = ({ darkMode, text }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
      }`}
  >
    {text}
  </span>
);

const InfoChip = ({ darkMode, icon, text }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${darkMode
        ? "bg-gray-800 text-gray-200"
        : "bg-white text-gray-700 border border-gray-200"
      }`}
  >
    {icon}
    {text}
  </span>
);

const StatusBadge = ({ darkMode, type, text }) => {
  const classes =
    type === "booked"
      ? darkMode
        ? "bg-blue-900/40 text-blue-300"
        : "bg-blue-50 text-blue-700"
      : type === "paid"
        ? darkMode
          ? "bg-green-900/40 text-green-300"
          : "bg-green-50 text-green-700"
        : darkMode
          ? "bg-red-900/40 text-red-300"
          : "bg-red-50 text-red-700";

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${classes}`}>
      {text}
    </span>
  );
};

const SkeletonTrainerCard = ({ darkMode }) => {
  return (
    <div
      className={`rounded-3xl p-6 animate-pulse transition-colors duration-200 ${darkMode
          ? "bg-gray-900 border border-gray-800"
          : "bg-white border border-gray-200"
        }`}
    >
      <div className="flex items-center gap-4 mb-5">
        <div
          className={`w-14 h-14 rounded-2xl ${darkMode ? "bg-gray-800" : "bg-gray-200"
            }`}
        />
        <div className="flex-1">
          <div
            className={`h-4 w-40 rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"
              } mb-2`}
          />
          <div
            className={`h-3 w-24 rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"
              }`}
          />
        </div>
      </div>

      <div
        className={`h-3 w-full rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"
          } mb-2`}
      />
      <div
        className={`h-3 w-5/6 rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"
          } mb-2`}
      />
      <div
        className={`h-3 w-4/6 rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"
          } mb-5`}
      />

      <div className="space-y-3">
        {[...Array(2)].map((_, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4 ${darkMode
                ? "bg-gray-900 border border-gray-800"
                : "bg-gray-50 border border-gray-200"
              }`}
          >
            <div
              className={`h-3 w-2/3 rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"
                } mb-3`}
            />
            <div
              className={`h-2 w-full rounded ${darkMode ? "bg-gray-800" : "bg-gray-200"
                } mb-4`}
            />
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`h-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-200"
                  }`}
              />
              <div
                className={`h-10 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-200"
                  }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserClasses;