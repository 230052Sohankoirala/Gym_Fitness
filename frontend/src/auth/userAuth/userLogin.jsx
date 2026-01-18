import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import loginImg from "../../assets/Images/loginBG.d2986f65998a8b583e78.png";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // ✅ import AuthContext

const UserLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ get login from AuthContext

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }
      );

      // ✅ Save via AuthContext with role "member"
      login(data.token, data.user, "member", formData.rememberMe);

      // ✅ Navigate home
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg?.toLowerCase().includes("verify")) {
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        setServerError(msg || "Login failed. Try again!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.3, staggerChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      {/* Back Button for Mobile */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate(-1)}
        className="lg:hidden absolute top-6 left-6 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 z-10"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </motion.button>

      {/* Left Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="relative w-full max-w-2xl">
          <motion.img
            src={loginImg}
            alt="Login Visual"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-4/5 h-96 object-cover rounded-3xl shadow-2xl"
          />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              🔒 Secure Access
            </h3>
            <p className="text-gray-600">
              Your data is protected with industry-standard encryption.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white border border-gray-100 relative overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-gray-800 mb-2"
            >
              Welcome Back
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600">
              Sign in to continue your fitness journey
            </motion.p>
          </div>

          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-center"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{serverError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Email */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-black"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-600 mt-1 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-black"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-600 mt-1 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Remember Me */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between text-sm"
            >
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">
              or continue with
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google Login */}
          <div className="mt-4 flex justify-center ">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const { data } = await axios.post(
                    "http://localhost:4000/api/auth/google",
                    { token: credentialResponse.credential }
                  );

                  // ✅ Save via AuthContext with role "member"
                  login(data.token, data.user, "member", true);

                  if (data.isNewUser) navigate("/userInfo");
                  else navigate("/home");
                } catch {
                  setServerError("Google login failed. Try again.");
                }
              }}
              onError={() => setServerError("Google login failed")}
              theme="filled_blue"
              size="large"
              shape="pill"
              width="280"
              
            />
          </div>

          <motion.p variants={itemVariants} className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Register
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserLogin;
