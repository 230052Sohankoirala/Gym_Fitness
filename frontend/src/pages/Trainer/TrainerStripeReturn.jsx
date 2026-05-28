import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const API_ROOT = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_BASE = `${API_ROOT}/api`;

const TrainerStripeReturn = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    const token = useMemo(() => {
        return (
            localStorage.getItem("trainerToken") ||
            sessionStorage.getItem("trainerToken") ||
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    }, []);

    const api = useMemo(() => {
        return axios.create({
            baseURL: API_BASE,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
        });
    }, [token]);

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                setLoading(true);

                const { data } = await api.get("/trainers/stripe/return");

                setResult(data);
                setMessage(data?.message || "");
            } catch (err) {
                console.error("Stripe return verification failed:", err);

                setMessage(
                    err?.response?.data?.message ||
                    "Failed to verify Stripe onboarding."
                );
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [api]);

    return (
        <div
            className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
                }`}
        >
            <div
                className={`w-full max-w-lg rounded-3xl p-8 ${darkMode
                        ? "bg-gray-900 border border-gray-800"
                        : "bg-white border border-gray-200"
                    }`}
            >
                {loading ? (
                    <div className="text-center">
                        <RefreshCw size={28} className="mx-auto mb-4 animate-spin" />

                        <h1 className="text-2xl font-semibold mb-2">
                            Checking Stripe status...
                        </h1>

                        <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                            Please wait while we verify your account setup.
                        </p>
                    </div>
                ) : result?.onboarded ? (
                    <div className="text-center">
                        <CheckCircle2 size={36} className="mx-auto mb-4 text-green-500" />

                        <h1 className="text-2xl font-semibold mb-2">Stripe connected</h1>

                        <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                            {message || "Your Stripe onboarding is complete."}
                        </p>

                        <button
                            onClick={() => navigate("/trainerHome")}
                            className="mt-6 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <AlertCircle size={36} className="mx-auto mb-4 text-red-500" />

                        <h1 className="text-2xl font-semibold mb-2">Setup incomplete</h1>

                        <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                            {message || "Stripe onboarding is not complete yet."}
                        </p>

                        <button
                            onClick={() => navigate("/trainerHome")}
                            className="mt-6 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerStripeReturn;