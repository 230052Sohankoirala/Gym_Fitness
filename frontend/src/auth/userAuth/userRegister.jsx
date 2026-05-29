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
 * In Vercel Environment Variables:
 * VITE_API_URL=https://gym-fitness-hgq7.onrender.com
 */
const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "https://gym-fitness-hgq7.onrender.com";

const API_BASE = RAW_API_URL.replace(/\/+$/, "");

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

  /**
   * Saves email temporarily so VerifyEmail.jsx can still access it
   * even if page refreshes.
   */
  const cachePendingEmail = (email) => {
    const safeEmail = String(email || "").trim();

    if (!safeEmail) {
      return;
    }

    sessionStorage.setItem("registerEmail", safeEmail);
    localStorage.setItem("pendingEmail", safeEmail);
  };

  /**
   * Clears pending verification email after successful login/verification.
   */
  const clearPendingEmail = () => {
    sessionStorage.removeItem("registerEmail");
    localStorage.removeItem("pendingEmail");
  };

  /**
   * Handles form input changes.
   */
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

  /**
   * Validates password.
   */
  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  /**
   * Validates full registration form.
   */
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
   * Redirects user based on role after successful token login.
   */
  const redirectByRole = (user) => {
    const role = user?.role || "member";

    if (role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (role === "trainer") {
      navigate("/trainer/dashboard");
      return;
    }

    navigate("/home");
  };

  /**
   * Checks backend response and decides where to send user.
   *
   * Your backend register controller returns:
   * requiresVerification: true
   * email: user.email
   *
   * Your uploaded register page already uses this style of checking and navigating
   * to /verify-email when verification is needed. :contentReference[oaicite:0]{index=0}
   */
  const handleRegisterResponse = (data, fallbackEmail = "") => {
    const safeEmail = String(
      data?.user?.email ||
        data?.email ||
        fallbackEmail ||
        ""
    ).trim();

    const requiresVerification =
      data?.requiresVerification === true ||
      data?.isNewUser === true ||
      data?.needsVerification === true ||
      data?.verificationRequired === true ||
      (typeof data?.message === "string" &&
        /verify|verification|otp|code/i.test(data.message));

    if (requiresVerification) {
      cachePendingEmail(safeEmail);

      navigate("/verify-email", {
        state: {
          email: safeEmail,
        },
      });

      return;
    }

    if (data?.token && data?.user) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      clearPendingEmail();

      redirectByRole(data.user);

      return;
    }

    navigate("/memberLogin");
  };

  /**
   * Normal email/password signup.
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

      handleRegisterResponse(data, safeEmail);
    } catch (err) {
      console.error("Register error:", err);

      if (err.code === "ECONNABORTED") {
        setServerError("Registration took too long. Please try again.");
        return;
      }

      const data = err?.response?.data;
      const msg = data?.message;
      const safeEmail = data?.email || formData.email.trim().toLowerCase();

      const requiresVerification =
        data?.requiresVerification === true ||
        data?.isNewUser === true ||
        data?.needsVerification === true ||
        data?.verificationRequired === true ||
        (typeof msg === "string" &&
          /verify|verification|otp|code/i.test(msg));

      if (requiresVerification) {
        cachePendingEmail(safeEmail);

        navigate("/verify-email", {
          state: {
            email: safeEmail,
          },
        });

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
   * Your backend currently marks Google users as verified automatically.
   * So Google users usually go to /home instead of /verify-email.
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    if (isGoogleSubmitting) {
      return;
    }

    setIsGoogleSubmitting(true);
    setServerError("");

    try {
      const googleCredential = credentialResponse?.credential;

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

      const safeEmail = String(
        data?.user?.email ||
          data?.email ||
          ""
      ).trim();

      const requiresVerification =
        data?.requiresVerification === true ||
        data?.isNewUser === true ||
        data?.needsVerification === true ||
        data?.verificationRequired === true ||
        (typeof data?.message === "string" &&
          /verify|verification|otp|code/i.test(data.message));

      if (requiresVerification) {
        cachePendingEmail(safeEmail);

        navigate("/verify-email", {
          state: {
            email: safeEmail,
          },
        });

        return;
      }

      if (data?.token && data?.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        clearPendingEmail();

        redirectByRole(data.user);

        return;
      }

      setServerError("Google signup response was incomplete. Please try normal signup.");
    } catch (err) {
      console.error("Google signup error:", err);

      if (err.code === "ECONNABORTED") {
        setServerError("Google signup took too long. Please try again.");
        return;
      }

      const data = err?.response?.data;
      const msg = data?.message;
      const safeEmail = data?.email || "";

      const requiresVerification =
        data?.requiresVerification === true ||
        data?.isNewUser === true ||
        data?.needsVerification === true ||
        data?.verificationRequired === true ||
        (typeof msg === "string" &&
          /verify|verification|otp|code/i.test(msg));

      if (requiresVerification) {
        cachePendingEmail(safeEmail);

        navigate("/verify-email", {
          state: {
            email: safeEmail,
          },
        });

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