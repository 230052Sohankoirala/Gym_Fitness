/* eslint-disable no-unused-vars */
// src/pages/auth/UserRegister.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import registerImg from "../../assets/Images/Signup.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

/**
 * Deployment-safe backend URL.
 *
 * Vercel Environment Variable:
 * VITE_API_URL=https://gym-fitness-hgq7.onrender.com
 */
const RAW_API_URL =
  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const API_BASE = RAW_API_URL.replace(/\/+$/, "");

/**
 * Safely decode Google credential token on frontend.
 *
 * This is only used as a fallback to get the email for navigation state.
 * Actual Google security verification still happens in the backend.
 */
const decodeGoogleCredential = (credential = "") => {
  try {
    const payload = credential.split(".")[1];

    if (!payload) {
      return {};
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decodedPayload = JSON.parse(window.atob(normalizedPayload));

    return decodedPayload || {};
  } catch (error) {
    console.error("Google credential decode failed:", error);
    return {};
  }
};

const UserRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  const cachePendingEmail = (email) => {
    const safeEmail = String(email || "").trim().toLowerCase();

    if (!safeEmail) {
      return;
    }

    sessionStorage.setItem("registerEmail", safeEmail);
    localStorage.setItem("pendingEmail", safeEmail);
  };

  const clearPendingEmail = () => {
    sessionStorage.removeItem("registerEmail");
    localStorage.removeItem("pendingEmail");
  };

  const clearAuthStorage = () => {
    [
      "token",
      "user",
      "role",
      "auth_token",
      "auth_user",
      "isAdmin",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  const saveAuthData = (token, user) => {
    if (!token || !user) {
      return;
    }

    clearAuthStorage();

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user?.role || "member");
  };

  const redirectByRole = (user) => {
    const role = user?.role || "member";

    if (role === "admin") {
      navigate("/admin/dashboard", {
        replace: true,
      });
      return;
    }

    if (role === "trainer") {
      navigate("/trainer/dashboard", {
        replace: true,
      });
      return;
    }

    navigate("/home", {
      replace: true,
    });
  };

  const goToVerifyEmail = (email, message = "") => {
    const safeEmail = String(email || "").trim().toLowerCase();

    if (!safeEmail) {
      setServerError(
        message ||
          "Verification is required, but email was missing. Please try again."
      );
      return;
    }

    cachePendingEmail(safeEmail);

    navigate("/verify-email", {
      replace: true,
      state: {
        email: safeEmail,
      },
    });
  };

  const checkRequiresVerification = (data = {}) => {
    const message = data?.message;

    return (
      data?.requiresVerification === true ||
      data?.isNewUser === true ||
      data?.needsVerification === true ||
      data?.verificationRequired === true ||
      (typeof message === "string" &&
        /verify|verification|otp|code/i.test(message))
    );
  };

  const getResponseEmail = (data = {}, fallbackEmail = "") => {
    return String(
      data?.user?.email ||
        data?.email ||
        data?.pendingEmail ||
        fallbackEmail ||
        ""
    )
      .trim()
      .toLowerCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format";
    }

    const passwordError = validatePassword(formData.password);

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles both normal registration and any backend response
   * that says verification is required.
   */
  const handleRegisterResponse = (data, fallbackEmail = "") => {
    const safeEmail = getResponseEmail(data, fallbackEmail);

    const requiresVerification = checkRequiresVerification(data);

    if (requiresVerification) {
      goToVerifyEmail(safeEmail);
      return;
    }

    if (data?.token && data?.user) {
      saveAuthData(data.token, data.user);

      clearPendingEmail();

      redirectByRole(data.user);

      return;
    }

    setServerError("Register worked, but backend response was incomplete.");
  };

  /**
   * Normal email/password signup.
   *
   * Expected backend response:
   * {
   *   success: true,
   *   requiresVerification: true,
   *   email: "user@email.com",
   *   redirectTo: "/verify-email"
   * }
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      const safeEmail = formData.email.trim().toLowerCase();

      const { data } = await axios.post(
        `${API_BASE}/api/auth/register`,
        {
          fullname: formData.fullname.trim(),
          username: formData.username.trim(),
          email: safeEmail,
          password: formData.password,
        },
        {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("REGISTER RESPONSE:", data);

      handleRegisterResponse(data, safeEmail);
    } catch (err) {
      console.error("REGISTER ERROR FULL:", err);
      console.error("REGISTER ERROR RESPONSE:", err?.response?.data);

      const data = err?.response?.data || {};
      const msg = data?.message;
      const safeEmail = getResponseEmail(data, formData.email);

      const requiresVerification = checkRequiresVerification(data);

      if (requiresVerification) {
        goToVerifyEmail(safeEmail);
        return;
      }

      if (err.code === "ECONNABORTED") {
        setServerError(
          "Registration took too long. Backend may still be sending the verification email."
        );
        return;
      }

      if (msg === "User already exists" || msg === "User already exists.") {
        setServerError("This email is already registered. Please log in instead.");
      } else {
        setServerError(msg || "Something went wrong. Try again!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Google signup/login.
   *
   * New Google account:
   * - Backend creates user
   * - Backend sends verification code
   * - Frontend redirects to /verify-email
   *
   * Existing verified Google account:
   * - Backend returns token and user
   * - Frontend redirects to /userInfo or backend redirectTo
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    if (isGoogleSubmitting) {
      return;
    }

    setIsGoogleSubmitting(true);
    setServerError("");

    const googleCredential = credentialResponse?.credential;
    const decodedGoogleUser = decodeGoogleCredential(googleCredential);
    const googleEmailFallback = String(decodedGoogleUser?.email || "")
      .trim()
      .toLowerCase();

    try {
      if (!googleCredential) {
        setServerError("Google signup failed. No credential received.");
        return;
      }

      const { data } = await axios.post(
        `${API_BASE}/api/auth/google`,
        {
          token: googleCredential,
        },
        {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GOOGLE SIGNUP RESPONSE:", data);

      const safeEmail = getResponseEmail(data, googleEmailFallback);

      const requiresVerification = checkRequiresVerification(data);

      if (requiresVerification) {
        goToVerifyEmail(safeEmail);
        return;
      }

      if (data?.token && data?.user) {
        saveAuthData(data.token, data.user);

        clearPendingEmail();

        navigate(data?.redirectTo || "/userInfo", {
          replace: true,
        });

        return;
      }

      setServerError("Google signup response was incomplete. Please try again.");
    } catch (err) {
      console.error("GOOGLE SIGNUP ERROR FULL:", err);
      console.error("GOOGLE SIGNUP ERROR RESPONSE:", err?.response?.data);

      const data = err?.response?.data || {};
      const msg = data?.message;
      const safeEmail = getResponseEmail(data, googleEmailFallback);

      const requiresVerification = checkRequiresVerification(data);

      if (requiresVerification) {
        goToVerifyEmail(safeEmail);
        return;
      }

      if (err.code === "ECONNABORTED") {
        setServerError(
          "Google signup took too long. Backend may still be sending the verification email."
        );
        return;
      }

      setServerError(msg || "Google signup failed. Try again.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setServerError("Google signup failed. Please try again.");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <motion.img
          src={registerImg}
          alt="Register Visual"
          initial={{
            scale: 0.9,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
          }}
          className="w-4/5 h-auto object-cover rounded-3xl shadow-2xl"
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white border border-gray-100"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h2>

            <p className="text-gray-600">
              <Typewriter
                words={[
                  "Unlock the Power of Fitness",
                  "Join Our Community Today",
                  "Track Your Progress Easily",
                ]}
                loop
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </p>
          </div>

          {serverError && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />

              <p className="text-sm text-red-700">{serverError}</p>
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                autoComplete="name"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
              />

              {errors.fullname && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.fullname}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
              />

              {errors.username && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
                />
              </div>

              {errors.email && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3.5"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}

              {!errors.password && formData.password && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-3.5"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>

            <span className="mx-4 text-gray-500">or</span>

            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="mt-4 flex justify-center">
            {isGoogleSubmitting ? (
              <div className="text-sm text-gray-600">
                Processing Google signup...
              </div>
            ) : (
              <GoogleLogin
                theme="filled_blue"
                size="large"
                shape="pill"
                width="280"
                useOneTap={false}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/memberLogin"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserRegister;