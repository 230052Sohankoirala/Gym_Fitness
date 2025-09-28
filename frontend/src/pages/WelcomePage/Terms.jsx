// src/pages/Terms.jsx
import { MoveLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
    const navigate = useNavigate();
    const handleBack = () => navigate("/");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6 lg:px-20">
            {/* Back Button */}
            <div className="flex mb-8">
                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    onClick={handleBack}
                >
                    <MoveLeft /> <span>Back</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 lg:p-12">
                {/* Header */}
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">
                    Terms & Conditions
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
                    Last updated: September 28, 2025
                </p>

                {/* Section 1 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        1. Acceptance of Terms
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        By accessing or using FitTrack, you agree to comply with and be bound
                        by these Terms & Conditions. If you do not agree, please discontinue
                        use of the app and website.
                    </p>
                </section>

                {/* Section 2 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        2. Use of Services
                    </h2>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
                        <li>You must be at least 16 years old to use FitTrack.</li>
                        <li>Do not misuse or interfere with the platform or its features.</li>
                        <li>Provide accurate information during registration and updates.</li>
                        <li>You are responsible for maintaining the confidentiality of your account.</li>
                    </ul>
                </section>

                {/* Section 3 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        3. User Responsibilities
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        You agree not to use the services for unlawful purposes, including but not
                        limited to sharing offensive content, violating intellectual property, or
                        attempting unauthorized access to our systems.
                    </p>
                </section>

                {/* Section 4 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        4. Subscription & Payments
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Certain features may require a paid subscription. By subscribing, you agree
                        to provide accurate payment details and authorize us to charge the applicable
                        fees. All payments are non-refundable unless otherwise stated.
                    </p>
                </section>

                {/* Section 5 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        5. Limitation of Liability
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        FitTrack is not liable for any direct, indirect, or incidental damages arising
                        from the use or inability to use our services. You use the platform at your
                        own risk.
                    </p>
                </section>

                {/* Section 6 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        6. Termination
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We reserve the right to suspend or terminate accounts that violate these
                        Terms & Conditions or misuse the platform in any way.
                    </p>
                </section>

                {/* Section 7 */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        7. Changes to Terms
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        We may update these Terms & Conditions at any time. Updated versions will be
                        posted on this page with the latest revision date.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        8. Contact Us
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        If you have any questions about these Terms & Conditions, please contact us
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

export default Terms;
