import WorkoutPlanUsage from "../models/WorkoutPlanUsage.js";
import { getActiveMembership } from "../utils/membershipChecker.js";

const FREE_DAILY_LIMIT = 2;

/**
 * Returns local-safe daily key in YYYY-MM-DD.
 */
const getDateKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

/**
 * Small helper to normalize incoming text.
 */
const normalizeText = (value) => {
    return String(value || "").trim().toLowerCase();
};

/**
 * Shuffle array safely.
 */
const shuffleArray = (array) => {
    const cloned = [...array];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
};

/**
 * Returns number of working exercises based on workout duration.
 */
const getExerciseCountByDuration = (duration) => {
    const safeDuration = Number(duration) || 30;

    if (safeDuration <= 20) return 4;
    if (safeDuration <= 30) return 5;
    if (safeDuration <= 45) return 6;
    return 7;
};

/**
 * Exercise database.
 * Each exercise includes supported goals, levels, and equipment.
 */
const EXERCISE_LIBRARY = {
    chest: [
        {
            name: "Barbell Bench Press",
            equipment: ["barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "strength", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "8-12",
                strength: "4-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Incline Dumbbell Press",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Decline Bench Press",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "4-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Push Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Chest Fly",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Cable Fly",
            equipment: ["machine", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Dips",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Machine Chest Press",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
    ],

    back: [
        {
            name: "Lat Pulldown",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Pull Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-8",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Seated Cable Row",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "One Arm Dumbbell Row",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Deadlift",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "6-8",
                strength: "3-5",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "90 sec",
                strength: "120 sec",
                fat_loss: "60 sec",
                general_fitness: "75 sec",
            },
        },
        {
            name: "T-Bar Row",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Face Pull",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Inverted Row",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
    ],

    legs: [
        {
            name: "Barbell Squat",
            equipment: ["barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["strength", "muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "8-12",
                strength: "4-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "120 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Leg Press",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "6-8",
                fat_loss: "15-20",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Walking Lunges",
            equipment: ["dumbbell", "bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10 each leg",
                strength: "8 each leg",
                fat_loss: "12 each leg",
                general_fitness: "10 each leg",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Romanian Deadlift",
            equipment: ["barbell", "dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "75 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Bulgarian Split Squat",
            equipment: ["dumbbell", "bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10 each leg",
                strength: "8 each leg",
                fat_loss: "12 each leg",
                general_fitness: "10 each leg",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Hamstring Curl",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Leg Extension",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Calf Raises",
            equipment: ["machine", "bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 4, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "15-20",
                strength: "12-15",
                fat_loss: "20-25",
                general_fitness: "15-20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
    ],

    shoulders: [
        {
            name: "Shoulder Press",
            equipment: ["dumbbell", "barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "strength", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Arnold Press",
            equipment: ["dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Lateral Raise",
            equipment: ["dumbbell", "machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Front Raise",
            equipment: ["dumbbell", "plate", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Rear Delt Fly",
            equipment: ["dumbbell", "machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Upright Row",
            equipment: ["barbell", "dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Machine Shoulder Press",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "75 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
    ],

    arms: [
        {
            name: "Barbell Curl",
            equipment: ["barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Hammer Curl",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Concentration Curl",
            equipment: ["dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "EZ Bar Curl",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Tricep Pushdown",
            equipment: ["machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Overhead Tricep Extension",
            equipment: ["dumbbell", "machine", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Bench Dips",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Skull Crushers",
            equipment: ["barbell", "dumbbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "6-8",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
    ],

    core: [
        {
            name: "Crunches",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "20",
                strength: "15",
                fat_loss: "25",
                general_fitness: "20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Leg Raises",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness", "muscle_gain"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "15",
                strength: "12",
                fat_loss: "20",
                general_fitness: "15",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Plank",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "60 sec",
                general_fitness: "45 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Russian Twists",
            equipment: ["bodyweight", "dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "20",
                strength: "16",
                fat_loss: "24",
                general_fitness: "20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Mountain Climbers",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "20 sec",
                fat_loss: "40 sec",
                general_fitness: "30 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Bicycle Crunch",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "20",
                strength: "16",
                fat_loss: "30",
                general_fitness: "20",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Hanging Knee Raise",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["muscle_gain", "general_fitness", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
    ],

    full_body: [
        {
            name: "Squats",
            equipment: ["bodyweight", "barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "10-12",
                strength: "4-6",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Push Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "12-15",
                strength: "10-12",
                fat_loss: "15-20",
                general_fitness: "12-15",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Pull Ups",
            equipment: ["bodyweight", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "8-10",
                strength: "5-8",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Dumbbell Row",
            equipment: ["dumbbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "muscle_gain", "fat_loss"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "10-12",
                strength: "8-10",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "45 sec",
                strength: "60 sec",
                fat_loss: "30 sec",
                general_fitness: "45 sec",
            },
        },
        {
            name: "Shoulder Press",
            equipment: ["dumbbell", "barbell", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "muscle_gain", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "8-12",
                strength: "5-6",
                fat_loss: "12-15",
                general_fitness: "10-12",
            },
            rest: {
                muscle_gain: "60 sec",
                strength: "90 sec",
                fat_loss: "45 sec",
                general_fitness: "60 sec",
            },
        },
        {
            name: "Deadlift",
            equipment: ["barbell", "gym"],
            levels: ["intermediate", "advanced"],
            goals: ["strength", "muscle_gain"],
            sets: { beginner: 3, intermediate: 4, advanced: 5 },
            reps: {
                muscle_gain: "6-8",
                strength: "3-5",
                fat_loss: "10-12",
                general_fitness: "8-10",
            },
            rest: {
                muscle_gain: "90 sec",
                strength: "120 sec",
                fat_loss: "60 sec",
                general_fitness: "75 sec",
            },
        },
        {
            name: "Mountain Climbers",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["fat_loss", "general_fitness"],
            sets: { beginner: 3, intermediate: 4, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "20 sec",
                fat_loss: "40 sec",
                general_fitness: "30 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
        {
            name: "Plank",
            equipment: ["bodyweight", "gym"],
            levels: ["beginner", "intermediate", "advanced"],
            goals: ["general_fitness", "fat_loss", "strength"],
            sets: { beginner: 3, intermediate: 3, advanced: 4 },
            reps: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "60 sec",
                general_fitness: "45 sec",
            },
            rest: {
                muscle_gain: "30 sec",
                strength: "45 sec",
                fat_loss: "20 sec",
                general_fitness: "30 sec",
            },
        },
    ],
};

/**
 * Get exercises filtered by body part, level, goal, and equipment.
 */
const getFilteredExercises = ({
    bodyPart,
    level,
    goal,
    equipment,
}) => {
    const exercisePool = EXERCISE_LIBRARY[bodyPart] || EXERCISE_LIBRARY.full_body;

    let filtered = exercisePool.filter((exercise) =>
        exercise.levels.includes(level)
    );

    filtered = filtered.filter((exercise) =>
        exercise.goals.includes(goal)
    );

    if (equipment && equipment !== "gym") {
        filtered = filtered.filter((exercise) =>
            exercise.equipment.includes(equipment)
        );
    }

    if (!filtered.length) {
        filtered = exercisePool.filter((exercise) =>
            exercise.levels.includes(level)
        );
    }

    if (!filtered.length) {
        filtered = exercisePool;
    }

    return filtered;
};

/**
 * Build warmup based on goal and duration.
 */
const buildWarmUp = (goal, duration) => {
    const safeDuration = Number(duration) || 30;

    if (goal === "strength") {
        return {
            name: "Warm Up",
            sets: 1,
            reps:
                safeDuration >= 45
                    ? "8 min treadmill walk + dynamic mobility + light warm-up sets"
                    : "5 min treadmill walk + mobility + light warm-up sets",
            rest: "-",
        };
    }

    if (goal === "fat_loss") {
        return {
            name: "Warm Up",
            sets: 1,
            reps:
                safeDuration >= 45
                    ? "8 min brisk cardio + active mobility"
                    : "5 min brisk cardio + dynamic mobility",
            rest: "-",
        };
    }

    return {
        name: "Warm Up",
        sets: 1,
        reps:
            safeDuration >= 45
                ? "8 min light cardio + joint mobility"
                : "5 min light cardio + mobility",
        rest: "-",
    };
};

/**
 * Build cooldown based on goal.
 */
const buildCoolDown = (goal) => {
    if (goal === "strength") {
        return {
            name: "Cool Down",
            sets: 1,
            reps: "5-8 min walking + lower intensity stretching",
            rest: "-",
        };
    }

    if (goal === "fat_loss") {
        return {
            name: "Cool Down",
            sets: 1,
            reps: "5 min walking + recovery breathing + stretches",
            rest: "-",
        };
    }

    return {
        name: "Cool Down",
        sets: 1,
        reps: "5 min stretching and mobility recovery",
        rest: "-",
    };
};

/**
 * Generate recommendation note.
 */
const buildRecommendationNote = ({ goal, level, bodyPart, equipment }) => {
    if (goal === "fat_loss") {
        return `This ${bodyPart.replace("_", " ")} session is designed to keep your heart rate up. Use controlled movement, shorter rest, and consistent pace. Since your level is ${level}, focus on technique before speed.`;
    }

    if (goal === "muscle_gain") {
        return `This ${bodyPart.replace("_", " ")} plan focuses on hypertrophy. Choose weights that challenge the final reps while keeping your form clean. Since you selected ${equipment}, the exercise mix is adjusted around that setup.`;
    }

    if (goal === "strength") {
        return `This workout emphasizes stronger compound movement patterns. Keep rest periods slightly longer, prioritize quality reps, and increase load gradually over time. As a ${level} trainee, progression should stay controlled and consistent.`;
    }

    return `This ${bodyPart.replace("_", " ")} workout is structured for balanced development and consistency. Focus on steady tempo, good posture, and smooth execution across all exercises.`;
};

/**
 * Map exercise into final output using goal + level.
 */
const mapExerciseForPlan = (exercise, goal, level) => {
    return {
        name: exercise.name,
        sets: exercise.sets[level] || 3,
        reps: exercise.reps[goal] || "10-12",
        rest: exercise.rest[goal] || "45 sec",
    };
};

/**
 * Pro-level workout plan builder.
 */
const buildWorkoutPlan = ({
    goal,
    bodyPart,
    level,
    duration,
    equipment,
}) => {
    const safeGoal = normalizeText(goal) || "general_fitness";
    const safeBodyPart = normalizeText(bodyPart) || "full_body";
    const safeLevel = normalizeText(level) || "beginner";
    const safeEquipment = normalizeText(equipment) || "gym";
    const safeDuration = Number(duration) > 0 ? Number(duration) : 30;

    const exerciseCount = getExerciseCountByDuration(safeDuration);

    const filteredExercises = getFilteredExercises({
        bodyPart: safeBodyPart,
        level: safeLevel,
        goal: safeGoal,
        equipment: safeEquipment,
    });

    const randomizedExercises = shuffleArray(filteredExercises)
        .slice(0, exerciseCount)
        .map((exercise) => mapExerciseForPlan(exercise, safeGoal, safeLevel));

    const warmUp = buildWarmUp(safeGoal, safeDuration);
    const coolDown = buildCoolDown(safeGoal);
    const note = buildRecommendationNote({
        goal: safeGoal,
        level: safeLevel,
        bodyPart: safeBodyPart,
        equipment: safeEquipment,
    });

    return {
        title: `${safeLevel.replace("_", " ")} ${safeBodyPart.replace("_", " ")} workout`,
        goal: safeGoal,
        level: safeLevel,
        bodyPart: safeBodyPart,
        duration: safeDuration,
        equipment: safeEquipment,
        note,
        exercises: [warmUp, ...randomizedExercises, coolDown],
    };
};

/**
 * GET /api/workout-plans/status
 * Returns current membership + daily usage info for the logged-in member.
 */
export const getWorkoutPlanStatus = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const dateKey = getDateKey();
        const activeMembership = await getActiveMembership(userId);
        const usage = await WorkoutPlanUsage.findOne({ user: userId, dateKey });

        const usedToday = usage?.count || 0;
        const isMembershipUser = !!activeMembership;

        return res.json({
            success: true,
            isMembershipUser,
            usedToday,
            freeDailyLimit: FREE_DAILY_LIMIT,
            remaining: isMembershipUser
                ? "unlimited"
                : Math.max(0, FREE_DAILY_LIMIT - usedToday),
            membershipExpiresAt: activeMembership?.expiresAt || null,
            subscription: activeMembership || null,
        });
    } catch (error) {
        console.error("getWorkoutPlanStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch workout plan status",
            error: error.message,
        });
    }
};

/**
 * POST /api/workout-plans/generate
 */
export const generateWorkoutPlan = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            goal = "",
            bodyPart = "",
            level = "",
            duration = 30,
            equipment = "",
        } = req.body || {};

        const dateKey = getDateKey();
        const activeMembership = await getActiveMembership(userId);
        const isMembershipUser = !!activeMembership;

        let usage = await WorkoutPlanUsage.findOne({ user: userId, dateKey });
        const usedToday = usage?.count || 0;

        if (!isMembershipUser && usedToday >= FREE_DAILY_LIMIT) {
            return res.status(403).json({
                success: false,
                message:
                    "You have reached your free daily limit. Buy membership for unlimited workout plan generation.",
                isMembershipUser: false,
                usedToday,
                freeDailyLimit: FREE_DAILY_LIMIT,
                remaining: 0,
            });
        }

        const plan = buildWorkoutPlan({
            goal,
            bodyPart,
            level,
            duration,
            equipment,
        });

        if (!usage) {
            usage = await WorkoutPlanUsage.create({
                user: userId,
                dateKey,
                count: 1,
            });
        } else {
            usage.count += 1;
            await usage.save();
        }

        return res.status(200).json({
            success: true,
            message: "Workout plan generated successfully.",
            isMembershipUser,
            usedToday: usage.count,
            freeDailyLimit: FREE_DAILY_LIMIT,
            remaining: isMembershipUser
                ? "unlimited"
                : Math.max(0, FREE_DAILY_LIMIT - usage.count),
            membershipExpiresAt: activeMembership?.expiresAt || null,
            plan,
        });
    } catch (error) {
        console.error("generateWorkoutPlan error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate workout plan",
            error: error.message,
        });
    }
};