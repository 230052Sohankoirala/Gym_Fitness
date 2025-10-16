import React, { useState } from 'react'
import { motion } from 'framer-motion'// eslint-disable-line no-unused-vars
import {
    User,
    Bell,
    Shield,
    CreditCard,
    Palette,
    Download,
    Upload,
    Trash2,
    Save,
    Mail,
    Lock,
    Globe,
    Moon,
    Sun,
    Smartphone,
    Eye,
    EyeOff
} from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const TrainerSettings = () => {
    const { darkMode, toggleTheme } = useTheme()
    const [activeTab, setActiveTab] = useState('profile')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Form states
    const [profileData, setProfileData] = useState({
        firstName: "John",
        lastName: "Trainer",
        email: "john.trainer@example.com",
        phone: "+1 (555) 123-4567",
        bio: "Certified personal trainer with 8+ years of experience specializing in strength training and mobility.",
        specialization: "Strength Training"
    })

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        sessionReminders: true,
        paymentAlerts: true,
        newsletter: false
    })

    // Mirror your TrainerHome color strategy
    const baseBg = darkMode ? "bg-gray-900" : "bg-gray-50"
    const baseText = darkMode ? "text-gray-100" : "text-gray-900"
    const mutedText = darkMode ? "text-gray-300" : "text-gray-600"
    const cardBg = darkMode ? "bg-gray-900/60" : "bg-white"
    const cardBorder = darkMode ? "border-gray-800" : "border-gray-200"
    const inputBg = darkMode ? "bg-gray-800" : "bg-gray-50"
    const inputBorder = darkMode ? "border-gray-700" : "border-gray-300"


    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ]

    const Button = ({ children, variant = "solid", className = "", ...props }) => {
        const base = "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200"
        const styles =
            variant === "outline"
                ? `${darkMode ? "border-gray-700 text-gray-100 hover:bg-gray-800" : "border-gray-300 text-gray-900 hover:bg-gray-100"} border`
                : `${darkMode ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`
        return (
            <button className={`${base} ${styles} ${className}`} {...props}>
                {children}
            </button>
        )
    }

    const handleSaveProfile = (e) => {
        e.preventDefault()
        // Handle profile save logic
        console.log('Saving profile:', profileData)
    }

    const handleNotificationChange = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    return (
        <div className={`min-h-screen ${baseBg} ${baseText} transition-colors duration-200`}>
            <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-6"
                >
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
                    <p className={`mt-1 text-sm ${mutedText}`}>Manage your account settings and preferences</p>
                </motion.div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Sidebar Navigation */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="lg:w-64"
                    >
                        <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 transition-colors duration-200`}>
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
                                                    ? `${darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`
                                                    : `${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`
                                                }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-6 transition-colors duration-200`}>
                                    <div className="mb-6 flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Profile Information</h2>
                                    </div>

                                    <form onSubmit={handleSaveProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.firstName}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                                    className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.lastName}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                                    className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                                    className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                                    className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                Specialization
                                            </label>
                                            <select
                                                value={profileData.specialization}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                                                className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                            >
                                                <option>Strength Training</option>
                                                <option>Cardio & HIIT</option>
                                                <option>Mobility & Yoga</option>
                                                <option>Weight Loss</option>
                                                <option>Sports Performance</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                Bio
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                                className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <Button type="submit" className="gap-2">
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </Button>
                                            <Button variant="outline">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-6 transition-colors duration-200`}>
                                    <div className="mb-6 flex items-center gap-2">
                                        <Bell className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Notification Preferences</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(notificationSettings).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between py-3">
                                                <div>
                                                    <p className="text-sm font-medium capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                    </p>
                                                    <p className={`text-xs ${mutedText}`}>
                                                        Receive notifications about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleNotificationChange(key)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${value
                                                            ? 'bg-indigo-600'
                                                            : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${value ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-6 transition-colors duration-200`}>
                                    <div className="mb-6 flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Security Settings</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="mb-4 text-sm font-medium">Change Password</h3>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                        Current Password
                                                    </label>
                                                    <input
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 pr-10 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className={`absolute right-3 top-8 transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                        New Password
                                                    </label>
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 pr-10 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className={`absolute right-3 top-8 transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 pr-10 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className={`absolute right-3 top-8 transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>

                                                <Button className="gap-2">
                                                    <Lock className="h-4 w-4" />
                                                    Update Password
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors duration-200">
                                            <h3 className="mb-4 text-sm font-medium">Two-Factor Authentication</h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">2FA Status</p>
                                                    <p className={`text-xs ${mutedText}`}>Add an extra layer of security</p>
                                                </div>
                                                <Button variant="outline" className="gap-2">
                                                    <Smartphone className="h-4 w-4" />
                                                    Enable 2FA
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.35 }}
                            >
                                <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-6 transition-colors duration-200`}>
                                    <div className="mb-6 flex items-center gap-2">
                                        <Palette className="h-5 w-5" />
                                        <h2 className="text-lg font-semibold">Appearance</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Theme</p>
                                                <p className={`text-xs ${mutedText}`}>Choose your preferred theme</p>
                                            </div>
                                            <button
                                                onClick={toggleTheme}
                                                className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors duration-200 ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                                            >
                                                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                            </button>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors duration-200">
                                            <h3 className="mb-4 text-sm font-medium">Language & Region</h3>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                        Language
                                                    </label>
                                                    <select className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}>
                                                        <option>English</option>
                                                        <option>Spanish</option>
                                                        <option>French</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={`mb-2 block text-sm font-medium ${mutedText}`}>
                                                        Time Zone
                                                    </label>
                                                    <select className={`w-full rounded-lg border ${inputBorder} ${inputBg} px-3 py-2 text-sm transition-colors duration-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}>
                                                        <option>EST (Eastern Standard Time)</option>
                                                        <option>PST (Pacific Standard Time)</option>
                                                        <option>CST (Central Standard Time)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className={`mt-6 rounded-2xl border border-red-200 dark:border-red-800 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} p-6 transition-colors duration-200`}>
                                    <div className="mb-4 flex items-center gap-2">
                                        <Trash2 className="h-5 w-5 text-red-600" />
                                        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Export Data</p>
                                                <p className="text-xs text-red-400">Download all your data</p>
                                            </div>
                                            <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
                                                <Download className="h-4 w-4" />
                                                Export Data
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Delete Account</p>
                                                <p className="text-xs text-red-400">Permanently delete your account</p>
                                            </div>
                                            <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
                                                <Trash2 className="h-4 w-4" />
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TrainerSettings