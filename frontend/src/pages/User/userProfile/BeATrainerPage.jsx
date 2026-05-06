import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import {
    ArrowLeft,
    Briefcase,
    User,
    Mail,
    Phone,
    MapPin,
    Award,
    Dumbbell,
    FileText,
    CheckCircle2,
    Building2,
    Image as ImageIcon,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const BeATrainerPage = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        experience: "",
        specialization: "",
        workedPlace: "",
        workedPlacePhone: "",
        certificationsText: "",
        bio: "",
        motivation: "",
    });

    const [certificateImage, setCertificateImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const pageBg = darkMode
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-900";

    const topBg = darkMode ? "bg-gray-900/90" : "bg-gray-100/90";

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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCertificateChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCertificateImage(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setFormData({
            fullName: "",
            email: "",
            phone: "",
            location: "",
            experience: "",
            specialization: "",
            workedPlace: "",
            workedPlacePhone: "",
            certificationsText: "",
            bio: "",
            motivation: "",
        });

        setCertificateImage(null);
        setPreviewImage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setMessage("You must be logged in first.");
                setSubmitting(false);
                return;
            }

            const payload = new FormData();
            payload.append("fullName", formData.fullName);
            payload.append("email", formData.email);
            payload.append("phone", formData.phone);
            payload.append("location", formData.location);
            payload.append("experience", formData.experience);
            payload.append("specialization", formData.specialization);
            payload.append("workedPlace", formData.workedPlace);
            payload.append("workedPlacePhone", formData.workedPlacePhone);
            payload.append("certificationsText", formData.certificationsText);
            payload.append("bio", formData.bio);
            payload.append("motivation", formData.motivation);

            if (certificateImage) {
                payload.append("certificateImage", certificateImage);
            }

            const response = await fetch("http://localhost:4000/api/trainer-applications", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: payload,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to submit application.");
            }

            setMessage(data?.message || "Application submitted successfully.");
            resetForm();
        } catch (error) {
            console.error("Trainer application failed:", error);
            setMessage(error.message || "Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const benefits = [
        "Work with active fitness members",
        "Build your trainer profile professionally",
        "Upload real certificate proof",
        "Let admin review your background properly",
    ];

    return (
        <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
            <div
                className={`sticky top-0 z-10 py-4 px-6 backdrop-blur-md transition-colors duration-200 ${topBg}`}
            >
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                            }`}
                    >
                        <ArrowLeft size={20} />
                    </motion.button>

                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                            Be a Trainer
                        </h1>
                        <p className={`text-sm ${softText}`}>
                            Recruitment application for trainer role
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`lg:col-span-1 p-6 ${card}`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-indigo-50"
                                    }`}
                            >
                                <Briefcase size={22} className="text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Trainer Recruitment</h2>
                                <p className={`text-sm ${softText}`}>Apply professionally</p>
                            </div>
                        </div>

                        <p className={`text-sm leading-6 ${subtle}`}>
                            Submit your trainer application with your experience, workplace
                            history, and certification proof for admin review.
                        </p>

                        <div className="mt-6 space-y-3">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
                                    <span className={`text-sm ${subtle}`}>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`lg:col-span-2 p-6 ${card}`}
                    >
                        <div className="mb-6">
                            <h2 className="text-lg md:text-xl font-semibold">
                                Trainer Application Form
                            </h2>
                            <p className={`text-sm mt-1 ${softText}`}>
                                Fill in the form carefully like a real recruitment application.
                            </p>
                        </div>

                        {message && (
                            <div
                                className={`mb-5 rounded-xl px-4 py-3 text-sm ${message.toLowerCase().includes("success")
                                    ? darkMode
                                        ? "bg-green-900/30 text-green-300 border border-green-700"
                                        : "bg-green-50 text-green-700 border border-green-200"
                                    : darkMode
                                        ? "bg-yellow-900/30 text-yellow-300 border border-yellow-700"
                                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                    }`}
                            >
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your phone number"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Location
                                    </label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Enter your city or area"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Years of Experience
                                    </label>
                                    <div className="relative">
                                        <Briefcase size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            placeholder="e.g. 2 years"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Specialization
                                    </label>
                                    <div className="relative">
                                        <Dumbbell size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            placeholder="e.g. Strength / Fat Loss / Cardio"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Place You Worked At
                                    </label>
                                    <div className="relative">
                                        <Building2 size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="workedPlace"
                                            value={formData.workedPlace}
                                            onChange={handleChange}
                                            placeholder="Enter gym / company name"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                        Workplace Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="workedPlacePhone"
                                            value={formData.workedPlacePhone}
                                            onChange={handleChange}
                                            placeholder="Enter workplace phone number"
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                    Certifications
                                </label>
                                <div className="relative">
                                    <Award size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="certificationsText"
                                        value={formData.certificationsText}
                                        onChange={handleChange}
                                        placeholder="Write your certification names"
                                        className={`${input} pl-10`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                    Certificate Proof Image
                                </label>
                                <div
                                    className={`rounded-2xl border p-4 transition-colors duration-200 ${darkMode
                                        ? "bg-gray-900 border-gray-700"
                                        : "bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <div className="relative">
                                        <ImageIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={handleCertificateChange}
                                            className={`${input} pl-10`}
                                            required
                                        />
                                    </div>

                                    {previewImage && (
                                        <div className="mt-4">
                                            <img
                                                src={previewImage}
                                                alt="Certificate Preview"
                                                className="w-full max-h-72 object-contain rounded-xl border border-gray-300 dark:border-gray-700"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                    Short Professional Bio
                                </label>
                                <div className="relative">
                                    <FileText size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about your trainer background"
                                        rows={4}
                                        className={`${input} pl-10 resize-none`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`text-sm font-medium mb-2 block ${subtle}`}>
                                    Why do you want to become a trainer here?
                                </label>
                                <textarea
                                    name="motivation"
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    placeholder="Explain your motivation"
                                    rows={5}
                                    className={`${input} resize-none`}
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={submitting}
                                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200"
                                >
                                    {submitting ? "Submitting..." : "Submit Application"}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/profile")}
                                    className={`px-6 py-3 rounded-xl font-medium transition duration-200 ${darkMode
                                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                                        }`}
                                >
                                    Back to Profile
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default BeATrainerPage;