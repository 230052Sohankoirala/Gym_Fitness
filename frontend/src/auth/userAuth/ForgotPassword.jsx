import React, { useState } from "react";
import { Mail, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const API_BASE = import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

    const clearStatus = () => {
        setError("");
        setMessage("");
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        clearStatus();

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to send reset code.");
                return;
            }

            setMessage(data.message || "Reset code sent successfully.");
            setStep(2);
        } catch {
            setError("Server error while sending reset code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        clearStatus();

        if (!code.trim()) {
            setError("Please enter the verification code.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/verify-reset-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid verification code.");
                return;
            }

            setMessage(data.message || "Code verified successfully.");
            setStep(3);
        } catch {
            setError("Server error while verifying code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearStatus();

        if (!newPassword || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    code,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to reset password.");
                return;
            }

            setMessage(data.message || "Password reset successful.");
            setStep(4);
        } catch {
            setError("Server error while resetting password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Forgot Password</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Reset your password through email verification
                    </p>
                </div>

                {message && (
                    <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-3 text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-xl px-3">
                                <Mail className="w-5 h-5 text-gray-800" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-3 outline-none rounded-xl text-gray-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition duration-200"
                        >
                            {loading ? "Sending Code..." : "Send Verification Code"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">
                                Verification Code
                            </label>
                            <div className="flex items-center border border-gray800 rounded-xl px-3">
                                <ShieldCheck className="w-5 h-5 text-gray-800" />
                                <input
                                    type="text"
                                    placeholder="Enter code from Gmail"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full px-3 py-3 outline-none rounded-xl text-gray-800"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition duration-200"
                        >
                            {loading ? "Verifying..." : "Verify Code"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-xl px-3">
                                <Lock className="w-5 h-5 text-gray-400" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-3 outline-none rounded-xl text-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="text-gray-500"
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-xl px-3">
                                <Lock className="w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-3 outline-none rounded-xl text-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="text-gray-500"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition duration-200"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                {step === 4 && (
                    <div className="text-center">
                        <div className="text-green-600 text-lg font-semibold mb-3">
                            Password changed successfully
                        </div>
                        <p className="text-gray-500 text-sm">
                            You can now go back and log in with your new password.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;