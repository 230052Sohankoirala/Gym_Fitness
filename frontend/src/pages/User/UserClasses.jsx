import { motion } from 'framer-motion';// eslint-disable-line no-unused-vars
import { useTheme } from '../../context/ThemeContext';
import { MessageCircle, Star, Calendar, Clock, Users, MapPin, CreditCard, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const UserClasses = () => {
    const { darkMode } = useTheme();

    const trainers = [
        {
            id: 1,
            name: "Sohan Koirala",
            img: "/trainer1.jpg",
            speciality: "Yoga",
            rating: 4.5,
            bio: "Certified yoga instructor with 8 years of experience specializing in Hatha and Vinyasa flow.",
            experience: "8 years",
            availableSlots: [
                { date: "2023-06-15", times: ["09:00", "11:00", "15:00"] },
                { date: "2023-06-16", times: ["10:00", "14:00", "16:00"] }
            ]
        },
        {
            id: 2,
            name: "Anita Sharma",
            img: "/trainer2.jpg",
            speciality: "Pilates",
            rating: 4.7,
            bio: "Pilates expert focused on core strength and rehabilitation with a holistic approach to fitness.",
            experience: "6 years",
            availableSlots: [
                { date: "2023-06-15", times: ["08:00", "12:00", "17:00"] },
                { date: "2023-06-16", times: ["09:00", "13:00", "18:00"] }
            ]
        },
        {
            id: 3,
            name: "Rajesh Thapa",
            img: "/trainer3.jpg",
            speciality: "Strength Training",
            rating: 4.8,
            bio: "Strength and conditioning coach helping clients build muscle and improve athletic performance.",
            experience: "10 years",
            availableSlots: [
                { date: "2023-06-15", times: ["07:00", "12:00", "19:00"] },
                { date: "2023-06-16", times: ["08:00", "13:00", "18:00"] }
            ]
        },
        {
            id: 4,
            name: "Priya Khatri",
            img: "/trainer4.jpg",
            speciality: "Cardio",
            rating: 4.6,
            bio: "Cardio specialist creating high-energy workouts that maximize calorie burn and endurance.",
            experience: "5 years",
            availableSlots: [
                { date: "2023-06-15", times: ["06:00", "10:00", "16:00"] },
                { date: "2023-06-16", times: ["07:00", "11:00", "17:00"] }
            ]
        },
        {
            id: 5,
            name: "Suman Gurung",
            img: "/trainer5.jpg",
            speciality: "Crossfit",
            rating: 4.9,
            bio: "CrossFit Level 2 trainer with competition experience focused on functional movement at high intensity.",
            experience: "7 years",
            availableSlots: [
                { date: "2023-06-15", times: ["05:00", "09:00", "17:00"] },
                { date: "2023-06-16", times: ["06:00", "10:00", "16:00"] }
            ]
        }
    ];

    const classes = [
        {
            id: 1,
            name: "Morning Yoga",
            trainer: "Sohan Koirala",
            trainerId: 1,
            duration: "60 mins",
            price: "Membership",
            description: "Start your day with a peaceful yoga session that focuses on breathing, flexibility, and mindfulness.",
            intensity: "Moderate",
            capacity: 15,
            location: "Studio A"
        },
        {
            id: 2,
            name: "Evening Yoga",
            trainer: "Sohan Koirala",
            trainerId: 1,
            duration: "45 mins",
            price: "Membership",
            description: "Wind down your day with a relaxing yoga flow that releases tension and prepares you for restful sleep.",
            intensity: "Light",
            capacity: 12,
            location: "Studio A"
        },
        {
            id: 3,
            name: "Pilates Basics",
            trainer: "Anita Sharma",
            trainerId: 2,
            duration: "50 mins",
            price: "Membership",
            description: "Learn the fundamentals of Pilates with a focus on core strength, posture, and controlled movements.",
            intensity: "Moderate",
            capacity: 10,
            location: "Studio B"
        },
        {
            id: 4,
            name: "Strength Training 101",
            trainer: "Rajesh Thapa",
            trainerId: 3,
            duration: "55 mins",
            price: "Membership",
            description: "Build functional strength using free weights and resistance training with proper form guidance.",
            intensity: "High",
            capacity: 8,
            location: "Weight Room"
        },
        {
            id: 5,
            name: "Cardio Blast",
            trainer: "Priya Khatri",
            trainerId: 4,
            duration: "40 mins",
            price: "Membership",
            description: "High-intensity cardio workout that combines intervals, circuits, and endurance training.",
            intensity: "High",
            capacity: 20,
            location: "Studio C"
        },
        {
            id: 6,
            name: "Crossfit Challenge",
            trainer: "Suman Gurung",
            trainerId: 5,
            duration: "55 mins",
            price: "Membership",
            description: "Functional movements performed at high intensity in a group setting with constant variation.",
            intensity: "Very High",
            capacity: 12,
            location: "Crossfit Area"
        }
    ];

    // State management
    const [membershipStatus, setMembershipStatus] = useState(Array(classes.length).fill(false));
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [bookingStep, setBookingStep] = useState(0); // 0: not booking, 1: select time, 2: confirm
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [enrollmentStep, setEnrollmentStep] = useState(0); // 0: not enrolling, 1: confirm enrollment

    // Handle booking a trainer
    const handleBookTrainer = (trainer) => {
        setSelectedTrainer(trainer);
        setBookingStep(1);
        setSelectedDate(trainer.availableSlots[0].date);
    };

    // Handle enrolling in a class
    const handleEnrollClass = (cls) => {
        setSelectedClass(cls);
        setEnrollmentStep(1);
    };

    // Complete booking process
    const completeBooking = () => {
        // In a real app, you would save this booking to a database
        alert(`Booking confirmed with ${selectedTrainer.name} on ${selectedDate} at ${selectedTime}`);
        setBookingStep(0);
        setSelectedTrainer(null);
    };

    // Complete enrollment process
    const completeEnrollment = () => {
        // In a real app, you would save this enrollment to a database

        // Update membership status for this class
        const classIndex = classes.findIndex(c => c.id === selectedClass.id);
        setMembershipStatus(prev => {
            const newStatus = [...prev];
            newStatus[classIndex] = true;
            return newStatus;
        });
        setEnrollmentStep(0);
        setSelectedClass(null);
    };

    // Handle buying membership
    const handleBuyMembership = (index) => {
        setMembershipStatus(prevStatus => {
            return prevStatus.map((status, i) => {
                if (i === index) {
                    return !status;
                } else {
                    return status;
                }
            })
        });
    };

    return (
        <>
            {/* Booking Modal */}
            {bookingStep > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Book {selectedTrainer.name}</h3>
                            <button onClick={() => setBookingStep(0)} className="p-1">
                                <X size={24} />
                            </button>
                        </div>

                        {bookingStep === 1 && (
                            <>
                                <div className="mb-4">
                                    <label className="block mb-2 font-medium">Select Date</label>
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className={`w-full p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                                    >
                                        {selectedTrainer.availableSlots.map(slot => (
                                            <option key={slot.date} value={slot.date}>
                                                {new Date(slot.date).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-medium">Available Times</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedTrainer.availableSlots
                                            .find(slot => slot.date === selectedDate)?.times
                                            .map(time => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`p-2 rounded-lg text-center ${selectedTime === time
                                                        ? 'bg-blue-500 text-white'
                                                        : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setBookingStep(2)}
                                    disabled={!selectedTime}
                                    className={`w-full py-3 rounded-lg font-medium ${!selectedTime
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white`}
                                >
                                    Continue to Confirm
                                </button>
                            </>
                        )}

                        {bookingStep === 2 && (
                            <>
                                <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <h4 className="font-bold mb-2">Booking Summary</h4>
                                    <p>Trainer: {selectedTrainer.name}</p>
                                    <p>Date: {new Date(selectedDate).toLocaleDateString()}</p>
                                    <p>Time: {selectedTime}</p>
                                    <p className="mt-2 font-medium">Duration: 60 minutes</p>
                                    <p className="font-medium">Price: $50</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-medium">Payment Method</label>
                                    <div className={`p-3 rounded-lg flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <CreditCard size={20} className="mr-2" />
                                        <span>Credit Card ending in 4567</span>
                                    </div>
                                </div>

                                <button
                                    onClick={completeBooking}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium text-white"
                                >
                                    Confirm Booking
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Enrollment Modal */}
            {enrollmentStep > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`${darkMode ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>Enroll in {selectedClass.name}</h3>
                            <button onClick={() => setEnrollmentStep(0)} className="p-1">
                                <X size={24} />
                            </button>
                        </div>

                        <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-700 ' : 'bg-gray-100 text-black'}`}>
                            <h4 className="font-bold mb-2">Class Details</h4>
                            <p>Trainer: {selectedClass.trainer}</p>
                            <p>Duration: {selectedClass.duration}</p>
                            <p>Intensity: {selectedClass.intensity}</p>
                            <p>Location: {selectedClass.location}</p>
                            <p className="mt-2">{selectedClass.description}</p>
                        </div>
                        <Link to={`class/${selectedClass.id}`}>
                            <button
                                onClick={completeEnrollment}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium text-white"
                            >
                                Enroll
                            </button>
                        </Link>
                    </motion.div>
                </div>
            )}

            <h1 className={`${darkMode ? 'text-white' : 'text-gray-800'} text-3xl font-bold text-center mt-12 mb-12`}>
                Available Trainers
            </h1>

            <motion.section
                className={`p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
            >
                {trainers.map((trainer, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className={`rounded-xl overflow-hidden flex flex-col transition-colors duration-200 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <img
                            src={trainer.img}
                            alt={trainer.name}
                            className="w-full h-48 object-cover rounded-t-xl"
                        />
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{trainer.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                                    {trainer.speciality} • {trainer.experience} experience
                                </p>
                                <div className="flex items-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={
                                                i < Math.floor(trainer.rating)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                            }
                                        />
                                    ))}
                                    <span className="ml-2 text-sm font-medium">
                                        {trainer.rating.toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-sm mt-2 line-clamp-3">{trainer.bio}</p>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleBookTrainer(trainer)}
                                    className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <Calendar size={16} /> Book
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-md hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={16} />
                                    <Link to={`/chat/${trainer.id}`} state={{
                                        trainer
                                    }}>Chat</Link>
                                </motion.button>

                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.section>

            <h1 className={`${darkMode ? 'text-white' : 'text-gray-800'} text-3xl font-bold text-center mt-16 mb-12`}>
                Classes
            </h1>

            <motion.section
                className={`p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
            >
                {classes.map((cls, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className={`rounded-xl overflow-hidden p-5 flex flex-col justify-between transition-colors duration-200 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    >
                        <div>
                            <h3 className="text-xl font-semibold mb-1">{cls.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                                Trainer: {cls.trainer}
                            </p>
                            <div className="flex items-center gap-4 text-sm my-3">
                                <span className="flex items-center gap-1">
                                    <Clock size={16} /> {cls.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={16} /> {cls.capacity} spots
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={16} /> {cls.location}
                                </span>
                            </div>
                            <p className="text-sm my-3">{cls.description}</p>
                            <div className="my-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls.intensity === "Light" ? "bg-green-100 text-green-800" :
                                    cls.intensity === "Moderate" ? "bg-yellow-100 text-yellow-800" :
                                        cls.intensity === "High" ? "bg-orange-100 text-orange-800" :
                                            "bg-red-100 text-red-800"
                                    }`}>
                                    Intensity: {cls.intensity}
                                </span>
                            </div>
                        </div>

                        {membershipStatus[index] ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEnrollClass(cls)}
                                className="mt-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition"
                            >
                                Enroll Now
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBuyMembership(index)}
                                className="mt-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-md hover:from-green-600 hover:to-green-700 transition"
                            >
                                Buy Membership
                            </motion.button>
                        )}
                    </motion.div>
                ))}
            </motion.section>
        </>
    );
};

export default UserClasses;