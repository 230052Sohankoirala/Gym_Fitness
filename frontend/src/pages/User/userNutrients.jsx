import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
    Utensils, Plus, Search, Filter, Apple, Carrot, Drumstick, GlassWater,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import NutritionCard from '../../components/userComponents/userNutrientsCard';

// 🔹 Modal for adding new food
const AddFoodModal = ({ isOpen, onClose, onAdd }) => {
    const { darkMode } = useTheme();
    const [formData, setFormData] = useState({
        food: '', calories: '', protein: '', carbs: '', fat: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.food || !formData.calories) return;

        await onAdd({
            ...formData,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
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
                className={`w-full max-w-md p-6 rounded-xl shadow-xl transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Add Food</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Food name */}
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

                    {/* Nutrients */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['calories', 'protein', 'carbs', 'fat'].map(nutrient => (
                            <div key={nutrient}>
                                <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                                </label>
                                <input
                                    type="number"
                                    value={formData[nutrient]}
                                    onChange={(e) => setFormData({ ...formData, [nutrient]: e.target.value })}
                                    placeholder="0"
                                    className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                            Add Food
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// 🔹 Main page
const UserNutrients = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const handleBack = () => navigate("/home");

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeal, setSelectedMeal] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [foods, setFoods] = useState([]);

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // Fetch foods from backend
    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const { data } = await axios.get("http://localhost:4000/api/nutrition", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFoods(data);
            } catch (err) {
                console.error("Error fetching foods", err);
            }
        };
        fetchFoods();
    }, [token]);

    // Meal categories
    const mealTypes = [
        { id: 'all', name: 'All Meals', icon: <Utensils size={18} /> },
        { id: 'breakfast', name: 'Breakfast', icon: <Apple size={18} /> },
        { id: 'lunch', name: 'Lunch', icon: <Carrot size={18} /> },
        { id: 'dinner', name: 'Dinner', icon: <Drumstick size={18} /> },
        { id: 'snack', name: 'Snacks', icon: <GlassWater size={18} /> },
    ];

    const getMealType = (hours) => {
        if (hours >= 5 && hours < 11) return 'breakfast';
        if (hours >= 11 && hours < 15) return 'lunch';
        if (hours >= 15 && hours < 18) return 'snack';
        return 'dinner';
    };

    // Add food (API call)
    const handleAddFood = async (newFood) => {
        try {
            const { data } = await axios.post("http://localhost:4000/api/nutrition",
                { ...newFood, meal: getMealType(new Date().getHours()) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFoods((prev) => [...prev, data]);
        } catch (err) {
            console.error("Error adding food", err);
        }
    };

    // Delete food (API call)
    const handleDeleteFood = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/api/nutrition/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFoods((prev) => prev.filter((f) => f._id !== id));
        } catch (err) {
            console.error("Error deleting food", err);
        }
    };

    // Filter foods
    const filteredFoods = foods.filter(f =>
        f.food.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedMeal === 'all' || f.meal === selectedMeal)
    );

    // Totals
    const totals = foods.reduce((acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
        fat: acc.fat + f.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
        <div className={`min-h-screen pb-10 transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 pt-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <button
                        onClick={handleBack}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 
            ${darkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:scale-105`}
                    >
                        <FaArrowLeft size={16} className="mr-2" />
                        Back
                    </button>

                    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                        <h1 className={`text-3xl font-extrabold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                            Nutrition Tracking
                        </h1>
                        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Track your meals and monitor your nutrition intake
                        </p>
                    </div>
                </motion.div>

                {/* Totals */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-2xl p-6 mb-6 shadow-lg transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {['calories', 'protein', 'carbs', 'fat'].map((nutrient, idx) => (
                            <div key={nutrient} className={`text-center p-4 rounded-xl transition-colors duration-200 ${darkMode ? ['bg-blue-900', 'bg-green-900', 'bg-yellow-900', 'bg-red-900'][idx] : ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-red-100'][idx]} shadow-md`}>
                                <p className={`text-sm font-medium transition-colors duration-200 ${darkMode ? ['text-blue-200', 'text-green-200', 'text-yellow-200', 'text-red-200'][idx] : ['text-blue-800', 'text-green-800', 'text-yellow-800', 'text-red-800'][idx]}`}>
                                    {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                                </p>
                                <p className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? ['text-blue-100', 'text-green-100', 'text-yellow-100', 'text-red-100'][idx] : ['text-blue-900', 'text-green-900', 'text-yellow-900', 'text-red-900'][idx]}`}>
                                    {totals[nutrient]}{nutrient !== 'calories' ? 'g' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Filters & Search */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-2xl p-6 mb-6 shadow-lg transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={18} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search foods..."
                                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                            />
                        </div>

                        {/* Dropdown */}
                        <div className="flex items-center space-x-2">
                            <Filter size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <select
                                value={selectedMeal}
                                onChange={e => setSelectedMeal(e.target.value)}
                                className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${darkMode ? 'bg-gray-700 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
                            >
                                {mealTypes.map(meal => <option key={meal.id} value={meal.id}>{meal.name}</option>)}
                            </select>
                        </div>

                        {/* Add food */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <Plus size={18} /> Add Food
                        </button>
                    </div>

                    {/* Quick Meal Type Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {mealTypes.map(meal => (
                            <button
                                key={meal.id}
                                onClick={() => setSelectedMeal(meal.id)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${selectedMeal === meal.id
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {meal.icon}<span>{meal.name}</span>
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
                        <div className={`text-center py-10 rounded-xl shadow-md  transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <Utensils size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No foods found. Add your first meal!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredFoods.map(food => (
                                <NutritionCard
                                    key={food._id}
                                    {...food}
                                    onEdit={() => console.log('Edit', food._id)}
                                    onDelete={() => handleDeleteFood(food._id)}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Add Food Modal */}
            <AddFoodModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddFood}
            />
        </div>
    );
};

export default UserNutrients;
