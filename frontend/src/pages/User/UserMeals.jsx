import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';// eslint-disable-line no-unused-vars


const UserMeals = () => {
    const [selectedFood, setSelectedFood] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { darkMode } = useTheme();

    const foodList = [
        {
            "name": "Grilled Chicken Breast #1",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #2",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #3",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #4",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #5",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #6",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #7",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #8",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #9",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #10",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #11",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #12",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #13",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #14",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #15",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #16",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #17",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #18",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #19",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #20",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #21",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #22",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #23",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #24",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #25",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #26",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #27",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #28",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #29",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #30",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #31",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #32",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #33",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #34",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #35",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #36",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #37",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #38",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #39",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #40",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #41",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #42",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #43",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #44",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #45",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #46",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #47",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #48",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #49",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #50",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #51",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #52",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #53",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #54",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #55",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #56",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #57",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #58",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #59",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #60",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #61",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #62",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #63",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #64",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #65",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #66",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #67",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #68",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #69",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #70",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #71",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #72",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #73",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #74",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #75",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #76",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #77",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #78",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #79",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #80",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #81",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #82",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #83",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #84",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #85",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #86",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #87",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #88",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #89",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #90",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #91",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #92",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #93",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #94",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #95",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #96",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #97",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #98",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #99",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #100",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #101",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #102",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #103",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #104",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #105",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #106",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #107",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #108",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #109",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #110",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #111",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #112",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #113",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #114",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #115",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #116",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #117",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #118",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #119",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #120",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #121",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #122",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #123",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #124",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #125",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #126",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #127",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #128",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #129",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #130",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #131",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #132",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #133",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #134",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #135",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #136",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #137",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #138",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #139",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #140",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #141",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #142",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #143",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #144",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #145",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #146",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #147",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #148",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #149",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #150",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #151",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #152",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #153",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #154",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #155",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #156",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #157",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #158",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #159",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #160",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #161",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #162",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #163",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #164",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #165",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #166",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #167",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #168",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #169",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #170",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #171",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #172",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #173",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #174",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #175",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #176",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #177",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #178",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #179",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #180",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #181",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #182",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #183",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #184",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #185",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #186",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #187",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #188",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #189",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #190",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #191",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #192",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #193",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #194",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #195",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        },
        {
            "name": "Grilled Chicken Breast #196",
            "calories": 165,
            "fat": "3.6g",
            "protein": "31g",
            "carbs": "0g",
            "vitamins": "Vitamin B6, Vitamin B12, Niacin",
            "recipe": "Step 1: Season chicken with salt, pepper, and herbs. Step 2: Grill over medium heat for 6-7 minutes per side until cooked through."
        },
        {
            "name": "Avocado Toast #197",
            "calories": 250,
            "fat": "14g",
            "protein": "6g",
            "carbs": "28g",
            "vitamins": "Vitamin K, Folate, Vitamin E",
            "recipe": "Step 1: Toast whole grain bread. Step 2: Mash avocado with lemon juice, salt, and chili flakes. Step 3: Spread on toast."
        },
        {
            "name": "Quinoa Salad #198",
            "calories": 222,
            "fat": "6g",
            "protein": "8g",
            "carbs": "34g",
            "vitamins": "Folate, Magnesium, Vitamin E",
            "recipe": "Step 1: Cook quinoa and let cool. Step 2: Mix with chopped cucumbers, tomatoes, onions, and lemon vinaigrette."
        },
        {
            "name": "Greek Yogurt with Berries #199",
            "calories": 150,
            "fat": "2g",
            "protein": "12g",
            "carbs": "18g",
            "vitamins": "Calcium, Vitamin B2, Vitamin B12",
            "recipe": "Step 1: Scoop Greek yogurt into a bowl. Step 2: Top with fresh berries and a drizzle of honey."
        },
        {
            "name": "Oatmeal with Almonds and Banana #200",
            "calories": 300,
            "fat": "8g",
            "protein": "7g",
            "carbs": "45g",
            "vitamins": "Vitamin B1, Iron, Magnesium",
            "recipe": "Step 1: Cook oats in milk or water. Step 2: Top with sliced banana, almonds, and a sprinkle of cinnamon."
        }
    ]; 
    const handlePress = (food) => {
        setSelectedFood(food);
        setModalVisible(true);
    };

    return (
        <div className={`min-h-screen p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
            <h1 className="text-3xl font-bold mb-6">Healthy Food Suggestions</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foodList.map((food, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-lg shadow-md p-4 cursor-pointer transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                            }`}
                        onClick={() => handlePress(food)}
                    >
                        <h3 className="text-lg font-semibold">{food.name}</h3>
                        <div className="mt-2 flex justify-between text-sm">
                            <span>{food.calories} cal</span>
                            <span>{food.protein} protein</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {modalVisible && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={`rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
                            }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6">
                            {selectedFood && (
                                <>
                                    <h2 className="text-2xl font-bold mb-4">{selectedFood.name}</h2>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                            <p className="text-sm">Calories</p>
                                            <p className="font-semibold">{selectedFood.calories}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300">
                                            <p className="text-sm">Protein</p>
                                            <p className="font-semibold">{selectedFood.protein}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300">
                                            <p className="text-sm">Carbs</p>
                                            <p className="font-semibold">{selectedFood.carbs}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-300">
                                            <p className="text-sm">Fat</p>
                                            <p className="font-semibold">{selectedFood.fat}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-2">Vitamins & Minerals</h3>
                                        <p>{selectedFood.vitamins}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Recipe</h3>
                                        <p className="whitespace-pre-line">{selectedFood.recipe}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 rounded-b-lg">
                            <button
                                onClick={() => setModalVisible(false)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default UserMeals;


