import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import registerImg from "../../assets/Images/Signup.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const UserRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate input
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = "Full name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password required";
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register user
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setServerError("");

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/auth/register",
        {
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );

      const requiresVerification =
        data?.requiresVerification === true ||
        data?.isNewUser === true ||
        (typeof data?.message === "string" &&
          /verify/i.test(data.message));

      if (requiresVerification) {
        navigate("/verify-email", { state: { email: formData.email } });
        return;
      }

      if (data?.token && data?.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
        return;
      }

      navigate("/memberLogin");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === "User already exists") {
        setServerError("This email is already registered. Please log in instead.");
      } else {
        setServerError(msg || "Something went wrong. Try again!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google login/signup
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post("http://localhost:4000/api/auth/google", {
        token: credentialResponse.credential,
      });

      // If verification required → go to verify page
      if (data?.requiresVerification) {
        const email =
          data?.user?.email || data?.email || "";
        navigate("/verify-email", { state: { email } });
        return;
      }

      // Otherwise, store and go home
      if (data?.token && data?.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
      } else {
        navigate("/memberLogin");
      }
    } catch (err) {
      console.error("Google signup error:", err);
      const msg = err.response?.data?.message;
      setServerError(msg || "Google signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      {/* Left side image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <motion.img
          src={registerImg}
          alt="Register Visual"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-4/5 h-auto object-cover rounded-3xl shadow-2xl"
        />
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white border border-gray-100"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{serverError}</p>
            </motion.div>
          )}

          {/* Register form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
              />
              {errors.fullname && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.fullname}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
              />
              {errors.username && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
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
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
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
                  className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
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
                  className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Signup */}
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              theme="filled_blue"
              size="large"
              shape="pill"
              width="280"
              onSuccess={handleGoogleSuccess}
              onError={() => setServerError("Google signup failed")}
            />
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
