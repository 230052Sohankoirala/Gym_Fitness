import Nutrition from "../models/Nutrition.js";


/**
 * @desc Add a nutrition log
 * @route POST /api/nutrition
 * @access Private
 */
export const addNutrition = async (req, res) => {
    try {
        const { food, calories, protein, carbs, fat, time, date } = req.body;

        if (!food || !calories || !protein || !carbs || !fat || !time || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const nutrition = await Nutrition.create({
            user: req.user.id,
            food,
            calories,
            protein,
            carbs,
            fat,
            time,
            date
        });

        res.status(201).json(nutrition);


    } catch (error) {
        res.status(500).json({ message: error.message });


    }
}
/**
 * @desc Get logged-in user’s nutrition logs
 * @route GET /api/nutrition
 * @access Private
 */

export const getNutrition = async (req, res) => {
    try {
        const nutrition = await Nutrition.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(nutrition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteNutrition = async (req, res) => {
    try {
        const nutrition = await Nutrition.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!nutrition) return res.status(404).json({ message: "Nutrition not found" });

        res.json({ message: "Nutrition deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const updateNutrition = async (req, res) => {
    try {
        const nutrition = await Nutrition.findOne({ _id: req.params.id, user: req.user.id });
        if (!nutrition) return res.status(404).json({ message: "Nutrition not found" });

        nutrition.food = req.body.food || nutrition.food;
        nutrition.calories = req.body.calories || nutrition.calories;
        nutrition.protein = req.body.protein || nutrition.protein;
        nutrition.carbs = req.body.carbs || nutrition.carbs;
        nutrition.fat = req.body.fat || nutrition.fat;
        nutrition.time = req.body.time || nutrition.time;
        nutrition.date = req.body.date || nutrition.date;
        await nutrition.save();

        res.json(nutrition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}