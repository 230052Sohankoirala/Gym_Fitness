// src/pages/Auth/VerifyEmail.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

/* ---------- helpers ---------- */
const getSafeJSON = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};
const getSafeUser = () => {
  const raw =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user") ||
    "";
  const obj = getSafeJSON(raw);
  // supports both {email} and {user:{email}}
  return (obj?.email || obj?.user?.email || "").trim();
};

const usePrefilledEmail = () => {
  const location = useLocation();

  // 1) route: /verify-email?email=...
  const queryEmail = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    return (params.get("email") || "").trim();
  }, [location.search]);

  // 2) session/local keys you may set right after register
  const sessionReg = (sessionStorage.getItem("registerEmail") || "").trim();
  const localPending = (localStorage.getItem("pendingEmail") || "").trim();

  // 3) stored user object
  const storedUserEmail = getSafeUser();

  // Priority: route state -> query -> session key -> local key -> stored user
  return (
    (location.state?.email || "").trim() ||
    queryEmail ||
    sessionReg ||
    localPending ||
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
  const [emailLocked, setEmailLocked] = useState(Boolean(prefilledEmail));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // keep email in sync if a better source appears (state/query after mount)
  useEffect(() => {
    if (prefilledEmail && prefilledEmail !== formData.email) {
      setFormData((p) => ({ ...p, email: prefilledEmail }));
      setEmailLocked(true);
    }
  }, [prefilledEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/auth/verify-email",
        { email: formData.email, code: formData.code }
      );

      if (data?.message) setMessage(data.message);

      const ok =
        data?.success === true ||
        data?.verified === true ||
        (typeof data?.message === "string" &&
          data.message.toLowerCase().includes("success"));

      if (ok) {
        if (data?.token) localStorage.setItem("token", data.token);
        if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
        // optional: clear temp email caches after success
        sessionStorage.removeItem("registerEmail");
        localStorage.removeItem("pendingEmail");

        navigate("/userInfo", { replace: true });
        return;
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-300">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-extrabold mb-4 text-center text-indigo-700"
        >
          Verify Your Email
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6 text-center"
        >
          Enter the 6-digit code sent to{" "}
          <b className="text-indigo-700">{formData.email || "your email"}</b>
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Email input */}
          <div className="space-y-1">
            <motion.input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={emailLocked}
              className={`text-black w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                emailLocked ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              whileFocus={{ scale: 1.02 }}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setEmailLocked((v) => !v)}
                className="text-xs text-indigo-600 hover:underline"
              >
                {emailLocked ? "Change email" : "Lock email"}
              </button>
            </div>
          </div>

          {/* Code input */}
          <motion.input
            type="text"
            name="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={formData.code}
            onChange={handleChange}
            required
            className="text-black w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            whileFocus={{ scale: 1.02 }}
          />

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </motion.form>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mt-4 text-center text-sm ${
              String(message).toLowerCase().includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
