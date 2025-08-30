import React, { useState } from 'react';
import { motion } from 'framer-motion';// eslint-disable-line no-unused-vars
import { useTheme } from '../../context/ThemeContext';
import { MessageCircle, Star } from 'lucide-react';

const UserClasses = () => {
    const { darkMode } = useTheme();
    const [paid, setPaid] = useState(false);

    const trainers = [
        { name: "Sohan Koirala", img: "...", speciality: "Yoga", rating: 4.5 },
        { name: "Anita Sharma", img: "...", speciality: "Pilates", rating: 4.7 },
        { name: "Rajesh Thapa", img: "...", speciality: "Strength Training", rating: 4.8 },
        { name: "Priya Khatri", img: "...", speciality: "Cardio", rating: 4.6 },
        { name: "Suman Gurung", img: "...", speciality: "Crossfit", rating: 4.9 }
    ];

    const classes = [
        { name: "Morning Yoga", trainer: "Sohan Koirala", duration: "60 mins",price: "Membership" },
        { name: "Evening Yoga", trainer: "Sohan Koirala", duration: "45 mins" ,price: "Membership"},
        { name: "Pilates Basics", trainer: "Anita Sharma", duration: "50 mins",price: "Membership" },
        { name: "Strength Training 101", trainer: "Rajesh Thapa", duration: "55 mins" ,price: "Membership"},
        { name: "Cardio Blast", trainer: "Priya Khatri", duration: "40 mins" ,price: "Membership"},
        { name: "Crossfit Challenge", trainer: "Suman Gurung", duration: "55 mins",price: "Membership" }
    ];

    // If not paid, show Pay button
    if (!paid) {
        return (
            <div className={`flex items-center justify-center min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`w-full max-w-md p-8 top-0 rounded-2xl transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-2xl'} `}
                >
                    <h1 className={`text-3xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Unlock Trainers & Classes
                    </h1>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-10 text-center `}>
                        Access all our trainers and classes by completing the payment. Start your fitness journey today!
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                        onClick={() => setPaid(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" />
                        </svg>
                        Pay to Unlock
                    </motion.button>
                    
                </motion.div>
            </div>

        );
    }

    // Paid content
    return (
        <>
             <h1 className={`${darkMode ? 'text-white' : 'text-gray-800'} text-3xl font-bold text-center mb-12`}>Available Trainers</h1>
            <motion.section className={`p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {trainers.map((trainer, index) => (
                    <motion.div
                        key={index}
                       
                        className={`rounded-xl overflow-hidden flex flex-col transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <img src={trainer.img} alt={trainer.name} className="w-full h-48 object-cover rounded-t-xl" />
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{trainer.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">{trainer.speciality}</p>
                                <div className="flex items-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < Math.floor(trainer.rating) ? 'text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm font-medium">{trainer.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition"
                                >
                                    View Profile
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-md hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} /> Message
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.section>

            <h1 className={`${darkMode ? 'text-white' : 'text-gray-800'} text-3xl font-bold text-center mb-12`}>Classes</h1>
            <motion.section className={`p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {classes.map((cls, index) => (
                    <motion.div
                        key={index}
                       
                        className={`rounded-xl overflow-hidden p-5 flex flex-col justify-between transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <h3 className="text-xl font-semibold mb-1">{cls.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">Trainer: {cls.trainer}</p>
                        <p className="text-sm font-medium">Duration: {cls.duration}</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className={` mt-3 flex-1 py-2 ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'} rounded-lg font-medium shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2`}
                        
                        >
                         <h1 className="text-md font-normal">Buy{cls.price}</h1>

                        </motion.button>
                    </motion.div>
                ))}
            </motion.section>
        </>
    );
};

export default UserClasses;
