import React, { useState } from 'react'
import { FaArrowLeft, FaCheck, FaRunning, FaDumbbell, FaHeartbeat, FaYinYang, FaFistRaised } from 'react-icons/fa'
import { motion } from 'framer-motion'// eslint-disable-line no-unused-vars
import { Link, useNavigate } from 'react-router-dom'
import { Typewriter } from 'react-simple-typewriter'

const UserGoal = () => {
    const navigate = useNavigate();
    const [selectedGoals, setSelectedGoals] = useState([]);

    const goals = [
        {
            id: 1,
            title: 'Lose Weight',
            icon: <FaRunning className="text-xl" />,
            color: 'from-rose-500 to-pink-500',
            bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50'
        },
        {
            id: 2,
            title: 'Build Muscle',
            icon: <FaDumbbell className="text-xl" />,
            color: 'from-blue-500 to-indigo-500',
            bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50'
        },
        {
            id: 3,
            title: 'Improve Cardio',
            icon: <FaHeartbeat className="text-xl" />,
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50'
        },
        {
            id: 4,
            title: 'Improve Flexibility',
            icon: <FaYinYang className="text-xl" />,
            color: 'from-purple-500 to-violet-500',
            bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50'
        },
        {
            id: 5,
            title: 'Improve Strength',
            icon: <FaFistRaised className="text-xl" />,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50'
        },
    ];

    const toggleGoal = (goalId) => {
        if (selectedGoals.includes(goalId)) {
            setSelectedGoals(selectedGoals.filter(id => id !== goalId));
        } else {
            setSelectedGoals([...selectedGoals, goalId]);
        }
    };

    const handleContinue = () => {
        if (selectedGoals.length > 0) {
            // Here you would typically navigate to the next screen
            console.log("Selected goals:", selectedGoals);
            // navigate('/next-page');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
            <div className="w-full max-w-lg">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-4 text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 font-medium p-2 rounded-lg hover:bg-blue-50"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                    Back
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-2xl rounded-3xl p-8 w-full overflow-hidden relative"
                >
                    {/* Decorative header */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>

                    <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 mt-2">
                        <Typewriter
                            words={['Your Fitness Goals?']}
                            loop={1}
                            cursor
                            cursorStyle="_"
                            typeSpeed={70}
                            deleteSpeed={50}
                        />
                    </h2>
                    <p className="text-center text-gray-500 mb-8">Select one or more fitness goals:</p>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {goals.map((goal) => (
                            <motion.div
                                key={goal.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                    selectedGoals.includes(goal.id)
                                        ? `border-transparent bg-gradient-to-r ${goal.color} text-white`
                                        : `border-gray-200 ${goal.bgColor} hover:border-gray-300`
                                }`}
                                onClick={() => toggleGoal(goal.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`text-blue-500 p-3 rounded-lg ${
                                        selectedGoals.includes(goal.id)
                                            ? 'bg-white/20'
                                            : 'bg-white'
                                    }`}>
                                        {goal.icon}
                                    </div>
                                    <span className="text-gray-800 font-medium">{goal.title}</span>
                                </div>

                                {selectedGoals.includes(goal.id) && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                                    >
                                        <FaCheck className="text-green-500" />
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{
                            scale: selectedGoals.length > 0 ? 1.03 : 1,
                            boxShadow: selectedGoals.length > 0 ? "0 10px 25px -5px rgba(128, 90, 213, 0.5)" : "none"
                        }}
                        whileTap={{ scale: selectedGoals.length > 0 ? 0.98 : 1 }}
                        onClick={handleContinue}
                        disabled={selectedGoals.length === 0}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                            selectedGoals.length > 0
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Link to="/home">Continue</Link>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}

export default UserGoal;