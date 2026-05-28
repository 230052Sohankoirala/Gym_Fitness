import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { MailCheck, ShieldCheck, BadgeAlert } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";
/* ---------- helpers ---------- */
const getSafeJSON = (raw) => {
  try {
    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const getSafeUserEmail = () => {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user") || "";

  const obj = getSafeJSON(raw);

  return (obj?.email || obj?.user?.email || "").trim();
};

const usePrefilledEmail = () => {
  const location = useLocation();

  const queryEmail = useMemo(() => {
    const params = new URLSearchParams(location.search || "");

    return (params.get("email") || "").trim();
  }, [location.search]);

  const routeStateEmail = (location.state?.email || "").trim();
  const registerEmail = (sessionStorage.getItem("registerEmail") || "").trim();
  const pendingEmail = (localStorage.getItem("pendingEmail") || "").trim();
  const storedUserEmail = getSafeUserEmail();

  return (
    routeStateEmail ||
    queryEmail ||
    registerEmail ||
    pendingEmail ||
    storedUserEmail ||
    ""
  );
};

/* ---------- component ---------- */
const VerifyEmail = () => {
  const navigate = useNavigate();
  const prefilledEmail = usePrefilledEmail();

  const [formData, setFormData] = useState({
    email: prefilledEmail,
    code: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefilledEmail) {
      setFormData((prev) => ({
        ...prev,
        email: prefilledEmail,
      }));
    }
  }, [prefilledEmail]);

  const displayEmail = (formData.email || prefilledEmail || "").trim();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setMessageType("");

    const emailToVerify = (formData.email || prefilledEmail || "").trim();

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/verify-email`, {
        email: emailToVerify,
        code: formData.code.trim(),
      });

      if (data?.message) {
        setMessage(data.message);
      }

      const verified =
        data?.success === true ||
        data?.verified === true ||
        (typeof data?.message === "string" && /success|verified/i.test(data.message));

      if (verified) {
        setMessageType("success");

        if (data?.token) {
          localStorage.setItem("token", data.token);
        }

        if (data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        sessionStorage.removeItem("registerEmail");
        localStorage.removeItem("pendingEmail");

        setTimeout(() => {
          navigate("/userInfo", { replace: true });
        }, 1200);
      } else {
        setMessageType("error");
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Verification failed. Try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-200 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden border border-white/60">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-8 py-8 text-white text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="w-14 h-14 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center shadow-lg"
            >
              <MailCheck className="w-8 h-8" />
            </motion.div>

            <h2 className="text-3xl font-extrabold tracking-tight">
              Verify Email
            </h2>
          </div>

          <div className="px-8 py-8">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-100">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <MailCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-100 text-gray-700 cursor-not-allowed outline-none shadow-sm"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  This email cannot be edited on this screen.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>

                <input
                  type="text"
                  name="code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 text-black text-center tracking-[0.35em] text-lg font-semibold outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Verifying..." : "Verify My Email"}
              </motion.button>
            </motion.form>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`mt-5 rounded-2xl px-4 py-3 flex items-start gap-3 border ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {messageType === "success" ? (
                  <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
                ) : (
                  <BadgeAlert className="w-5 h-5 mt-0.5 shrink-0" />
                )}

                <p className="text-sm font-medium">{message}</p>
              </motion.div>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                Please check your inbox and spam folder for the verification code.
              </p>

              {displayEmail && (
                <p className="mt-2 text-sm text-indigo-700 font-semibold break-all">
                  {displayEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;