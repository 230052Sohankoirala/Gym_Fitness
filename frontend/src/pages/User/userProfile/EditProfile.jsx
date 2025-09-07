import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";//  eslint-disable-line no-unused-vars
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Calendar,
  Image as ImageIcon,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

const EditProfile = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme?.() ?? { darkMode: false };

  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const [form, setForm] = useState({
    avatar: null,
    fullname: "",
    username: "",
    email: "",
    age: "",
    weight: "",
    height: "",
    gender: "Other",
    passwordCurrent: "",
    passwordNew: "",
    passwordConfirm: "",
  });

  // ✅ Dummy save handler (frontend only)
  const onSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1800);
    }, 1000);
  };

  // UI Styles
  const card = `rounded-2xl p-4 sm:p-5 shadow-sm transition-colors duration-200 ${
    darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
  }`;
  const inputBase = "w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition";
  const inputTheme = darkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-indigo-500";
  const labelTheme = darkMode ? "text-gray-300" : "text-gray-700";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-900" : "bg-gray-100"} transition-colors duration-200`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
            } transition-colors duration-200`}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className={`text-xl sm:text-2xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Edit Profile
          </h1>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-white text-black hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-200 ${
                saving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              } inline-flex items-center gap-2`}
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Save Toast */}
      <div className="sticky top-2 z-30 px-4">
        <AnimatePresence>
          {showSaved && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className={`mx-auto max-w-3xl rounded-xl px-4 py-3 shadow ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              Changes saved! (frontend only)
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Avatar + Info */}
        <div className={card}>
          <h3 className="font-semibold mb-3">Profile</h3>
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div
                className={`w-20 h-20 rounded-full grid place-content-center overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                {form.avatar ? (
                  <img
                    src={
                      typeof form.avatar === "string"
                        ? form.avatar
                        : URL.createObjectURL(form.avatar)
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} />
                )}
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm((f) => ({ ...f, avatar: file }));
                  }}
                />
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors duration-200 ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <ImageIcon size={14} /> Change
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Input label="Full Name" value={form.fullname} onChange={(v) => setForm((f) => ({ ...f, fullname: v }))} icon={<User size={16} />} inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
              <Input label="Username" value={form.username} onChange={(v) => setForm((f) => ({ ...f, username: v }))} icon={<User size={16} />} inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
              <Input label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} icon={<Mail size={16} />} type="email" inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
              <Input label="Age" value={form.age} onChange={(v) => setForm((f) => ({ ...f, age: v }))} icon={<Calendar size={16} />} type="number" inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
              <Input label="Weight" value={form.weight} onChange={(v) => setForm((f) => ({ ...f, weight: v }))} icon={<User size={16} />} type="number" inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
              <Input label="Height" value={form.height} onChange={(v) => setForm((f) => ({ ...f, height: v }))} icon={<User size={16} />} type="number" inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
              <Select label="Gender" value={form.gender} onChange={(v) => setForm((f) => ({ ...f, gender: v }))} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]} inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className={card}>
          <h3 className="font-semibold mb-3">Change Password</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PasswordInput label="Current" value={form.passwordCurrent} onChange={(v) => setForm((f) => ({ ...f, passwordCurrent: v }))} show={showPw.current} onToggle={() => setShowPw((s) => ({ ...s, current: !s.current }))} inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
            <PasswordInput label="New" value={form.passwordNew} onChange={(v) => setForm((f) => ({ ...f, passwordNew: v }))} show={showPw.next} onToggle={() => setShowPw((s) => ({ ...s, next: !s.next }))} inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
            <PasswordInput label="Confirm" value={form.passwordConfirm} onChange={(v) => setForm((f) => ({ ...f, passwordConfirm: v }))} show={showPw.confirm} onToggle={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} inputBase={inputBase} inputTheme={inputTheme} labelTheme={labelTheme} />
          </div>
          <p className={`text-xs mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Use 8+ characters, with a mix of letters, numbers, and symbols.
          </p>
        </div>
      </div>
    </div>
  );
};

/* --- Tiny UI Components --- */
const Input = ({ label, value, onChange, placeholder, icon, inputBase, inputTheme, labelTheme, type = "text" }) => (
  <div>
    <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">{icon}</span>}
      <input type={type} className={`${inputBase} ${inputTheme} ${icon ? "pl-9" : ""}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  </div>
);

const PasswordInput = ({ label, value, onChange, show, onToggle, inputBase, inputTheme, labelTheme }) => (
  <div>
    <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">
        <Lock size={16} />
      </span>
      <input type={show ? "text" : "password"} className={`${inputBase} ${inputTheme} pl-9 pr-9`} value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const Select = ({ label, value, onChange, options, inputBase, inputTheme, labelTheme }) => (
  <div>
    <label className={`block text-sm mb-1 ${labelTheme}`}>{label}</label>
    <select className={`${inputBase} ${inputTheme}`} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default EditProfile;
