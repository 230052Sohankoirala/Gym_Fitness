// src/auth/AdminAuth/AdminLogin.jsx
import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Eye, EyeOff, Mail, Lock, AlertCircle, Settings } from "lucide-react";
import img from "../../assets/Images/loginBG.d2986f65998a8b583e78.png";
import { Link, useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // ✅ import AuthContext

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        setApiError("");
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setApiError("");

        try {
            const res = await axios.post("http://localhost:4000/api/admin/login", formData, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            // ✅ Always persist admins in localStorage
            login(res.data.token, res.data.admin, "admin", true);

            navigate("/adminHome");
        } catch (err) {
            setApiError(err.response?.data?.message || "Login failed");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <Link to="/" className="text-gray-600 hover:text-gray-800">
                    <FaArrowLeft className="w-6 h-6" />
                </Link>
            </div>

            {/* Left Side Illustration */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                <motion.img
                    src={img}
                    alt="Login Visual"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-4/5 h-96 object-cover rounded-3xl shadow-2xl"
                />
            </div>

            {/* Right Side Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white border border-gray-100"
                >
                    <div className="text-center mb-8">
                        <h2 className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-800 mb-2">
                            <Settings size={22} className="text-indigo-600" />
                            Admin
                        </h2>
                        <p className="text-gray-600">
                            <Typewriter
                                words={["BE BEST FOR YOUR CLIENTS", "BE FIT FOR YOURSELF"]}
                                loop={true}
                                cursor
                                cursorStyle="|"
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1000}
                            />
                        </p>
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={`text-black w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.email ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`text-black w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.password ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3.5"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.password}
                                </p>
                            )}
                        </div>

                        {/* API error */}
                        {apiError && (
                            <p className="mt-3 text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" /> {apiError}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogin;
