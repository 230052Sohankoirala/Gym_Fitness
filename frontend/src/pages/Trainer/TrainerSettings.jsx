import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import {
  Save,
  Upload,
  User,
  Mail,
  FileText,
  Star,
  LogOut,
  Briefcase,
  Clock3,
  RefreshCw,
  Camera,
  ShieldCheck,
  Lock,
  KeyRound,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "https://gym-fitness-hgq7.onrender.com"
const DEFAULT_AVATAR =
  "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg";

const TrainerSettings = () => {
  const [trainer, setTrainer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    speciality: "",
    experience: "",
    bio: "",
    rating: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const { darkMode } = useTheme?.() ?? { darkMode: false };
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const pageBg = darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const card = darkMode
    ? "bg-gray-800 border-white/10 shadow-black/20"
    : "bg-white border-gray-200 shadow-gray-200/70";
  const muted = darkMode ? "text-gray-300" : "text-gray-600";
  const subtle = darkMode ? "text-gray-400" : "text-gray-500";
  const iconColor = darkMode ? "text-gray-400" : "text-gray-500";

  const inputClass = useMemo(
    () =>
      `w-full rounded-2xl border px-4 py-3.5 outline-none transition-all duration-200 ${
        darkMode
          ? "bg-gray-700/90 border-gray-600 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      }`,
    [darkMode]
  );

  const primaryBtn = darkMode
    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
    : "bg-indigo-600 hover:bg-indigo-700 text-white";

  const secondaryBtn = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
    : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-300";

  const dangerBtn = darkMode
    ? "bg-red-500 hover:bg-red-600 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  const resolveImageUrl = (avatarPath) => {
    if (!avatarPath) return "";
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${API_BASE}${avatarPath}`;
  };

  const fetchTrainer = async () => {
    if (!token) return;

    setLoadingProfile(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/trainers/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load trainer details");
      }

      setTrainer(data);
      setForm({
        name: data?.name || "",
        email: data?.email || "",
        speciality: data?.speciality || "",
        experience: data?.experience || "",
        bio: data?.bio || "",
        rating: data?.rating ?? "",
      });
      setPreview(resolveImageUrl(data?.avatar || ""));
    } catch (err) {
      setError(err.message || "Failed to load trainer details");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchTrainer();

    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
    setSuccess("");
  };

  const uploadAvatarIfNeeded = async (trainerId) => {
    if (!image || !trainerId) return;

    const formData = new FormData();
    formData.append("avatar", image);

    setUploadingImage(true);

    try {
      const res = await fetch(`${API_BASE}/api/trainers/${trainerId}/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Image upload failed");
      }

      const uploadedAvatar = data?.avatar || data?.trainer?.avatar || "";

      if (uploadedAvatar) {
        setPreview(resolveImageUrl(uploadedAvatar));
        setTrainer((prev) => ({
          ...prev,
          avatar: uploadedAvatar,
        }));
      }

      setImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trainer?.id) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        rating: form.rating === "" ? "" : Number(form.rating),
        experience: form.experience === "" ? 0 : Number(form.experience),
      };

      const res = await fetch(`${API_BASE}/api/trainers/${trainer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update profile");
      }

      await uploadAvatarIfNeeded(trainer.id);
      await fetchTrainer();
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/trainers/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to change password");
      }

      setPasswordSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/trainerLogin");
  };

  const profileCompleteness = (() => {
    const fields = [
      form.name,
      form.email,
      form.speciality,
      form.experience,
      form.bio,
      form.rating,
    ];
    const filled = fields.filter((item) => String(item).trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  })();

  if (loadingProfile) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${pageBg}`}>
        <div className={`w-full max-w-md rounded-3xl border p-8 text-center shadow-xl ${card}`}>
          <RefreshCw className="mx-auto mb-4 animate-spin" size={28} />
          <h2 className="text-lg font-semibold mb-2">Loading trainer profile</h2>
          <p className={muted}>Please wait while your settings are being prepared.</p>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${pageBg}`}>
        <div className={`w-full max-w-md rounded-3xl border p-8 text-center shadow-xl ${card}`}>
          <h2 className="text-lg font-semibold mb-2">Unable to load profile</h2>
          <p className={`mb-5 ${muted}`}>We could not fetch your trainer information.</p>
          <button
            onClick={fetchTrainer}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition ${primaryBtn}`}
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={`text-sm font-medium uppercase tracking-[0.18em] ${subtle}`}>
              Trainer Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">Trainer Settings</h1>
            <p className={`mt-2 text-sm sm:text-base ${muted}`}>
              Update your profile, image, and password from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTrainer}
            className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition ${secondaryBtn}`}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {(error || success) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  darkMode
                    ? "bg-red-500/10 border-red-500/30 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  darkMode
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {success}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 space-y-6">
            <div className={`rounded-3xl border p-6 shadow-xl ${card}`}>
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-indigo-500/20 shadow-lg bg-gray-200">
                    <img
                      src={preview || DEFAULT_AVATAR}
                      alt="Trainer Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className={`absolute bottom-1 right-1 rounded-full p-2 shadow-md ${
                      darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-700"
                    }`}
                  >
                    <Camera size={16} />
                  </div>
                </div>

                <h2 className="mt-4 text-xl font-semibold">{form.name || "Trainer Name"}</h2>
                <p className={`text-sm ${muted}`}>{form.email || "trainer@email.com"}</p>

                <div className="mt-5 w-full">
                  <label
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl cursor-pointer transition ${primaryBtn}`}
                  >
                    <Upload size={18} />
                    {uploadingImage ? "Uploading..." : "Upload Profile Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={saving || uploadingImage}
                    />
                  </label>

                  <p className={`text-xs mt-3 ${subtle}`}>
                    Recommended: square image, clear face, professional lighting.
                  </p>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border p-6 shadow-xl ${card}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-semibold">Profile Strength</h3>
                  <p className={`text-sm ${muted}`}>Complete more fields to improve trust.</p>
                </div>
              </div>

              <div className="w-full h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className={muted}>Completion</span>
                <span className="font-semibold">{profileCompleteness}%</span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
            <form onSubmit={handleSubmit}>
              <div className={`rounded-3xl border p-5 sm:p-7 shadow-xl ${card}`}>
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold">Professional Information</h3>
                  <p className={`mt-1 text-sm ${muted}`}>
                    Keep your information accurate and polished.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}
                        size={18}
                      />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}
                        size={18}
                      />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Speciality</label>
                    <div className="relative">
                      <Briefcase
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}
                        size={18}
                      />
                      <input
                        type="text"
                        name="speciality"
                        value={form.speciality}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                        placeholder="Yoga, Strength, Rehab, Cardio"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Experience</label>
                    <div className="relative">
                      <Clock3
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}
                        size={18}
                      />
                      <input
                        type="number"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Rating</label>
                    <div className="relative">
                      <Star
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400"
                        size={18}
                      />
                      <input
                        type="number"
                        name="rating"
                        value={form.rating}
                        onChange={handleChange}
                        className={`${inputClass} pl-11`}
                        placeholder="0 to 5"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium">Bio</label>
                    <div className="relative">
                      <FileText className={`absolute left-4 top-4 ${iconColor}`} size={18} />
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows="6"
                        className={`${inputClass} pl-11 resize-none`}
                        placeholder="Write your professional trainer bio"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving || uploadingImage}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold shadow-md transition ${primaryBtn}`}
                  >
                    <Save size={18} />
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleLogout}
                    className={`sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold shadow-md transition ${dangerBtn}`}
                  >
                    <LogOut size={18} />
                    Logout
                  </motion.button>
                </div>
              </div>
            </form>

            <form onSubmit={handlePasswordSubmit}>
              <div className={`rounded-3xl border p-5 sm:p-7 shadow-xl ${card}`}>
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold">Password & Security</h3>
                  <p className={`mt-1 text-sm ${muted}`}>
                    Change your password to keep your account secure.
                  </p>
                </div>

                {(passwordError || passwordSuccess) && (
                  <div className="mb-5 space-y-3">
                    {passwordError && (
                      <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                          darkMode
                            ? "bg-red-500/10 border-red-500/30 text-red-300"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {passwordError}
                      </div>
                    )}

                    {passwordSuccess && (
                      <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                          darkMode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}
                      >
                        {passwordSuccess}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Current Password</label>
                    <div className="relative">
                      <Lock
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}
                        size={18}
                      />
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`${inputClass} pl-11`}
                        placeholder="Current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">New Password</label>
                    <div className="relative">
                      <KeyRound
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}
                        size={18}
                      />
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`${inputClass} pl-11`}
                        placeholder="New password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <ShieldCheck
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`}
                        size={18}
                      />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`${inputClass} pl-11`}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={changingPassword}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold shadow-md transition ${primaryBtn}`}
                  >
                    <Lock size={18} />
                    {changingPassword ? "Updating Password..." : "Change Password"}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;