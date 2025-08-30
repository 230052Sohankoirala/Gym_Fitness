import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import workouts from "../../data/workout.json";
import { FaArrowLeft, FaClock, FaFire, FaHeartbeat, FaDumbbell, FaRunning } from "react-icons/fa";
import { motion } from "framer-motion";// eslint-disable-line no-unused-vars
import { useTheme } from "../../context/ThemeContext";

const UserWorkoutDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const allWorkouts = Object.values(workouts).flat();
    const selectedWorkout = allWorkouts.find((w) => w.id === parseInt(id));

    // Equipment mapping based on exercise type
    const getEquipmentForWorkout = (workout) => {
        const baseEquipment = ["Water Bottle", "Exercise Mat"];
        
        // Cardio exercises
        if (workout.id <= 10) {
            if (workout.name.includes("Jump Rope")) return [...baseEquipment, "Jump Rope"];
            if (workout.name.includes("Sprint")) return [...baseEquipment, "Running Shoes"];
            return baseEquipment;
        }
        
        // Back exercises
        if (workout.id <= 20) {
            if (workout.name.includes("Pull") || workout.name.includes("Chin")) 
                return [...baseEquipment, "Pull-up Bar"];
            if (workout.name.includes("Deadlift") || workout.name.includes("Rows")) 
                return [...baseEquipment, "Barbell", "Weight Plates"];
            if (workout.name.includes("Lat Pulldown") || workout.name.includes("Seated Rows")) 
                return [...baseEquipment, "Cable Machine"];
            return [...baseEquipment, "Dumbbells"];
        }
        
        // Chest exercises
        if (workout.id <= 30) {
            if (workout.name.includes("Bench Press") || workout.name.includes("Incline")) 
                return [...baseEquipment, "Bench", "Barbell", "Weight Plates"];
            if (workout.name.includes("Cable Crossover")) 
                return [...baseEquipment, "Cable Machine"];
            if (workout.name.includes("Pec Deck")) 
                return [...baseEquipment, "Pec Deck Machine"];
            return [...baseEquipment, "Dumbbells"];
        }
        
        // Leg exercises
        if (workout.id <= 40) {
            if (workout.name.includes("Leg Press") || workout.name.includes("Extensions") || workout.name.includes("Curls")) 
                return [...baseEquipment, "Leg Machine"];
            if (workout.name.includes("Squat") && !workout.name.includes("Split")) 
                return [...baseEquipment, "Barbell", "Weight Plates"];
            if (workout.name.includes("Calf Raises")) 
                return [...baseEquipment, "Step Platform"];
            return baseEquipment;
        }
        
        // Arm exercises
        if (workout.id <= 60) {
            if (workout.name.includes("Cable")) 
                return [...baseEquipment, "Cable Machine"];
            if (workout.name.includes("Preacher")) 
                return [...baseEquipment, "Preacher Bench"];
            return [...baseEquipment, "Dumbbells"];
        }
        
        return baseEquipment;
    };

    if (!selectedWorkout) {
        return (
            <div className={`${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'} p-6 min-h-screen flex flex-col items-center justify-center`}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} rounded-2xl shadow-xl p-8 max-w-md w-full text-center`}
                >
                    <button
                        className="mb-6 text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-2 font-medium"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft /> Back to workouts
                    </button>
                    <p>Workout not found!</p>
                </motion.div>
            </div>
        );
    }

    const workoutMetrics = {
        duration: `${Math.floor(Math.random() * 30) + 20} mins`,
        calories: Math.floor(Math.random() * 300) + 150,
        intensity: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)]
    };

    const equipmentNeeded = getEquipmentForWorkout(selectedWorkout);

    return (
        <div className={` transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6 min-h-screen transition-colors duration-200`}>
            {/* Header with back button */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center mb-2"
            >
                <button
                    className={` ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} transition-colors flex items-center gap-2 font-medium p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'}`}
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft className="text-lg" /> Back
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`w-4/12  transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto`}
            >
                {/* Workout header with color accent */}
                <div 
                    className="h-3 w-full"
                    style={{ backgroundColor: selectedWorkout.color }}
                ></div>
                
                <div className="p-6 md:p-8">
                    {/* Icon and title section */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                            className="w-28 h-28 mb-5 rounded-2xl flex items-center justify-center text-4xl text-white shadow-lg relative"
                            style={{ backgroundColor: selectedWorkout.color }}
                        >
                            {selectedWorkout.icon}
                            <div className="absolute -inset-2 bg-current opacity-20 blur-lg rounded-full"></div>
                        </motion.div>
                        <div>
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 text-blue-600 bg-blue-100">
                                {selectedWorkout.category}
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{selectedWorkout.name}</h1>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md`}>
                                {selectedWorkout.description}
                            </p>
                        </div>
                    </div>

                    {/* Metrics section */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-3 gap-4 mb-8"
                    >
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center transition-all hover:scale-105`}>
                            <div className={`${darkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600'} inline-flex items-center justify-center w-10 h-10 rounded-full mb-2`}>
                                <FaClock />
                            </div>
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="font-semibold">{workoutMetrics.duration}</p>
                        </div>
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center transition-all hover:scale-105`}>
                            <div className={`${darkMode ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-600'} inline-flex items-center justify-center w-10 h-10 rounded-full mb-2`}>
                                <FaFire />
                            </div>
                            <p className="text-sm text-gray-400">Calories</p>
                            <p className="font-semibold">{workoutMetrics.calories}</p>
                        </div>
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center transition-all hover:scale-105`}>
                            <div className={`${darkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600'} inline-flex items-center justify-center w-10 h-10 rounded-full mb-2`}>
                                <FaHeartbeat />
                            </div>
                            <p className="text-sm text-gray-400">Intensity</p>
                            <p className="font-semibold">{workoutMetrics.intensity}</p>
                        </div>
                    </motion.div>

                    {/* Equipment section */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-6"
                    >
                        <h3 className={`text-xl font-semibold mb-4 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2`}>
                            <FaDumbbell className="text-blue-500" /> Equipment Needed
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {equipmentNeeded.map((item, index) => (
                                <span 
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Steps section */}
                    <div className="mb-6">
                        <h3 className={`text-xl font-semibold mb-4 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2`}>
                            <FaRunning className="text-blue-500" /> Exercise Steps
                        </h3>
                        <ol className="space-y-3">
                            {selectedWorkout.steps.map((step, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                    className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'} flex items-start p-4 rounded-xl transition-all duration-300 hover:shadow-md`}
                                >
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full mr-3 mt-1">
                                        {index + 1}
                                    </span>
                                    <span>{step}</span>
                                </motion.li>
                            ))}
                        </ol>
                    </div>

                    {/* Start workout button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-4 font-semibold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${darkMode ? 'text-white' : 'text-white'} mb-2`}
                        style={{ backgroundColor: selectedWorkout.color }}
                    >
                        Start This Workout
                    </motion.button>
                    
                    {/* Save for later button */}
                    <button
                        className={`w-full py-3 font-medium rounded-xl transition-all duration-200 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        Save for Later
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default UserWorkoutDetail;








