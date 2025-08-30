import React, { useState } from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import register from "../../assets/Images/Signup.jpg";
import { Link, useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import { FaGoogle } from "react-icons/fa";

const UserRegister = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    // ✅ handle input change
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
    };

    // ✅ validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullname) newErrors.fullname = "Full name is required";
        if (!formData.username) newErrors.username = "Username is required";

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm Password is required";
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ submit handler
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            setTimeout(() => {
                console.log("Register data:", formData);
                setIsSubmitting(false);

                // ✅ Navigate only after success
                navigate("/userInfo");
            }, 1500);
        }
    };

    // ✅ Google Sign-in placeholder
    const handleGoogleSignIn = () => {
        console.log("Google Sign-In clicked");
        // later integrate Firebase / backend Google OAuth here
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
            {/* Left Side Image */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                <div className="relative w-full max-w-2xl">
                    <motion.img
                        src={register}
                        alt="Register Visual"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-4/5 h-auto object-cover rounded-3xl shadow-2xl "
                    />
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-sm animate-bounce delay-500"
                    >
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">🔒 Secure Access</h3>
                        <p className="text-gray-600">
                            Your data is protected with industry-standard encryption protocols.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white border border-gray-100"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4"
                        >
                            <div className="text-2xl">👋</div>
                        </motion.div>
                        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-gray-800 mb-2">
                            Create Account
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-gray-600">
                            <Typewriter
                                words={[
                                    "Unlock the Power of Fitness",
                                    "Join Our Community Today",
                                    "Track Your Progress Easily",
                                ]}
                                loop={true}
                                cursor
                                cursorStyle="|"
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1000}
                            />
                        </motion.p>
                    </div>

                    {/* FORM */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Fullname */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                className={`text-black w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.fullname ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Enter your full name"
                            />
                            {errors.fullname && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.fullname}
                                </p>
                            )}
                        </motion.div>

                        {/* Username */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`text-black w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.username ? "border-red-500" : "border-gray-300"
                                    }`}
                                placeholder="Choose a username"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.username}
                                </p>
                            )}
                        </motion.div>

                        {/* Email */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`text-black w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.email}
                                </p>
                            )}
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`text-black w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.password ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.password}
                                </p>
                            )}
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`text-black w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                        }`}
                                    placeholder="Re-enter password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.confirmPassword}
                                </p>
                            )}
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
                            {isSubmitting ? "Signing up..." : "Sign Up"}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <motion.div variants={itemVariants} className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-500">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </motion.div>

                    {/* Google Login */}
                    <motion.div variants={itemVariants} className="text-center">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoogleSignIn}
                            className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                            Sign up with Google
                        </motion.button>
                    </motion.div>

                    {/* Footer */}
                    <motion.div variants={itemVariants} className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Login
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserRegister;