// src/pages/PrivacyPolicy.jsx
import { MoveLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const handleBack = () => navigate("/");
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6 lg:px-20">
            <div className="flex  mb-8">
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                    onClick={handleBack}
                >
                    <MoveLeft /> <span>Back</span>
                </button>
            </div>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 lg:p-12">
                {/* Header */}

                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">
                    Privacy Policy
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
                    Last updated: September 28, 2025
                </p>

                {/* Section 1 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        1. Introduction
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        FitTrack is committed to protecting your privacy. This Privacy Policy
                        explains how we collect, use, and safeguard your information when
                        you use our services and website.
                    </p>
                </section>

                {/* Section 2 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        2. Information We Collect
                    </h2>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
                        <li>Personal details (name, email, age, weight, height, etc.)</li>
                        <li>Account login information</li>
                        <li>Workout and fitness data you log</li>
                        <li>Device and usage information (IP address, browser type)</li>
                    </ul>
                </section>

                {/* Section 3 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        3. How We Use Your Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We use your information to:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                        <li>Provide, personalize, and improve our services</li>
                        <li>Communicate with you regarding updates and offers</li>
                        <li>Monitor usage for security and analytics purposes</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </section>

                {/* Section 4 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        4. Data Security
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We implement appropriate security measures to protect your data
                        against unauthorized access, alteration, or disclosure. However, no
                        system is 100% secure, and we cannot guarantee complete protection.
                    </p>
                </section>

                {/* Section 5 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        5. Third-Party Services
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We may share your information with trusted third-party service
                        providers for analytics, payment processing, and app functionality.
                        These providers are obligated to keep your data secure.
                    </p>
                </section>

                {/* Section 6 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        6. Your Rights
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        You have the right to access, update, or delete your personal data.
                        Please contact us if you wish to exercise any of these rights.
                    </p>
                </section>

                {/* Section 7 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        7. Changes to This Policy
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We may update this Privacy Policy from time to time. Changes will be
                        posted on this page with an updated date.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        8. Contact Us
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        If you have questions about this Privacy Policy, please contact us
                        at:{" "}
                        <a
                            href="mailto:support@fittrack.com"
                            className="text-blue-600 dark:text-blue-400 underline"
                        >
                            support@fittrack.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
