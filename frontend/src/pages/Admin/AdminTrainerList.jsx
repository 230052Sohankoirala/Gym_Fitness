import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Dumbbell,
  Plus,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  DumbbellIcon,
  ImagePlus,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000";
const API_URL = `${API_BASE}/api`;

const AdminTrainerList = () => {
  const { darkMode } = useTheme?.() ?? { darkMode: false };
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("token"), []);
  const api = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [token]);

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    speciality: "Yoga",
    experience: "",
    bio: "",
    rating: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const resolveImageUrl = (avatarPath) => {
    if (!avatarPath) return "";
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${API_BASE}${avatarPath}`;
  };

  const resetForm = useCallback(() => {
    setForm({
      name: "",
      email: "",
      password: "",
      speciality: "Yoga",
      experience: "",
      bio: "",
      rating: "",
    });
    setAvatar(null);
    setPreview("");
  }, []);

  const fetchTrainers = useCallback(async () => {
    try {
      setErrorMsg("");
      setLoading(true);

      const res = await api.get("/trainers");
      setTrainers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch trainers:", err?.response?.data || err?.message);
      setErrorMsg(err?.response?.data?.message || "Failed to fetch trainers");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name?.trim() || !form.email?.trim() || !form.password?.trim()) {
      setErrorMsg("Name, email, and password are required.");
      return;
    }

    const ratingNumber = form.rating === "" ? "" : Number(form.rating);

    if (
      ratingNumber !== "" &&
      (!Number.isFinite(ratingNumber) || ratingNumber < 0 || ratingNumber > 5)
    ) {
      setErrorMsg("Rating must be a number between 0 and 5.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("speciality", form.speciality);
      formData.append("experience", form.experience);
      formData.append("bio", form.bio);
      formData.append("rating", form.rating);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await api.post("/trainers", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const created = res?.data?.trainer;

      if (created) {
        setTrainers((prev) => [created, ...prev]);
        resetForm();
      } else {
        await fetchTrainers();
        resetForm();
      }
    } catch (err) {
      console.error("Add trainer failed:", err?.response?.data || err?.message);
      setErrorMsg(err?.response?.data?.message || "Add trainer failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    setErrorMsg("");

    if (!id) return;

    const ok = window.confirm("Delete this trainer? This action cannot be undone.");
    if (!ok) return;

    try {
      await api.delete(`/trainers/${id}`);
      setTrainers((prev) => prev.filter((t) => (t._id || t.id) !== id));
    } catch (err) {
      console.error("Delete trainer failed:", err?.response?.data || err?.message);
      setErrorMsg(err?.response?.data?.message || "Delete trainer failed");
    }
  };

  const pageBg = darkMode
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
    : "bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900";

  const cardBg = darkMode
    ? "bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
    : "bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)]";

  const inputBg = darkMode
    ? "bg-slate-900/70 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-400"
    : "bg-white/80 backdrop-blur-md border border-slate-200 text-slate-900 placeholder:text-slate-400";

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${pageBg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin – Trainer Management</h1>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Create and manage trainers, including profile photo.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/trainer-applications")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${darkMode
                  ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
            >
              <DumbbellIcon className="w-4 h-4" />
              Trainer Applications
            </button>

            <button
              onClick={fetchTrainers}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${darkMode
                  ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${darkMode
                ? "bg-red-950/40 border-red-900 text-red-200"
                : "bg-red-50 border-red-200 text-red-700"
              }`}
          >
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleAdd} className={`rounded-2xl border shadow-sm p-5 mb-8 ${cardBg}`}>
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Add New Trainer</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Trainer Name"
              className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Trainer Email"
              className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Temporary Password"
              className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            />

            <select
              name="speciality"
              value={form.speciality}
              onChange={handleChange}
              className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            >
              <option value="Yoga">Yoga</option>
              <option value="Weight Lifting">Weight Lifting</option>
              <option value="Diet">Diet</option>
              <option value="Cardio">Cardio</option>
              <option value="CrossFit">CrossFit</option>
            </select>

            <input
              type="text"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Experience"
              className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            />

            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              placeholder="Rating (0–5)"
              className={`p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            />

            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Trainer Bio"
              rows={3}
              className={`md:col-span-2 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            />

            <div className="md:col-span-2">
              <label
                className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition ${darkMode
                    ? "border-gray-700 bg-slate-900/70 hover:bg-slate-800 text-white"
                    : "border-gray-300 bg-white hover:bg-gray-50 text-slate-900"
                  }`}
              >
                <ImagePlus className="w-5 h-5" />
                {avatar ? "Change Trainer Photo" : "Upload Trainer Photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            {preview && (
              <div className="md:col-span-2 flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover border shadow"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold transition ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              <Plus className="w-5 h-5" />
              {submitting ? "Adding..." : "Add Trainer"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className={`px-4 py-3 rounded-xl border font-semibold transition ${darkMode
                  ? "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
            >
              Clear
            </button>
          </div>
        </form>

        <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBg}`}>
          <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <h2 className="text-lg font-semibold">Trainers</h2>
            <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              {loading ? "Loading..." : `${trainers.length} trainer(s) found`}
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-sm opacity-80">Loading trainers...</div>
          ) : trainers.length > 0 ? (
            <div className={`${darkMode ? "divide-gray-700" : "divide-gray-200"} divide-y`}>
              {trainers.map((trainer) => {
                const id = trainer._id || trainer.id;
                const avatarUrl = resolveImageUrl(trainer.avatar);

                return (
                  <div
                    key={id}
                    className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 ${darkMode ? "hover:bg-gray-700/40" : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={trainer.name}
                          className="w-14 h-14 rounded-full object-cover border"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-100"
                            }`}
                        >
                          <Dumbbell
                            className={`w-6 h-6 ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                          />
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-base">{trainer.name}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {trainer.email} •{" "}
                          <span className="font-medium">{trainer.speciality || "N/A"}</span>
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {trainer.experience || "No experience set"} • ⭐ {trainer.rating ?? "N/A"}
                        </p>
                        {trainer.bio ? (
                          <p
                            className={`text-xs mt-2 ${darkMode ? "text-gray-300" : "text-gray-700"
                              } line-clamp-2`}
                          >
                            {trainer.bio}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRemove(id)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition ${darkMode
                            ? "bg-red-950/40 hover:bg-red-950/70 border border-red-900 text-red-200"
                            : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-700"
                          }`}
                        title="Delete trainer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-sm opacity-80 text-center">No trainers found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTrainerList;