import React, { useState } from 'react';
import { motion } from 'framer-motion';// eslint-disable-line no-unused-vars
import {
  Dumbbell, Utensils, BarChart3, Clock, Target, Award, Heart,
  Flame, ChevronRight, Plus, Moon, Sun,
  Play,
  Activity,
  Trophy,
  CalendarDays
} from 'lucide-react';
import UserTaskBoard from '../../components/userComponents/userTaskBoard';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { GiWaterDrop } from 'react-icons/gi';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -5, transition: { duration: 0.2 } }
};

// StatsCard
const StatsCard = ({ icon, value, label, color }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`p-4 rounded-xl shadow-sm border transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} text-white`}>{icon}</div>
        <div className="ml-4">
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value}</h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

// WorkoutPlanCard
const WorkoutPlanCard = ({ title, time, exercises, progress, color }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`p-5 rounded-xl shadow-sm border transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
          <div className={`flex items-center mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{time}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{progress}%</div>
      </div>
      <div className="mt-4">
        <div className={`flex justify-between text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <motion.div
            className={`h-2 rounded-full ${progress >= 70 ? 'bg-green-500' : progress >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}   // <-- fix here
            transition={{ duration: 1 }}
          />

        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {exercises} exercises</span>
        <button className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};


// ActivityItem
const ActivityItem = ({ icon, title, time, value, unit }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`flex items-center py-3 border-b transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"} last:border-0`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>{icon}</div>
      <div className="ml-4 flex-1">
        <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h4>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{time}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{value}</p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{unit}</p>
      </div>
    </motion.div>
  );
};

// QuickAction
const QuickAction = ({ icon, title, description, color, onClick }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      className={`p-4 rounded-xl shadow-sm border transition-colors duration-200 cursor-pointer h-full ${
        darkMode ? "bg-gray-800 hover:bg-gray-750" : "bg-white hover:bg-gray-50"
      }`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className={`p-2 rounded-lg ${color} text-white w-10 h-10 flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h3 className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
    </motion.div>
  );
};

const UserHomePage = () => {
  const [activeTab, setActiveTab] = useState('today');
  const { darkMode } = useTheme();

  const userStats = [
    { icon: <Flame size={20} />, value: '2,347', label: 'Calories Burned', color: 'bg-orange-500' },
    { icon: <Target size={20} />, value: '78%', label: 'Goals Completed', color: 'bg-green-500' },
    { icon: <Award size={20} />, value: '12', label: 'Workout Streak', color: 'bg-purple-500' },
    { icon: <GiWaterDrop size={20} />, value: '4L', label: 'Water Intake Daily', color: 'bg-blue-500' },
  ];

  const workoutPlans = [
    { title: 'Upper Body Strength', time: '45 mins', exercises: 8, progress: 75, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    { title: 'Cardio Blast', time: '30 mins', exercises: 5, progress: 40, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
    { title: 'Yoga & Flexibility', time: '60 mins', exercises: 10, progress: 20, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' }
  ];

  const recentActivities = [
    { icon: <Dumbbell size={16} />, title: 'Chest Workout', time: 'Today, 9:30 AM', value: 45, unit: 'mins' },
    { icon: <Utensils size={16} />, title: 'Breakfast logged', time: 'Today, 8:15 AM', value: 420, unit: 'cal' },
    { icon: <BarChart3 size={16} />, title: 'Weight recorded', time: 'Yesterday, 8:00 AM', value: 165, unit: 'lbs' }
  ];

  const quickActions = [
    {
      icon: <Play size={20} />,
      title: 'Start Workout',
      description: 'Begin a new exercise session',
      color: 'bg-blue-500',
      link: '/workouts'
    },
    {
      icon: <Utensils size={20} />,
      title: 'Log Nutrition',
      description: 'Track meals & calories',
      color: 'bg-green-500',
      link: '/nutrition'
    },


    {
      icon: <Activity size={20} />,
      title: 'Track Progress',
      description: 'Record measurements',
      color: 'bg-orange-500',
      link: '/progress'
    },
    {
      icon: <Trophy size={20} />,
      title: 'Join Challenge',
      description: '7-day fitness challenge',
      color: 'bg-red-500',
      link: '/challenges'
    },
    {
      icon: <CalendarDays size={20} />,
      title: 'Schedule',
      description: 'Plan your workouts',
      color: 'bg-indigo-500',
      link: '/schedule'
    }

  ];
  const handleQuickAction = (link) => {
    // Navigate to the respective page
    window.location.href = link;
  };
  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      <main className="container mx-auto px-4 pt-2 pb-6">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Welcome back, Alex!</h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Here's your fitness overview for today</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {userStats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-xl shadow-sm p-5 border transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Your Workout Plans</h2>
                <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutPlans.map((plan, i) => <WorkoutPlanCard key={i} {...plan} />)}
              </div>
            </div>

            <div className={`rounded-xl shadow-sm p-5 border transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Quick Actions</h2>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get started quickly</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action, i) => (
                  <QuickAction
                    key={i}
                    {...action}
                    onClick={() => handleQuickAction(action.link)}
                  />
                ))}
              </div>
            </div>


            <UserTaskBoard />
          </div>

          <div className="sticky top-32">
            <div className={`rounded-xl shadow-sm p-5 border transition-colors duration-200 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-6`}>Recent Activity</h2>
              <div className={`flex space-x-4 border-b mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button className={`pb-2 px-1 font-medium text-sm ${activeTab === 'today' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('today')}>Today</button>
                <button className={`pb-2 px-1 font-medium text-sm ${activeTab === 'week' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('week')}>This Week</button>
              </div>
              {recentActivities.map((activity, i) => <ActivityItem key={i} {...activity} />)}
              <Link to={'/recentActivity'}>
                <motion.button className={`w-full mt-4 py-2 text-center text-blue-600 dark:text-blue-400 font-medium text-sm border rounded-lg transition-colors ${darkMode ? 'border-blue-700 hover:bg-blue-900' : 'border-blue-200 hover:bg-blue-50'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>View All Activity</motion.button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserHomePage;

