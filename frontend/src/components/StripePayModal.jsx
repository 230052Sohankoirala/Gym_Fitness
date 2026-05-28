// src/components/StripePayModal.jsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    CreditCard,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    X,
} from "lucide-react";

/* ================== ENV SETUP ================== */
/**
 * Frontend .env local:
 * VITE_API_BASE_URL=http://localhost:4000
 * VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
 *
 * Frontend .env Render:
 * VITE_API_BASE_URL=https://your-backend-name.onrender.com
 * VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
 */
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const API_BASE = `${API_BASE_URL}/api`;

const PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK ? loadStripe(PK) : null;

function InnerForm({ onPaid, onClose, darkMode, sessionId, token }) {
    const stripe = useStripe();
    const elements = useElements();

    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState("");
    const [loading, setLoading] = useState(false);

    const confirmOnBackend = useCallback(
        async (paymentIntentId) => {
            const res = await axios.post(
                `${API_BASE}/payments/confirm-intent`,
                { paymentIntentId },
                {
                    headers: token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {},
                    withCredentials: true,
                }
            );

            return res.data;
        },
        [token]
    );

    const pay = async () => {
        if (!stripe || !elements || loading) return;

        try {
            setLoading(true);
            setMsg("");
            setMsgType("");

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
                confirmParams: {
                    return_url: `${window.location.origin}/userClasses?paid=1&sessionId=${sessionId}`,
                },
            });

            if (error) {
                setMsg(error.message || "Payment failed.");
                setMsgType("error");
                setLoading(false);
                return;
            }

            if (!paymentIntent?.id) {
                setMsg("Payment completed, but payment confirmation ID is missing.");
                setMsgType("error");
                setLoading(false);
                return;
            }

            if (paymentIntent.status !== "succeeded") {
                setMsg(`Payment status: ${paymentIntent.status}`);
                setMsgType("error");
                setLoading(false);
                return;
            }

            await confirmOnBackend(paymentIntent.id);

            setMsg("Payment successful");
            setMsgType("success");
            setLoading(false);

            setTimeout(() => {
                onPaid?.(paymentIntent.id);
            }, 500);
        } catch (err) {
            setMsg(
                err?.response?.data?.message ||
                err?.message ||
                "Payment failed. Please try again."
            );
            setMsgType("error");
            setLoading(false);
        }
    };

    const panelBg = darkMode
        ? "bg-gray-900 border-gray-700 text-white"
        : "bg-white border-gray-200 text-gray-900";

    const softPanel = darkMode ? "bg-gray-800" : "bg-gray-50";

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            className={`relative w-full max-w-lg rounded-3xl border shadow-2xl flex flex-col transition-colors duration-200 ${panelBg}`}
            style={{ maxHeight: "88vh" }}
        >
            <div className="flex items-start justify-between gap-4 px-5 py-5 border-b border-white/10">
                <div className="flex items-start gap-3">
                    <div
                        className={`p-3 rounded-2xl ${darkMode
                            ? "bg-purple-900/30 text-purple-300"
                            : "bg-purple-50 text-purple-700"
                            }`}
                    >
                        <CreditCard size={20} />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold">Secure Payment</h3>
                        <p
                            className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                        >
                            Pay securely by card to unlock booking and trainer chat.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (!loading) onClose?.();
                    }}
                    className={`p-2 rounded-xl transition-colors duration-200 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                        }`}
                    disabled={loading}
                    aria-label="Close payment modal"
                >
                    <X size={18} />
                </button>
            </div>

            <div
                className="px-5 py-5 overflow-y-auto"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                <div
                    className={`rounded-2xl p-4 mb-4 transition-colors duration-200 ${softPanel}`}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck
                            size={16}
                            className={darkMode ? "text-green-300" : "text-green-600"}
                        />
                        <span className="text-sm font-medium">Protected by Stripe</span>
                    </div>

                    <PaymentElement />
                </div>

                <AnimatePresence>
                    {msg ? (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className={`rounded-2xl px-4 py-3 text-sm flex items-start gap-3 ${msgType === "success"
                                ? darkMode
                                    ? "bg-green-900/30 text-green-300 border border-green-800"
                                    : "bg-green-50 text-green-700 border border-green-200"
                                : darkMode
                                    ? "bg-red-900/30 text-red-300 border border-red-800"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {msgType === "success" ? (
                                <CheckCircle2 size={18} className="mt-0.5" />
                            ) : (
                                <AlertCircle size={18} className="mt-0.5" />
                            )}
                            <span>{msg}</span>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            <div className="px-5 py-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            if (!loading) onClose?.();
                        }}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors duration-200 ${darkMode
                            ? "bg-gray-800 hover:bg-gray-700 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                            }`}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={pay}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60 transition-colors duration-200 inline-flex items-center justify-center gap-2"
                        disabled={loading || !stripe || !elements}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard size={16} />
                                Pay Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default function StripePayModal({
    open,
    sessionId,
    token,
    darkMode,
    onClose,
    onPaid,
}) {
    const [clientSecret, setClientSecret] = useState("");
    const [loadingIntent, setLoadingIntent] = useState(false);
    const [loadError, setLoadError] = useState("");

    const api = useMemo(() => {
        return axios.create({
            baseURL: API_BASE,
            headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {},
            withCredentials: true,
        });
    }, [token]);

    useEffect(() => {
        if (!open || !sessionId || !PK) return;

        setClientSecret("");
        setLoadError("");
        setLoadingIntent(true);

        let cancelled = false;

        (async () => {
            try {
                const res = await api.post("/payments/create-intent", {
                    sessionId,
                });

                if (cancelled) return;

                if (res.data?.free) {
                    onPaid?.();
                    return;
                }

                if (res.data?.clientSecret) {
                    setClientSecret(res.data.clientSecret);
                } else {
                    setLoadError("Could not initialize payment.");
                }
            } catch (err) {
                if (cancelled) return;

                setLoadError(
                    err?.response?.data?.message || "Unable to load payment form."
                );
            } finally {
                if (!cancelled) {
                    setLoadingIntent(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [open, sessionId, api, onPaid]);

    if (!open) return null;

    const panelBg = darkMode
        ? "bg-gray-900 border-gray-700 text-white"
        : "bg-white border-gray-200 text-gray-900";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => {
                        if (!loadingIntent) onClose?.();
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />

                <div className="relative w-full max-w-lg">
                    {!stripePromise ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.97 }}
                            className={`rounded-3xl border p-6 shadow-2xl ${panelBg}`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`p-3 rounded-2xl ${darkMode
                                        ? "bg-red-900/30 text-red-300"
                                        : "bg-red-50 text-red-700"
                                        }`}
                                >
                                    <AlertCircle size={22} />
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold">Payment unavailable</h3>
                                    <p
                                        className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                                            }`}
                                    >
                                        Stripe publishable key is missing. Please check your
                                        environment setup.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ) : loadingIntent ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.97 }}
                            className={`rounded-3xl border p-6 shadow-2xl ${panelBg}`}
                        >
                            <div className="flex flex-col items-center justify-center py-6">
                                <Loader2 size={28} className="animate-spin mb-3" />
                                <p className="font-medium">Loading payment...</p>
                                <p
                                    className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                                        }`}
                                >
                                    Preparing your secure checkout form.
                                </p>
                            </div>
                        </motion.div>
                    ) : loadError ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.97 }}
                            className={`rounded-3xl border p-6 shadow-2xl ${panelBg}`}
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div
                                    className={`p-3 rounded-2xl ${darkMode
                                        ? "bg-red-900/30 text-red-300"
                                        : "bg-red-50 text-red-700"
                                        }`}
                                >
                                    <AlertCircle size={22} />
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Payment could not load
                                    </h3>
                                    <p
                                        className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                                            }`}
                                    >
                                        {loadError}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors duration-200 ${darkMode
                                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                        }`}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    ) : clientSecret ? (
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: darkMode ? "night" : "stripe",
                                },
                            }}
                        >
                            <InnerForm
                                onPaid={onPaid}
                                onClose={onClose}
                                darkMode={darkMode}
                                sessionId={sessionId}
                                token={token}
                            />
                        </Elements>
                    ) : null}
                </div>
            </div>
        </AnimatePresence>
    );
}