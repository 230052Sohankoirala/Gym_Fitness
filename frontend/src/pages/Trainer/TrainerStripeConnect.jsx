import { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
    CreditCard,
    CheckCircle2,
    RefreshCw,
    UserCircle2,
    BriefcaseBusiness,
    Landmark,
    ShieldCheck,
    CircleDollarSign,
    Globe2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API_ROOT = import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com"
const API_BASE = `${API_ROOT}/api`;

const TrainerStripeConnect = () => {
    const { darkMode } = useTheme();

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
    const [connecting, setConnecting] = useState(false);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [showSteps, setShowSteps] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState("US");

    const [status, setStatus] = useState({
        connected: false,
        onboarded: false,
        stripeAccountId: null,
        stripeCountry: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
    });

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            const { data } = await api.get("/trainers/stripe/status");

            const safeStatus = {
                connected: Boolean(data?.connected),
                onboarded: Boolean(data?.onboarded),
                stripeAccountId: data?.stripeAccountId || null,
                stripeCountry: data?.stripeCountry || null,
                detailsSubmitted: Boolean(data?.detailsSubmitted),
                chargesEnabled: Boolean(data?.chargesEnabled),
                payoutsEnabled: Boolean(data?.payoutsEnabled),
            };

            setStatus(safeStatus);

            if (safeStatus?.stripeCountry) {
                setCountry(safeStatus.stripeCountry);
            }
        } catch (err) {
            console.error("Stripe status error:", err);

            setErrorMessage(
                err?.response?.data?.message || "Failed to load Stripe status."
            );
        } finally {
            setLoading(false);
        }
    }, [api]);

    const fetchCountries = useCallback(async () => {
        try {
            setLoadingCountries(true);

            const { data } = await api.get("/trainers/stripe/countries");

            const safeCountries = Array.isArray(data?.countries)
                ? data.countries
                : [];

            setCountries(safeCountries);

            if (safeCountries.length > 0) {
                setCountry((prev) => {
                    if (prev && safeCountries.some((item) => item.code === prev)) {
                        return prev;
                    }

                    return safeCountries[0].code;
                });
            }
        } catch (err) {
            console.error("Stripe countries error:", err);

            setErrorMessage(
                err?.response?.data?.message || "Failed to load supported countries."
            );
        } finally {
            setLoadingCountries(false);
        }
    }, [api]);

    useEffect(() => {
        fetchStatus();
        fetchCountries();
    }, [fetchStatus, fetchCountries]);

    const handleConnect = async () => {
        try {
            setConnecting(true);
            setShowSteps(true);
            setErrorMessage("");
            setSuccessMessage("");

            const payload = {
                country,
            };

            const { data } = await api.post("/trainers/stripe/connect", payload);

            if (data?.url) {
                window.location.href = data.url;
                return;
            }

            setSuccessMessage("Stripe onboarding link created.");
        } catch (err) {
            console.error("Stripe connect error:", err);

            setErrorMessage(
                err?.response?.data?.message || "Failed to start Stripe onboarding."
            );
        } finally {
            setConnecting(false);
        }
    };

    const pageCard = darkMode
        ? "bg-gray-900 border border-gray-800 text-white"
        : "bg-white border border-gray-200 text-gray-900";

    const mutedText = darkMode ? "text-gray-300" : "text-gray-600";

    const subCard = darkMode
        ? "bg-gray-950 border border-gray-800"
        : "bg-gray-50 border border-gray-200";

    const stepNumberStyle = darkMode
        ? "bg-blue-900/40 text-blue-300 border border-blue-800"
        : "bg-blue-50 text-blue-700 border border-blue-200";

    const statusCard = darkMode
        ? "bg-gray-950 border border-gray-800"
        : "bg-gray-50 border border-gray-200";

    const selectClass = darkMode
        ? "w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
        : "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500";

    const stripeSteps = [
        {
            id: 1,
            icon: <Globe2 size={20} />,
            title: "Choose your country",
            description:
                "Before the Stripe account is created, select the country where you want to onboard. This country is used when creating the connected Stripe account and should stay fixed after account creation.",
        },
        {
            id: 2,
            icon: <UserCircle2 size={20} />,
            title: "Verify your personal details",
            description:
                "After clicking Connect Stripe, you are redirected to Stripe onboarding. Stripe asks for your legal first name, legal last name, email address, date of birth, home address, phone number, and identity details.",
        },
        {
            id: 3,
            icon: <BriefcaseBusiness size={20} />,
            title: "Enter business details",
            description:
                "Stripe may ask for business information such as your industry, website, or the type of services you provide. This helps Stripe understand your payout setup and payment activity.",
        },
        {
            id: 4,
            icon: <Landmark size={20} />,
            title: "Select bank account for payouts",
            description:
                "Stripe then asks where your earnings should be sent. At this stage, you choose or add a bank account so trainer payouts can be transferred securely.",
        },
        {
            id: 5,
            icon: <CircleDollarSign size={20} />,
            title: "Optionally save account with Link",
            description:
                "Stripe may show a Link popup that allows you to save your account information for faster setup in the future. The trainer can either continue with Link or finish without saving.",
        },
        {
            id: 6,
            icon: <ShieldCheck size={20} />,
            title: "Submit tax or identity verification",
            description:
                "Stripe may ask for tax-related or identity verification details depending on the selected country. This is required for compliance, identity verification, and payout activation.",
        },
        {
            id: 7,
            icon: <CheckCircle2 size={20} />,
            title: "Return to FitTrack and verify status",
            description:
                "Once all onboarding steps are completed, Stripe redirects the trainer back to the FitTrack application. The system then checks whether onboarding is complete and whether payouts are enabled.",
        },
    ];

    return (
        <div className={`rounded-2xl p-6 ${pageCard}`}>
            <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
                <div className="w-full">
                    <h2 className="text-2xl font-semibold mb-2">Stripe Payout Setup</h2>

                    <p className={`text-sm ${mutedText}`}>
                        Connect your Stripe account so members can pay for your sessions and
                        you can receive payouts securely.
                    </p>
                </div>

                <button
                    onClick={fetchStatus}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${darkMode
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {errorMessage && (
                <div
                    className={`mt-6 rounded-2xl p-4 border text-sm ${darkMode
                            ? "bg-red-900/20 border-red-800 text-red-200"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                >
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div
                    className={`mt-6 rounded-2xl p-4 border text-sm ${darkMode
                            ? "bg-green-900/20 border-green-800 text-green-200"
                            : "bg-green-50 border-green-200 text-green-700"
                        }`}
                >
                    {successMessage}
                </div>
            )}

            <div className={`mt-6 rounded-2xl p-5 ${subCard}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Globe2 size={18} />
                    <h3 className="text-lg font-semibold">Trainer Country</h3>
                </div>

                <p className={`text-sm mb-4 ${mutedText}`}>
                    Select the country for this trainer’s Stripe onboarding before
                    creating the account. After the Stripe account is created, the country
                    stays locked.
                </p>

                {loadingCountries ? (
                    <p className={mutedText}>Loading supported countries...</p>
                ) : (
                    <div className="space-y-3">
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={selectClass}
                            disabled={status.connected}
                        >
                            {countries.length > 0 ? (
                                countries.map((item) => (
                                    <option key={item.code} value={item.code}>
                                        {item.label}
                                    </option>
                                ))
                            ) : (
                                <option value="">No countries available</option>
                            )}
                        </select>

                        {status.connected ? (
                            <p className={`text-xs ${mutedText}`}>
                                Country is locked because the Stripe connected account already
                                exists.
                            </p>
                        ) : (
                            <p className={`text-xs ${mutedText}`}>
                                Choose the correct country before clicking Connect Stripe.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className={`mt-6 rounded-2xl p-5 ${statusCard}`}>
                <h3 className="text-lg font-semibold mb-4">Current Stripe Status</h3>

                {loading ? (
                    <p className={mutedText}>Checking Stripe status...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className={`rounded-xl p-3 ${subCard}`}>
                            <span className={mutedText}>Connected:</span>{" "}
                            <span className="font-medium">
                                {status.connected ? "Yes" : "No"}
                            </span>
                        </div>

                        <div className={`rounded-xl p-3 ${subCard}`}>
                            <span className={mutedText}>Onboarded:</span>{" "}
                            <span className="font-medium">
                                {status.onboarded ? "Yes" : "No"}
                            </span>
                        </div>

                        <div className={`rounded-xl p-3 ${subCard}`}>
                            <span className={mutedText}>Stripe Country:</span>{" "}
                            <span className="font-medium">
                                {status.stripeCountry || country || "-"}
                            </span>
                        </div>

                        <div className={`rounded-xl p-3 ${subCard}`}>
                            <span className={mutedText}>Details Submitted:</span>{" "}
                            <span className="font-medium">
                                {status.detailsSubmitted ? "Yes" : "No"}
                            </span>
                        </div>

                        <div className={`rounded-xl p-3 ${subCard}`}>
                            <span className={mutedText}>Charges Enabled:</span>{" "}
                            <span className="font-medium">
                                {status.chargesEnabled ? "Yes" : "No"}
                            </span>
                        </div>

                        <div className={`rounded-xl p-3 ${subCard}`}>
                            <span className={mutedText}>Payouts Enabled:</span>{" "}
                            <span className="font-medium">
                                {status.payoutsEnabled ? "Yes" : "No"}
                            </span>
                        </div>

                        <div
                            className={`rounded-xl p-3 ${subCard} sm:col-span-2 break-all`}
                        >
                            <span className={mutedText}>Stripe Account ID:</span>{" "}
                            <span className="font-medium">
                                {status.stripeAccountId || "Not created yet"}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                {status.onboarded ? (
                    <div
                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl ${darkMode
                                ? "bg-green-900/20 text-green-300 border border-green-800"
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                    >
                        <CheckCircle2 size={18} />
                        Stripe account connected successfully
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={
                            connecting || loadingCountries || !country || countries.length === 0
                        }
                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors ${connecting
                                ? "bg-blue-400 text-white cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                    >
                        <CreditCard size={18} />
                        {connecting ? "Opening Stripe..." : "Connect Stripe"}
                    </button>
                )}

                {!showSteps && !status.onboarded && (
                    <button
                        onClick={() => setShowSteps(true)}
                        className={`px-4 py-3 rounded-xl text-sm transition-colors ${darkMode
                                ? "bg-gray-800 hover:bg-gray-700 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                            }`}
                    >
                        View onboarding steps
                    </button>
                )}
            </div>

            {(showSteps || status.onboarded) && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-2">
                        Step-by-step Stripe onboarding flow
                    </h3>

                    <p className={`text-sm mb-5 ${mutedText}`}>
                        This section explains what the trainer will see after clicking the
                        Connect Stripe button.
                    </p>

                    <div className="space-y-4">
                        {stripeSteps.map((step) => (
                            <div
                                key={step.id}
                                className={`rounded-2xl p-4 ${subCard} flex gap-4 items-start`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${stepNumberStyle}`}
                                >
                                    {step.id}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={mutedText}>{step.icon}</span>

                                        <h4 className="text-base font-semibold">{step.title}</h4>
                                    </div>

                                    <p className={`text-sm leading-6 ${mutedText}`}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className={`mt-6 rounded-2xl p-4 ${darkMode
                                ? "bg-blue-900/20 border border-blue-800 text-blue-200"
                                : "bg-blue-50 border border-blue-200 text-blue-800"
                            }`}
                    >
                        <p className="text-sm leading-6">
                            After these Stripe steps are completed, the trainer is sent back
                            to FitTrack. The application then checks the Stripe account again
                            and updates whether onboarding, charges, and payouts are fully
                            enabled.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerStripeConnect;