// src/pages/User/Workout.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { useTheme } from "../../../context/ThemeContext";

// Import your media here so refresh/deep-link works
import ArmsWorkout from "../../../video/ArmsWorkout.mp4";
import ChestWorkout from "../../../video/ChestWorkout.mp4";
import LegsWorkout from "../../../video/LegWorkout.mp4";
import BackWorkout from "../../../video/BackWorkout.mp4";

// Map a clean slug to each video & title
const VIDEO_MAP = {
  chestworkouts: { title: "Chest Workouts", src: ChestWorkout },
  backworkouts:  { title: "Back Workouts",  src: BackWorkout  },
  armsworkouts:  { title: "Arms Workouts",  src: ArmsWorkout  },
  legworkouts:   { title: "Legs Workouts",  src: LegsWorkout   },
};

const WorkoutVideo = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams(); // e.g. "chestworkouts"
  const location = useLocation();

  // Prefer the state passed from navigation, but fall back to slug mapping
  const { title, src } = useMemo(() => {
    const fromState = location.state && typeof location.state === "object" ? location.state : {};
    if (fromState?.src) {
      return { title: fromState.title || "Workout Video", src: fromState.src };
    }
    // fallback via slug
    const key = (slug || "").toLowerCase();
    if (VIDEO_MAP[key]) return VIDEO_MAP[key];
    return { title: "Workout Video", src: "" };
  }, [location.state, slug]);

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`w-full sticky top-0 z-10 ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <div className="flex items-center p-4 w-full max-w-3xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full mr-3 ${
              darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"
            }`}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className={`text-xl md:text-2xl font-semibold`}>
            {title}
          </h1>
        </div>
      </div>

      {/* Player Card */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-8">
        <div
          className={`mt-4 rounded-xl shadow-sm p-4 md:p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {src ? (
            <div className="w-full">
              {/* Maintain aspect ratio and let video scale */}
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <video
                  src={src}
                  controls
                  className="absolute inset-0 w-full h-full rounded-lg"
                />
              </div>

              {/* Optional: simple meta/details */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mt-1 text-sm`}>
                  Enjoy the session! Remember to warm up, focus on form, and cool down.
                </p>
              </div>
            </div>
          ) : (
            <p className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              No video source found. Please go back and choose a workout again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutVideo;
