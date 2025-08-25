import React, { useState } from 'react';
import { motion } from 'framer-motion';// eslint-disable-line no-unused-vars
import {
    Utensils, Plus, Search, Filter, Apple, Carrot, Drumstick, GlassWater,
    Calendar, Clock, Trash2, Edit3
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

// Nutrition Card Component
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

// Add Food Modal Component
const AddFoodModal = ({ isOpen, onClose, onAdd }) => {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        food: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.food || !formData.calories) return;

        onAdd({
            ...formData,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        });

        setFormData({ food: '', calories: '', protein: '', carbs: '', fat: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full max-w-md p-6 rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Add Food</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Food Name</label>
                        <input
                            type="text"
                            value={formData.food}
                            onChange={(e) => setFormData({ ...formData, food: e.target.value })}
                            placeholder="e.g., Grilled Chicken Salad"
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Calories</label>
                        <input
                            type="number"
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                            placeholder="Calories"
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {['protein', 'carbs', 'fat'].map((nutrient) => (
                            <div key={nutrient}>
                                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)} (g)
                                </label>
                                <input
                                    type="number"
                                    value={formData[nutrient]}
                                    onChange={(e) => setFormData({ ...formData, [nutrient]: e.target.value })}
                                    placeholder="0"
                                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Add Food</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const UserNutrients = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeal, setSelectedMeal] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [foods, setFoods] = useState([
        { id: 1, food: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 20, fat: 5, time: '08:30 AM', date: 'Oct 12, 2023', meal: 'breakfast' },
        { id: 2, food: 'Grilled Chicken Salad', calories: 320, protein: 35, carbs: 12, fat: 15, time: '01:15 PM', date: 'Oct 12, 2023', meal: 'lunch' },
        { id: 3, food: 'Protein Shake', calories: 220, protein: 25, carbs: 10, fat: 8, time: '04:30 PM', date: 'Oct 12, 2023', meal: 'snack' },
        { id: 4, food: 'Salmon with Vegetables', calories: 450, protein: 30, carbs: 25, fat: 22, time: '07:00 PM', date: 'Oct 12, 2023', meal: 'dinner' },
    ]);

    const mealTypes = [
        { id: 'all', name: 'All Meals', icon: <Utensils size={18} /> },
        { id: 'breakfast', name: 'Breakfast', icon: <Apple size={18} /> },
        { id: 'lunch', name: 'Lunch', icon: <Carrot size={18} /> },
        { id: 'dinner', name: 'Dinner', icon: <Drumstick size={18} /> },
        { id: 'snack', name: 'Snacks', icon: <GlassWater size={18} /> },
    ];

    const handleBack = () => navigate(-1);
    const getMealType = (hours) => {
      if (hours >= 5 && hours < 11) return 'breakfast';
      if (hours >= 11 && hours < 15) return 'lunch';
      if (hours >= 15 && hours < 18) return 'snack';
      return 'dinner';
    };

    const handleAddFood = (newFood) => {
        const newId = foods.length > 0 ? Math.max(...foods.map(f => f.id)) + 1 : 1;
        setFoods([
            ...foods,
            {
                id: newId,
                ...newFood,
                meal: getMealType(new Date().getHours()),
                calories: Number(newFood.calories),
                protein: Number(newFood.protein),
                carbs: Number(newFood.carbs),
                fat: Number(newFood.fat)
            }
        ]);
    };

    const handleDeleteFood = (id) => setFoods(foods.filter(f => f.id !== id));

    const filteredFoods = foods.filter(f =>
        f.food.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedMeal === 'all' || f.meal === selectedMeal)
    );

    const totals = foods.reduce((acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
        fat: acc.fat + f.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
        <div className={`min-h-screen pb-10 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Back Button */}
            <button
                onClick={handleBack}
                aria-label="Go Back"
                className={`fixed top-20 left-4 z-40 flex items-center px-3 py-2 space-x-1 rounded-full shadow-md border transition-all duration-200
          ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'}`}
            >
                <FaArrowLeft size={16} />
            </button>

            <div className="container mx-auto px-4 pt-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Nutrition Tracking</h1>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Track your meals and monitor your nutrition intake</p>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-xl p-6 mb-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {['calories', 'protein', 'carbs', 'fat'].map((nutrient, idx) => (
                            <div key={nutrient} className={`text-center p-4 rounded-lg ${darkMode ? ['bg-blue-900', 'bg-green-900', 'bg-yellow-900', 'bg-red-900'][idx] : ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-red-100'][idx]}`}>
                                <p className={`text-sm font-medium ${darkMode ? ['text-blue-200', 'text-green-200', 'text-yellow-200', 'text-red-200'][idx] : ['text-blue-800', 'text-green-800', 'text-yellow-800', 'text-red-800'][idx]}`}>
                                    {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                                </p>
                                <p className={`text-2xl font-bold ${darkMode ? ['text-blue-100', 'text-green-100', 'text-yellow-100', 'text-red-100'][idx] : ['text-blue-900', 'text-green-900', 'text-yellow-900', 'text-red-900'][idx]}`}>
                                    {totals[nutrient]}{nutrient !== 'calories' ? 'g' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Filters & Search */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-xl p-5 mb-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search size={18} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search foods..."
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Filter size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <select
                                value={selectedMeal}
                                onChange={e => setSelectedMeal(e.target.value)}
                                className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                            >
                                {mealTypes.map(meal => <option key={meal.id} value={meal.id}>{meal.name}</option>)}
                            </select>
                        </div>

                        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus size={18} />
                            <span>Add Food</span>
                        </button>
                    </div>

                    {/* Meal Type Filters */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {mealTypes.map(meal => (
                            <button
                                key={meal.id}
                                onClick={() => setSelectedMeal(meal.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${selectedMeal === meal.id
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {meal.icon}
                                <span>{meal.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Food List */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {selectedMeal === 'all' ? 'All Foods' : mealTypes.find(m => m.id === selectedMeal)?.name}
                    </h2>

                    {filteredFoods.length === 0 ? (
                        <div className={`text-center py-10 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <Utensils size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No foods found. Add your first meal!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredFoods.map(food => (
                                <NutritionCard key={food.id} {...food} onEdit={() => console.log('Edit', food.id)} onDelete={() => handleDeleteFood(food.id)} />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            <AddFoodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddFood} />
        </div>
    );
};

export default UserNutrients;
