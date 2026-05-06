import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const TrainerStripeRefresh = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    return (
        <div
            className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
                }`}
        >
            <div
                className={`w-full max-w-lg rounded-3xl p-8 text-center ${darkMode
                        ? "bg-gray-900 border border-gray-800"
                        : "bg-white border border-gray-200"
                    }`}
            >
                <h1 className="text-2xl font-semibold mb-3">Stripe setup expired</h1>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    Your Stripe onboarding link expired or was interrupted. Please try again.
                </p>

                <button
                    onClick={() => navigate("/trainerHome")}
                    className="mt-6 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default TrainerStripeRefresh;