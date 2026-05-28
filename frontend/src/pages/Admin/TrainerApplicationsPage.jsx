import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
    ArrowLeft,
    Search,
    RefreshCw,
    UserCheck,
    UserX,
    Eye,
    FileImage,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    Dumbbell,
    Building2,
    BadgeCheck,
    ClipboardList,
    Clock3,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const API_BASE =  import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com";

const TrainerApplicationsPage = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const [adminNote, setAdminNote] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState("");

    const pageBg = darkMode
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-900";



    const card = useMemo(
        () =>
            `rounded-2xl border shadow-sm transition-colors duration-200 ${darkMode ? "bg-gray-800 border-white/10" : "bg-white border-gray-200"
            }`,
        [darkMode]
    );

    const subtle = darkMode ? "text-gray-300" : "text-gray-600";
    const softText = darkMode ? "text-gray-400" : "text-gray-500";

    const input =
        `w-full px-4 py-3 rounded-xl border outline-none transition duration-200 ` +
        `focus:ring-2 focus:ring-indigo-500 ` +
        (darkMode
            ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400");

    const buttonBase =
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition duration-200 font-medium";

    const secondaryButton = darkMode
        ? `${buttonBase} border-gray-700 bg-gray-800 hover:bg-gray-700 text-white`
        : `${buttonBase} border-gray-300 bg-white hover:bg-gray-50 text-gray-900`;

    const primaryButton =
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition duration-200 font-medium";

    const successButton =
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition duration-200 font-medium";

    const dangerButton =
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition duration-200 font-medium";

    const getToken = () =>
        localStorage.getItem("token") || sessionStorage.getItem("token");

const fetchApplications = async () => {
    try {
        setLoading(true);

        const token = getToken();

        if (!token) {
            navigate("/adminLogin");
            return;
        }

        const query = new URLSearchParams();

        if (statusFilter && statusFilter !== "all") {
            query.append("status", statusFilter);
        }

        if (search.trim()) {
            query.append("search", search.trim());
        }

        const response = await fetch(
            `${API_BASE}/api/trainer-applications/admin/all${
                query.toString() ? `?${query.toString()}` : ""
            }`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        console.log("Trainer applications API response:", data);

        if (!response.ok) {
            throw new Error(
                data?.message || "Failed to fetch trainer applications."
            );
        }

        const applicationList = Array.isArray(data?.applications)
            ? data.applications
            : Array.isArray(data)
                ? data
                : [];

        setApplications(applicationList);
        setFilteredApplications(applicationList);
    } catch (error) {
        console.error("fetchApplications error:", error);

        setApplications([]);
        setFilteredApplications([]);
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    useEffect(() => {
        const lowerSearch = search.toLowerCase().trim();

        const nextFiltered = applications.filter((item) => {
            const combinedText = [
                item?.fullName,
                item?.email,
                item?.specialization,
                item?.workedPlace,
                item?.location,
                item?.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return combinedText.includes(lowerSearch);
        });

        setFilteredApplications(nextFiltered);
    }, [search, applications]);

    const openDetailsModal = (application) => {
        setSelectedApplication(application);
        setAdminNote(application?.adminNote || "");
        setDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setSelectedApplication(null);
        setAdminNote("");
        setDetailsModalOpen(false);
    };

    const updateApplicationStatus = async (applicationId, nextStatus) => {
        try {
            setActionLoadingId(applicationId);

            const token = getToken();
            if (!token) {
                navigate("/adminLogin");
                return;
            }

            const response = await fetch(
                `${API_BASE}/api/trainer-applications/admin/${applicationId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: nextStatus,
                        adminNote,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to update application status.");
            }

            const updated = data?.application;

            setApplications((prev) =>
                prev.map((item) => (item._id === applicationId ? updated : item))
            );

            setFilteredApplications((prev) =>
                prev.map((item) => (item._id === applicationId ? updated : item))
            );

            if (selectedApplication?._id === applicationId) {
                setSelectedApplication(updated);
            }

            closeDetailsModal();
        } catch (error) {
            console.error("updateApplicationStatus error:", error);
            alert(error.message || "Failed to update status.");
        } finally {
            setActionLoadingId("");
        }
    };

    const totalCount = applications.length;
    const pendingCount = applications.filter((a) => a.status === "pending").length;
    const approvedCount = applications.filter((a) => a.status === "approved").length;
    const rejectedCount = applications.filter((a) => a.status === "rejected").length;

    const getStatusBadge = (status) => {
        const normalized = String(status || "").toLowerCase();

        if (normalized === "approved") {
            return darkMode
                ? "bg-green-900/30 text-green-300 border border-green-700"
                : "bg-green-50 text-green-700 border border-green-200";
        }

        if (normalized === "rejected") {
            return darkMode
                ? "bg-red-900/30 text-red-300 border border-red-700"
                : "bg-red-50 text-red-700 border border-red-200";
        }

        if (normalized === "reviewed") {
            return darkMode
                ? "bg-blue-900/30 text-blue-300 border border-blue-700"
                : "bg-blue-50 text-blue-700 border border-blue-200";
        }

        return darkMode
            ? "bg-yellow-900/30 text-yellow-300 border border-yellow-700"
            : "bg-yellow-50 text-yellow-700 border border-yellow-200";
    };

    const renderStatusIcon = (status) => {
        const normalized = String(status || "").toLowerCase();

        if (normalized === "approved") return <CheckCircle2 className="w-4 h-4" />;
        if (normalized === "rejected") return <XCircle className="w-4 h-4" />;
        if (normalized === "reviewed") return <Eye className="w-4 h-4" />;
        return <Clock3 className="w-4 h-4" />;
    };

    const statCards = [
        {
            title: "Total Applications",
            value: totalCount,
            icon: <ClipboardList className="w-5 h-5" />,
        },
        {
            title: "Pending",
            value: pendingCount,
            icon: <AlertCircle className="w-5 h-5" />,
        },
        {
            title: "Approved",
            value: approvedCount,
            icon: <CheckCircle2 className="w-5 h-5" />,
        },
        {
            title: "Rejected",
            value: rejectedCount,
            icon: <XCircle className="w-5 h-5" />,
        },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
            {/* Header */}
            <div
                className={`sticky top-0 z-20 py-4 px-6 backdrop-blur-md transition-colors duration-200 border-b ${darkMode
                    ? "bg-gray-900/90 border-white/10"
                    : "bg-gray-100/90 border-gray-200"
                    }`}
            >
                <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className={secondaryButton}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Trainer Applications
                            </h1>
                            <p className={`text-sm mt-1 ${softText}`}>
                                Review, approve, and reject trainer applicants
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button onClick={fetchApplications} className={secondaryButton}>
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div key={stat.title} className={`${card} p-5`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm ${softText}`}>{stat.title}</p>
                                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-indigo-50"
                                        }`}
                                >
                                    <span className="text-indigo-500">{stat.icon}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className={`${card} p-5`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, specialization, workplace..."
                                className={`${input} pl-10`}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={input}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <button onClick={fetchApplications} className={primaryButton}>
                            <Search className="w-4 h-4" />
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Applications */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-semibold">Applicants</h2>
                            <p className={`text-sm ${softText}`}>
                                {filteredApplications.length} applicant(s) found
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
                            <p className={softText}>Loading trainer applications...</p>
                        </div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="py-16 text-center">
                            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p className={softText}>No trainer applications found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                            {filteredApplications.map((application) => (
                                <motion.div
                                    key={application._id}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl border p-5 transition-colors duration-200 ${darkMode
                                        ? "bg-gray-900 border-white/10"
                                        : "bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
                                        <div className="space-y-3 flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-lg font-semibold break-words">
                                                    {application.fullName}
                                                </h3>

                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${getStatusBadge(
                                                        application.status
                                                    )}`}
                                                >
                                                    {renderStatusIcon(application.status)}
                                                    {application.status}
                                                </span>
                                            </div>

                                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm ${subtle}`}>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-indigo-500" />
                                                    <span className="truncate">{application.email}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-indigo-500" />
                                                    <span>{application.phone}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                                    <span>{application.location}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Dumbbell className="w-4 h-4 text-indigo-500" />
                                                    <span>{application.specialization}</span>
                                                </div>

                                                <div className="flex items-center gap-2 sm:col-span-2">
                                                    <Building2 className="w-4 h-4 text-indigo-500" />
                                                    <span>
                                                        {application.workedPlace} ({application.workedPlacePhone})
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <span
                                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${darkMode
                                                        ? "bg-gray-800 text-gray-300 border border-white/10"
                                                        : "bg-white text-gray-700 border border-gray-200"
                                                        }`}
                                                >
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    {application.experience}
                                                </span>

                                                <span
                                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${darkMode
                                                        ? "bg-gray-800 text-gray-300 border border-white/10"
                                                        : "bg-white text-gray-700 border border-gray-200"
                                                        }`}
                                                >
                                                    <BadgeCheck className="w-3.5 h-3.5" />
                                                    {application.certificationsText}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-40 shrink-0">
                                            {application.certificateImage ? (
                                                <img
                                                    src={`http://localhost:4000${application.certificateImage}`}
                                                    alt="Certificate"
                                                    className="w-full h-28 object-cover rounded-xl border border-gray-300 dark:border-gray-700"
                                                />
                                            ) : (
                                                <div
                                                    className={`w-full h-28 rounded-xl border flex items-center justify-center ${darkMode
                                                        ? "bg-gray-800 border-white/10"
                                                        : "bg-white border-gray-200"
                                                        }`}
                                                >
                                                    <FileImage className="w-7 h-7 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-5">
                                        <button
                                            onClick={() => openDetailsModal(application)}
                                            className={secondaryButton}
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedApplication(application);
                                                setAdminNote(application?.adminNote || "");
                                                updateApplicationStatus(application._id, "approved");
                                            }}
                                            disabled={actionLoadingId === application._id}
                                            className={successButton}
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            {actionLoadingId === application._id
                                                ? "Updating..."
                                                : "Approve"}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedApplication(application);
                                                setAdminNote(application?.adminNote || "");
                                                updateApplicationStatus(application._id, "rejected");
                                            }}
                                            disabled={actionLoadingId === application._id}
                                            className={dangerButton}
                                        >
                                            <UserX className="w-4 h-4" />
                                            {actionLoadingId === application._id
                                                ? "Updating..."
                                                : "Reject"}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {detailsModalOpen && selectedApplication && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDetailsModal}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 ${card}`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Application Details</h2>
                                    <p className={`text-sm mt-1 ${softText}`}>
                                        Review the full applicant profile and certificate proof
                                    </p>
                                </div>

                                <button onClick={closeDetailsModal} className={secondaryButton}>
                                    Close
                                </button>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Left info */}
                                <div className="xl:col-span-2 space-y-6">
                                    <div className={`p-5 ${card}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-indigo-50"
                                                    }`}
                                            >
                                                <ClipboardList className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {selectedApplication.fullName}
                                                </h3>
                                                <p className={softText}>{selectedApplication.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4`}>
                                                <p className={softText}>Phone</p>
                                                <p className="font-medium mt-1">{selectedApplication.phone}</p>
                                            </div>

                                            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4`}>
                                                <p className={softText}>Location</p>
                                                <p className="font-medium mt-1">{selectedApplication.location}</p>
                                            </div>

                                            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4`}>
                                                <p className={softText}>Experience</p>
                                                <p className="font-medium mt-1">{selectedApplication.experience}</p>
                                            </div>

                                            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4`}>
                                                <p className={softText}>Specialization</p>
                                                <p className="font-medium mt-1">{selectedApplication.specialization}</p>
                                            </div>

                                            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4`}>
                                                <p className={softText}>Worked Place</p>
                                                <p className="font-medium mt-1">{selectedApplication.workedPlace}</p>
                                            </div>

                                            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4`}>
                                                <p className={softText}>Workplace Phone</p>
                                                <p className="font-medium mt-1">
                                                    {selectedApplication.workedPlacePhone}
                                                </p>
                                            </div>

                                            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4 md:col-span-2`}>
                                                <p className={softText}>Certifications</p>
                                                <p className="font-medium mt-1">
                                                    {selectedApplication.certificationsText}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-5 ${card}`}>
                                        <h3 className="text-lg font-semibold mb-3">Professional Bio</h3>
                                        <p className={`leading-7 text-sm ${subtle}`}>
                                            {selectedApplication.bio || "No bio provided."}
                                        </p>
                                    </div>

                                    <div className={`p-5 ${card}`}>
                                        <h3 className="text-lg font-semibold mb-3">Motivation</h3>
                                        <p className={`leading-7 text-sm ${subtle}`}>
                                            {selectedApplication.motivation || "No motivation provided."}
                                        </p>
                                    </div>
                                </div>

                                {/* Right panel */}
                                <div className="space-y-6">
                                    <div className={`p-5 ${card}`}>
                                        <h3 className="text-lg font-semibold mb-4">Certificate Proof</h3>

                                        {selectedApplication.certificateImage ? (
                                            <img
                                                src={`${API_BASE}${selectedApplication.certificateImage}`}
                                                alt="Certificate Proof"
                                                className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 object-cover"
                                            />
                                        ) : (
                                            <div
                                                className={`rounded-2xl border p-8 text-center ${darkMode
                                                    ? "bg-gray-900 border-white/10"
                                                    : "bg-gray-50 border-gray-200"
                                                    }`}
                                            >
                                                <FileImage className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                                                <p className={softText}>No certificate image uploaded.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`p-5 ${card}`}>
                                        <h3 className="text-lg font-semibold mb-4">Status Control</h3>

                                        <div className="mb-4">
                                            <span
                                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getStatusBadge(
                                                    selectedApplication.status
                                                )}`}
                                            >
                                                {renderStatusIcon(selectedApplication.status)}
                                                {selectedApplication.status}
                                            </span>
                                        </div>

                                        <label className={`text-sm font-medium block mb-2 ${subtle}`}>
                                            Admin Note
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Write an internal admin note..."
                                            className={`${input} resize-none`}
                                        />

                                        <div className="flex flex-col gap-3 mt-5">
                                            <button
                                                onClick={() =>
                                                    updateApplicationStatus(selectedApplication._id, "reviewed")
                                                }
                                                disabled={actionLoadingId === selectedApplication._id}
                                                className={primaryButton}
                                            >
                                                <Eye className="w-4 h-4" />
                                                Mark as Reviewed
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateApplicationStatus(selectedApplication._id, "approved")
                                                }
                                                disabled={actionLoadingId === selectedApplication._id}
                                                className={successButton}
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Approve Application
                                            </button>

                                            <button
                                                onClick={() =>
                                                    updateApplicationStatus(selectedApplication._id, "rejected")
                                                }
                                                disabled={actionLoadingId === selectedApplication._id}
                                                className={dangerButton}
                                            >
                                                <UserX className="w-4 h-4" />
                                                Reject Application
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainerApplicationsPage;