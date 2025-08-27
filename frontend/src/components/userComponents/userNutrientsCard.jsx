import React from 'react'
import { useTheme } from '../../context/ThemeContext';
import {

    Calendar, Clock, Trash2, Edit3
} from 'lucide-react';
import {motion} from 'framer-motion'//eslint-disable-line no-unused-vars
const NutritionCard = ({ food, calories, protein, carbs, fat, time, date, onEdit, onDelete }) => {
    const { darkMode } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-semibold`}>{food}</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={onEdit}
                        className={`p-1 rounded-md ${darkMode ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-100'}`}
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className={`p-1 rounded-md ${darkMode ? 'text-red-400 hover:bg-red-900' : 'text-red-600 hover:bg-red-100'}`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
                <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                    <p className="text-sm font-medium">Cal</p>
                    <p className="font-bold">{calories}</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'}`}>
                    <p className="text-sm font-medium">Protein</p>
                    <p className="font-bold">{protein}g</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-100 text-yellow-800'}`}>
                    <p className="text-sm font-medium">Carbs</p>
                    <p className="font-bold">{carbs}g</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
                    <p className="text-sm font-medium">Fat</p>
                    <p className="font-bold">{fat}g</p>
                </div>
            </div>

            <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{time}</span>
                </div>
                <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>{date}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default NutritionCard;
