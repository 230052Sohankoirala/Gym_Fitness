import React, { useState } from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { Eye, EyeOff, Mail, Lock, AlertCircle, Settings } from "lucide-react";
import login from "../../assets/Images/loginBG.d2986f65998a8b583e78.png";
import { Link, useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import { FaArrowLeft } from "react-icons/fa";


const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // clear field error while typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        // simulate API
        setTimeout(() => {
            console.log("Login data:", formData);
            setIsSubmitting(false);

            // navigate after success
            navigate("/admin");
        }, 1500);
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

    const inputVariants = {
        focus: {
            scale: 1.02,
            boxShadow: "0 5px 15px rgba(99, 102, 241, 0.2)",
            transition: { duration: 0.2 },
        },
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <Link to="/" className="text-gray-600 hover:text-gray-800">
                    <FaArrowLeft className="w-6 h-6" />
                </Link>
            </div>

            {/* Left - Illustration */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                <div className="relative w-full max-w-2xl">
                    <motion.img
                        src={login}
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
                        className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-sm  animate-bounce  duration-300"
                    >
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            🔒 Secure Access
                        </h3>
                        <p className="text-gray-600">
                            Your data is protected with industry-standard encryption protocols.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white border border-gray-100"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                       
                        <motion.h2
                            variants={itemVariants}
                            className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-800 mb-2"
                        >
                            <Settings size={22} className="text-indigo-600" />
                            Admin
                        </motion.h2>

                        <motion.p variants={itemVariants} className="text-gray-600">
                            <Typewriter
                                words={["BE BEST FOR YOUR CLIENTS", "BE FIT FOR YOURSELF"]}
                                loop={true}
                                cursor
                                cursorStyle="|"
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1000}
                            />
                        </motion.p>
                    </div>

                    {/* Form */}
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        {/* Email */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <motion.input
                                    whileFocus="focus"
                                    variants={inputVariants}
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
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <motion.input
                                    whileFocus="focus"
                                    variants={inputVariants}
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
                        </motion.div>

                        {/* Remember + Forgot */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center justify-between text-sm"
                        >
                            <label className="flex items-center text-gray-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot password?
                            </Link>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3.5 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4..."
                                        />
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                "Sign in"
                            )}
                        </motion.button>



                    </form>



                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogin;